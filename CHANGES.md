# icvng-client — menu overflow cue + storefront i18n pass

Unzip over the repo root (paths are relative to icvng-client/). 49 files.

## After merging
1. Other languages (es, pt, nl, ar, hi, zh) still lack ~360 keys and fall back to English:
   `node scripts/translateUiLocales.js --app=client`   (server repo, needs OPENAI_API_KEY)
2. Push the locale files into the DB so they appear on Admin → UI Copy Translations:
   `node scripts/seedUiTranslations.js --app=client`   (server repo)
   fr and it are already complete (hand-translated), so step 2 alone fixes French/Italian.

## Notes
- New keys live in the existing namespaces plus: contactPage, authModal, userMenu, paymentCancel,
  reviews, confirmBox, storefront, notFound, productPage, authFlow, currencyNames, pageLabels.
- Contact page: CMS value wins; if it is still the untouched English default, the UI-copy key is used.
