// Lets Android open links on this site in the Instanta app (App Links).
// Set ANDROID_APP_PACKAGE and ANDROID_APP_CERT_SHA256 (the release signing
// key's SHA-256 fingerprint, comma-separated if there are several). Without
// them this answers 404 and links stay in the browser.
export function GET() {
  const pkg = process.env.ANDROID_APP_PACKAGE?.trim();
  const fingerprints = (process.env.ANDROID_APP_CERT_SHA256 ?? "")
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);
  if (!pkg || fingerprints.length === 0) {
    return new Response("Not found", { status: 404 });
  }
  return Response.json([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: { namespace: "android_app", package_name: pkg, sha256_cert_fingerprints: fingerprints },
    },
  ]);
}
