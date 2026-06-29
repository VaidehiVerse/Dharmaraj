import { apiClient } from "./api";

const CHECKOUT_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

export function loadRazorpayScript() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => reject(new Error("Could not load Razorpay")));
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Could not load Razorpay checkout"));
    document.body.appendChild(script);
  });
}

async function cancelPendingOrder(razorpayOrderId) {
  if (!razorpayOrderId) return;
  try {
    await apiClient.post("/razorpay/cancel", { razorpay_order_id: razorpayOrderId });
  } catch {
    // Best-effort cleanup when the user abandons checkout.
  }
}

/**
 * Creates a server-side Razorpay order, opens Checkout, verifies the signature on success.
 * Returns the internal Dharmaraj order id (e.g. DA12345678).
 */
export async function startRazorpayCheckout({ checkoutPayload, address }) {
  await loadRazorpayScript();

  const { data } = await apiClient.post("/razorpay/create-order", checkoutPayload);
  const keyId = data.key_id || process.env.REACT_APP_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID to backend/.env.");
  }
  if (!data.razorpay_order_id || !data.amount) {
    throw new Error("Invalid payment session from server.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      fn(value);
    };

    const rzp = new window.Razorpay({
      key: keyId,
      amount: data.amount,
      currency: data.currency || "INR",
      name: "Dharmaraj Ayurveda",
      description: "Wellness order",
      order_id: data.razorpay_order_id,
      prefill: {
        name: address.full_name,
        email: address.email,
        contact: address.mobile,
      },
      theme: { color: "#2d5e3e" },
      handler: async (response) => {
        try {
          const { data: verified } = await apiClient.post("/razorpay/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          finish(resolve, verified.order_id || data.order_id);
        } catch (err) {
          await cancelPendingOrder(data.razorpay_order_id);
          finish(reject, err);
        }
      },
      modal: {
        ondismiss: async () => {
          await cancelPendingOrder(data.razorpay_order_id);
          finish(reject, new Error("Payment cancelled"));
        },
      },
    });

    rzp.on("payment.failed", async (resp) => {
      await cancelPendingOrder(data.razorpay_order_id);
      finish(reject, new Error(resp.error?.description || "Payment failed"));
    });

    rzp.open();
  });
}
