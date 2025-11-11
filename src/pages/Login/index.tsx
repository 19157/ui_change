import { setToken } from "@/store/user";
import { useDispatch } from "react-redux";

const Login: GenieType.FC = () => {
  const dispatch = useDispatch();
  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div
        className="text-blue-600 font-bold text-2xl cursor-pointer"
        onClick={() => {
          dispatch(setToken("dukun"));
        }}
      >
        登录（统一认证）
      </div>
    </div>
  );
};

Login.displayName = "Login";

export default Login;
