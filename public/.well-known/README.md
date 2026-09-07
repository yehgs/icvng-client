# App Link / Universal Link verification files

These two files let iOS and Android route a tap on the emailed
verification link (`https://<country-domain>/verify-email?code=...`,
see `server/controllers/user.controller.js`) directly into the
`icvng-mobile` app instead of opening a browser. Neither file can
contain comments (both formats are strict JSON per Apple/Google's
spec), so the placeholders that need real values before this actually
works are documented here instead:

## `apple-app-site-association`
- `TEAMID_PLACEHOLDER` → your Apple Developer Team ID (found in
  App Store Connect / developer.apple.com's membership page)
- `com.calstins.icvng` → confirm this matches the app's real bundle
  identifier once registered (currently set from `icvng-mobile/app.json`'s
  `ios.bundleIdentifier`)
- The `paths` list only covers `/verify-email` and `/reset-password` —
  add more if other links (order tracking, etc.) should also open the
  app directly

## `assetlinks.json`
- `SHA256_FINGERPRINT_PLACEHOLDER` → the SHA-256 fingerprint of the
  signing certificate used for the Play Store release build (get this
  via `keytool -list -v` on the release keystore, or from Play Console's
  App Signing page after the first upload)
- `com.calstins.icvng` → confirm this matches
  `icvng-mobile/app.json`'s `android.package`

## What this does NOT do yet
Filling in the placeholders above is necessary but not sufficient —
`icvng-mobile/app.json` also needs `ios.associatedDomains` and
`android.intentFilters` configured for each real production domain
(see that file's own comments), and Apple/Google's verification of
these files can only be confirmed by installing a real build on a
device and tapping an actual emailed link — nothing about this can be
verified from a sandboxed environment without a live, deployed domain.

## Multi-country note
ICVNG serves four country domains (i-coffee.ng, i-coffee.tg,
i-coffee.bj, i-coffee.it) from this one client deployment via
domain-based country detection — see server/middleware/countryDetect.js.
Since all four are (presumably) attached as domains to the same Vercel
project, this one shared `.well-known` folder is served correctly under
all of them automatically; you do not need separate files per domain.
`icvng-mobile/app.json` does list all four separately, though — iOS and
Android verify each domain independently against its own attached
files, even when the files themselves are identical.

## reset-password is registered at the OS level but not yet routed
`icvng-mobile/app.json`'s Android intentFilters and iOS associatedDomains
both include `/reset-password` paths, so the OS will offer to open this
app for that link — but `icvng-mobile/src/navigation/linking.js`
deliberately doesn't map it to a screen yet, since no
ResetPasswordScreen exists. Tapping a reset-password link today will
open the app to whatever its default route is, not a working
reset-password flow. Add the screen and its `linking.js` entry (same
pattern as verify-email) before relying on this.
