// client/src/store/userSlice.js
// Thin re-export shim — the actual slice now lives in @yehgs/icvng-core
// (its reducer is mounted via coreReducers in store.js). Kept so the ~19
// files across the app importing named actions from '../store/userSlice'
// don't all need their import paths changed in this pass.
export * from "@yehgs/icvng-core/store";
