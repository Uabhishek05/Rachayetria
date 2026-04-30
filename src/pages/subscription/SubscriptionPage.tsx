import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageTitle } from '@/components/ui/PageTitle';
import { Button } from '@/components/ui/Button';
import { useCatalogData } from '@/hooks/useCatalogData';
import { useAuth } from '@/features/auth/AuthContext';
import type { SubscriptionPlan } from '@/types/domain';
import {
  createRazorpayOrder,
  ensureRazorpayLoaded,
  isPaidTier,
  verifyRazorpayPayment,
} from '@/features/subscription/payment.service';

export function SubscriptionPage() {
  const { plans, loading } = useCatalogData();
  const { user, refreshProfile } = useAuth();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (!isPaidTier(plan.id)) {
      return;
    }
    const paidPlanId = plan.id;

    if (!user) {
      toast.error('Please sign in to upgrade your plan.');
      return;
    }

    if (user.subscriptionTier === plan.id) {
      toast('You are already on this plan.');
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      await ensureRazorpayLoaded();
      const order = await createRazorpayOrder(paidPlanId);

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK unavailable');
      }

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Rachayetria',
        description: `${order.planName} subscription`,
        prefill: {
          name: user.displayName,
          email: user.email,
        },
        theme: {
          color: '#6C3BFF',
        },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              planId: paidPlanId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await refreshProfile();
            toast.success(`Payment successful. ${plan.name} activated.`);
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Payment verification failed';
            toast.error(message);
          } finally {
            setProcessingPlanId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPlanId(null);
            toast('Payment cancelled.');
          },
        },
      });

      checkout.open();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not start payment';
      toast.error(message);
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <PageTitle title="Subscription" subtitle="Netflix style plans with premium lock and upgrade CTA." />
      {loading ? <p className="mb-4 text-sm text-gray-500">Loading plans...</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="card-hover rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold">{plan.name}</h2>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900">
              <span className="mr-1 text-2xl align-top text-gray-700">Rs</span>
              {plan.priceInr.toLocaleString('en-IN')}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {plan.benefits.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
            <Button
              className="mt-4 w-full"
              disabled={
                plan.id === 'free' ||
                user?.subscriptionTier === plan.id ||
                (processingPlanId !== null && processingPlanId !== plan.id)
              }
              onClick={() => {
                void handleUpgrade(plan);
              }}
            >
              {plan.id === 'free' || user?.subscriptionTier === plan.id
                ? 'Current Plan'
                : processingPlanId === plan.id
                  ? 'Processing...'
                  : 'Upgrade'}
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
