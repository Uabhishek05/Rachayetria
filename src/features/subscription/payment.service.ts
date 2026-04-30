import { firebaseAuth } from '@/lib/firebase';
import type { SubscriptionTier } from '@/types/domain';

type PaidSubscriptionTier = Exclude<SubscriptionTier, 'free'>;

const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-script';
const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

interface ErrorResponse {
  error?: string;
}

export interface RazorpayOrderResponse {
  ok: true;
  keyId: string;
  planId: PaidSubscriptionTier;
  planName: string;
  orderId: string;
  amount: number;
  currency: string;
}

export interface RazorpayVerifyPayload {
  planId: PaidSubscriptionTier;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

function getFunctionsBaseUrl() {
  const explicitBase = String(import.meta.env.VITE_FUNCTIONS_BASE_URL ?? '').trim();
  if (explicitBase) {
    return explicitBase.replace(/\/$/, '');
  }

  const projectId = String(import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '').trim();
  if (!projectId) {
    throw new Error('Missing VITE_FUNCTIONS_BASE_URL or VITE_FIREBASE_PROJECT_ID');
  }

  return `https://us-central1-${projectId}.cloudfunctions.net/api`;
}

async function postWithAuth<TResponse>(path: string, body: object): Promise<TResponse> {
  const currentUser = firebaseAuth.currentUser;
  if (!currentUser) {
    throw new Error('Please sign in to continue.');
  }

  const idToken = await currentUser.getIdToken();
  const response = await fetch(`${getFunctionsBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as TResponse & ErrorResponse;
  if (!response.ok) {
    throw new Error(data.error ?? 'Request failed');
  }

  return data;
}

export async function ensureRazorpayLoaded() {
  if (window.Razorpay) {
    return;
  }

  const existing = document.getElementById(RAZORPAY_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay SDK')), {
        once: true,
      });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });
}

export function isPaidTier(tier: SubscriptionTier): tier is PaidSubscriptionTier {
  return tier === 'monthly' || tier === 'yearly';
}

export async function createRazorpayOrder(planId: PaidSubscriptionTier) {
  return postWithAuth<RazorpayOrderResponse>('/payments/razorpay/order', { planId });
}

export async function verifyRazorpayPayment(payload: RazorpayVerifyPayload) {
  return postWithAuth<{ ok: true; subscriptionTier: PaidSubscriptionTier }>(
    '/payments/razorpay/verify',
    payload,
  );
}