  import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { tokenBucketLimiter } from './rateLimit.js';

admin.initializeApp();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.set('trust proxy', 1);

app.use(tokenBucketLimiter);

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true, service: 'rachayetria-functions' });
});

const SUBSCRIPTION_PLANS = {
  monthly: { amountInr: 499, label: 'Premium Monthly' },
  yearly: { amountInr: 4999, label: 'Premium Yearly' },
};

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization ?? '');
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice('Bearer '.length).trim();
}

async function requireUserId(req, res) {
  const idToken = getBearerToken(req);
  if (!idToken) {
    res.status(401).json({ error: 'Missing auth token' });
    return null;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    res.status(401).json({ error: 'Invalid auth token' });
    return null;
  }
}

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

function safeEqual(a, b) {
  const first = Buffer.from(String(a));
  const second = Buffer.from(String(b));
  if (first.length !== second.length) {
    return false;
  }
  return crypto.timingSafeEqual(first, second);
}

app.post('/payments/razorpay/order', async (req, res) => {
  const uid = await requireUserId(req, res);
  if (!uid) {
    return;
  }

  const planId = String(req.body?.planId ?? '');
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    res.status(400).json({ error: 'Invalid plan selected' });
    return;
  }

  let razorpay;
  try {
    razorpay = getRazorpayClient();
  } catch (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  try {
    const createdOrder = await razorpay.orders.create({
      amount: plan.amountInr * 100,
      currency: 'INR',
      receipt: `sub_${uid}_${Date.now()}`,
      notes: {
        uid,
        planId,
      },
    });

    res.status(200).json({
      ok: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      planId,
      planName: plan.label,
      orderId: createdOrder.id,
      amount: createdOrder.amount,
      currency: createdOrder.currency,
    });
  } catch {
    res.status(502).json({ error: 'Failed to create payment order' });
  }
});

app.post('/payments/razorpay/verify', async (req, res) => {
  const uid = await requireUserId(req, res);
  if (!uid) {
    return;
  }

  const planId = String(req.body?.planId ?? '');
  const orderId = String(req.body?.razorpay_order_id ?? '');
  const paymentId = String(req.body?.razorpay_payment_id ?? '');
  const signature = String(req.body?.razorpay_signature ?? '');

  if (!SUBSCRIPTION_PLANS[planId] || !orderId || !paymentId || !signature) {
    res.status(400).json({ error: 'Invalid payment payload' });
    return;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    res.status(500).json({ error: 'Razorpay secret not configured' });
    return;
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (!safeEqual(signature, expectedSignature)) {
    res.status(400).json({ error: 'Payment signature verification failed' });
    return;
  }

  try {
    await admin
      .firestore()
      .doc(`users/${uid}`)
      .set(
        {
          subscriptionTier: planId,
          subscriptionStatus: 'active',
          subscriptionUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastPaymentId: paymentId,
          lastOrderId: orderId,
        },
        { merge: true },
      );

    await admin.firestore().collection('payments').add({
      uid,
      planId,
      orderId,
      paymentId,
      signature,
      provider: 'razorpay',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true, subscriptionTier: planId });
  } catch {
    res.status(500).json({ error: 'Payment saved but subscription update failed' });
  }
});

app.post('/admin/set-role', async (req, res) => {
  const { uid, role } = req.body;
  if (typeof uid !== 'string' || (role !== 'admin' && role !== 'user')) {
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }
  await admin.auth().setCustomUserClaims(uid, { role });
  res.status(200).json({ ok: true });
});

app.post('/codex/infer', async (req, res) => {
  const prompt = String(req.body?.prompt ?? '');
  if (prompt.trim().length === 0) {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }
  res.status(200).json({
    ok: true,
    message: 'Stub endpoint: connect your OpenAI call here.',
    tokensEstimated: Math.ceil(prompt.length / 4),
  });
});

export const api = functions.https.onRequest(app);
