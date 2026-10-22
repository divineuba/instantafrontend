// Lets iOS open links on this site in the Instanta app (universal links).
// Set APPLE_APP_ID to "<Team ID>.<bundle id>". Without it this answers 404
// and links stay in the browser. The paths match the ones the app handles
// (mobile/lib/app/deep_links.dart and the Android intent filter).
const PATHS = [
  "/reset-password",
  "/verify-email",
  "/logistics/track",
  "/love/matches/*",
  "/love/matches",
  "/account/*",
  "/account",
  "/crypto/*",
  "/crypto",
  "/travels/payment",
  "/travels/confirmed",
];

export function GET() {
  const appId = process.env.APPLE_APP_ID?.trim();
  if (!appId) {
    return new Response("Not found", { status: 404 });
  }
  return Response.json({
    applinks: { details: [{ appIDs: [appId], components: PATHS.map((path) => ({ "/": path })) }] },
  });
}
