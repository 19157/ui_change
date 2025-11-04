import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

export const useChatRouter = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  // 静默导航 - 不触发组件重新挂载
  const silentNavigate = useCallback((path: any, options: any = {}, isDispatchPopstate?: boolean) => {
    const { replace = false, state = {} } = options;

    if (replace) {
      window.history.replaceState(state, "", path);
    } else {
      window.history.pushState(state, "", path);
    }

    if (isDispatchPopstate && isDispatchPopstate === true) {
    } else {
      // 手动触发路由监听
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }, []);

  // 创建新对话
  const createNewChat = useCallback(() => {
    // silentNavigate("/chat/new");
  }, [silentNavigate]);

  // 切换到历史对话
  const switchToChat = useCallback(
    (targetSessionId: any) => {
      silentNavigate(`/chat/${targetSessionId}`);
    },
    [silentNavigate]
  );

  // 切换到历史对话，不触发路由监听
  const switchToChatNoDispatch = useCallback(
    (targetSessionId: any) => {
      silentNavigate(`/chat/${targetSessionId}`, {}, true);
    },
    [silentNavigate]
  );

  // 转换为永久会话
  const promoteToPermanent = useCallback(
    (permanentSessionId: any) => {
      silentNavigate(`/chat/${permanentSessionId}`, { replace: true });
    },
    [silentNavigate]
  );

  // 返回首页
  const goToHome = useCallback(() => {
    navigate("/chat");
  }, [navigate]);

  return {
    currentSessionId: sessionId,
    createNewChat,
    switchToChat,
    switchToChatNoDispatch,
    promoteToPermanent,
    goToHome,
    silentNavigate,
    navigate,
  };
};
