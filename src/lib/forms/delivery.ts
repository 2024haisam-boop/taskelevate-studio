import "server-only";

/** Email delivery is available only when ALL required server-side variables are present. */
export function getDeliveryConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  if (!apiKey || !to || !from) return null;
  return { apiKey, to: to.split(",").map((s) => s.trim()).filter(Boolean), from };
}

export function isDeliveryConfigured(): boolean {
  return getDeliveryConfig() !== null;
}
