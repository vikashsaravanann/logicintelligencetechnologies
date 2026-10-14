import type { Metadata } from "next";
import { getPaymentRequestByToken } from "@/lib/payments/db";
import { buildUpiUri, generateUpiQrDataUrl, LIT_PAYEE_CONFIG } from "@/lib/payments/upi";
import { PaymentPortalClient } from "./components/PaymentPortalClient";
import { PaymentErrorCard } from "./components/PaymentErrorCard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ secureToken: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { secureToken } = await params;
  return {
    title: "Secure Milestone Payment | Logic Intelligence Technologies",
    description: "Enterprise manual UPI clearing & settlement gateway for Logic Intelligence Technologies engagements.",
    robots: { index: false, follow: false },
    referrer: "no-referrer",
  };
}

export default async function PaymentPage({ params }: Props) {
  const { secureToken } = await params;

  if (!secureToken || typeof secureToken !== "string") {
    return <PaymentErrorCard reason="invalid_token" />;
  }

  const paymentData = await getPaymentRequestByToken(secureToken);

  if (!paymentData) {
    return <PaymentErrorCard reason="not_found" token={secureToken} />;
  }

  // Check expiration
  if (paymentData.request.expires_at) {
    const expiresMs = new Date(paymentData.request.expires_at).getTime();
    if (!isNaN(expiresMs) && expiresMs < Date.now()) {
      return <PaymentErrorCard reason="expired" token={secureToken} />;
    }
  }

  let upiUri: string | null = null;
  let qrDataUrl: string | null = null;

  // STRICT BILLING GATE: Only generate UPI URI and QR code if billing details are submitted!
  const hasBillingDetails =
    paymentData.billing !== null || paymentData.request.status !== "awaiting_billing_details";

  if (hasBillingDetails) {
    try {
      const payeeVpa = paymentData.beneficiary?.upi_id || LIT_PAYEE_CONFIG.upiId;
      const payeeName = paymentData.beneficiary?.account_holder_name || LIT_PAYEE_CONFIG.accountHolder;
      const totalRupees = Math.max(1, paymentData.request.total_payable_paise / 100);
      const stageLabel = paymentData.request.stage_number === 6 ? "Stage 6 Deposit" : "Stage 11 Delivery";
      const sanitizedTr = (paymentData.request.secure_token || secureToken).slice(0, 32);

      upiUri = buildUpiUri({
        pa: payeeVpa,
        pn: payeeName,
        am: totalRupees,
        cu: "INR",
        tr: sanitizedTr,
        tn: `LIT ${stageLabel}`.slice(0, 50),
      });

      qrDataUrl = await generateUpiQrDataUrl(upiUri);
    } catch (err) {
      console.error("[PaymentPage] Error generating UPI QR data URL:", err);
    }
  }

  return (
    <PaymentPortalClient
      paymentData={paymentData}
      upiUri={upiUri}
      qrDataUrl={qrDataUrl}
      token={secureToken}
    />
  );
}
