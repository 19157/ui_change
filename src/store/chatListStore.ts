import { createSlice } from "@reduxjs/toolkit";
import { getStorage, setStorage } from "@/store/storage";

const initialState = {
  chatListStore: getStorage("chatListStore") || [],
};

export const ChatListStore = createSlice({
  name: "chatListStore",
  initialState,
  reducers: {
    setChatListStore: (state, action) => {
      state.chatListStore = action.payload;
      setStorage("chatListStore", action.payload);
    },
  },
});
export const { setChatListStore } = ChatListStore.actions;
export default ChatListStore.reducer;
