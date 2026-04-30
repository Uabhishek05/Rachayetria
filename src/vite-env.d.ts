/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_FIREBASE_API_KEY: string;
	readonly VITE_FIREBASE_AUTH_DOMAIN: string;
	readonly VITE_FIREBASE_PROJECT_ID: string;
	readonly VITE_FIREBASE_STORAGE_BUCKET: string;
	readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
	readonly VITE_FIREBASE_APP_ID: string;
	readonly VITE_FUNCTIONS_BASE_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface RazorpayPaymentSuccessResponse {
	razorpay_order_id: string;
	razorpay_payment_id: string;
	razorpay_signature: string;
}

interface RazorpayInstance {
	open: () => void;
}

interface RazorpayOptions {
	key: string;
	amount: number;
	currency: string;
	order_id: string;
	name?: string;
	description?: string;
	prefill?: {
		name?: string;
		email?: string;
		contact?: string;
	};
	theme?: {
		color?: string;
	};
	modal?: {
		ondismiss?: () => void;
	};
	handler?: (response: RazorpayPaymentSuccessResponse) => void;
}

interface Window {
	Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
}
