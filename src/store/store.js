import { configureStore } from "@reduxjs/toolkit";
import { coreReducers } from "@yehgs/icvng-core/store";

export const store = configureStore({
  reducer: {
    ...coreReducers,
  },
});
