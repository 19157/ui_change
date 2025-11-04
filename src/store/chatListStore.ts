import { createSlice } from "@reduxjs/toolkit";
import { getStorage, setStorage } from "@/store/storage";

const initialState = {
  chatListStore: getStorage("chatListStore") || [],
  currentChatStore: getStorage("currentChatStore") || null,
  currentChatIdStore: getStorage("currentChatIdStore") || "",
};

export const ChatListStore = createSlice({
  name: "chatListStore",
  initialState,
  reducers: {
    setChatListStore: (state, action) => {
      state.chatListStore = action.payload;
      setStorage("chatListStore", action.payload);
    },
    setCurrentChatStore: (state, action) => {
      state.currentChatStore = action.payload;
      setStorage("currentChatStore", action.payload);
    },
    setCurrentChatIdStore: (state, action) => {
      state.currentChatIdStore = action.payload;
      setStorage("currentChatIdStore", action.payload);
    },
  },
});
export const { setChatListStore, setCurrentChatStore, setCurrentChatIdStore } =
  ChatListStore.actions;
export default ChatListStore.reducer;
