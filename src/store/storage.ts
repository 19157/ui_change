const STORAGE_KEY = localStorage;

export const getStorage = <T>(key: string): T | null => {
  let data = STORAGE_KEY.getItem(key);
  if (data) {
    try {
      data = JSON.parse(data);
      return data as T;
    } catch {
      return data as T;
    }
  } else {
    return null;
  }
};

export const setStorage = (key: string, value: any) => {
  STORAGE_KEY.setItem(key, JSON.stringify(value));
};

export const removeStorage = (key: string) => {
  STORAGE_KEY.removeItem(key);
};

export const clearStorage = () => {
  // const userInfo = getStorage("userInfo");
  STORAGE_KEY.clear();
  sessionStorage.clear();
  // if (userInfo) {
  //   setStorage("userInfo", userInfo);
  // }
};

export const getSession = <T>(key: string): T | null => {
  let data = sessionStorage.getItem(key);
  if (data) {
    try {
      data = JSON.parse(data);
      return data as T;
    } catch {
      return data as T;
    }
  } else {
    return null;
  }
};

export const setSession = (key: string, value: any) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};

export const removeSession = (key: string) => {
  sessionStorage.removeItem(key);
};
