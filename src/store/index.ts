import { configureStore } from "@reduxjs/toolkit";
import user from "./user";
import chatListStore from "./chatListStore";

export const store = configureStore({
  reducer: { user, chatListStore },
});
