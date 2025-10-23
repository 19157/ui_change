import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStorage, setStorage, removeStorage } from "@/store/storage";
import axios from "axios";

// 异步函数
export const loadUserInfo: any = createAsyncThunk(
  "userInfo/loadUserInfo",
  async () => {
    const res: any = await axios.get("https://api.example.com/data");
    return await res.json();
  }
);

const initialState = {
  userInfo: getStorage("userInfo") || {
    name: 'dk',
    url: 'https://seopic.699pic.com/photo/50061/5616.jpg_wh1200.jpg',
  },
  token: getStorage("token") || "",
};

export const UserInfo = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      setStorage("userInfo", action.payload);
    },
    setToken: (state, action) => {
      state.token = action.payload;
      setStorage("token", action.payload);
    },
    // 退出
    clearUser: (state) => {
      state.userInfo = {};
      state.token = "";
      removeStorage("userInfo");
      removeStorage("token");
    },
  },
  extraReducers(builder) {
    builder.addCase(loadUserInfo.fulfilled, (state, action) => {
      state.userInfo = action.payload;
    });
  },
});
export const { setUserInfo, clearUser, setToken } = UserInfo.actions;
export default UserInfo.reducer;
