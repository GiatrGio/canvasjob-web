export const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/canvasjob/pmifdfegffmfaoolaegjabcoadihhkhl";

export function chromeWebStoreUrl(campaign: string) {
  const url = new URL(CHROME_WEB_STORE_URL);
  url.searchParams.set("utm_source", "canvasjob.com");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", campaign);
  return url.toString();
}
