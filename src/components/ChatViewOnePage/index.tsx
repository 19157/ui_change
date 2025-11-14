import { useEffect, useState, useRef } from "react";
import { getUniqId, scrollToTop, ActionViewItemEnum } from "@/utils";
import querySSE from "@/utils/querySSE";
import { handleTaskData, combineData } from "@/utils/chat";
import Dialogue from "@/components/Dialogue";
import GeneralInput from "@/components/GeneralInput";
import ActionView from "@/components/ActionView";
import { RESULT_TYPES } from "@/utils/constants";
import { useMemoizedFn } from "ahooks";
import classNames from "classnames";
import { Empty, Modal } from "antd";
import { SpinLoadingActionType } from "../SpinLoadingFunction";
import { getChatTestData } from "@/utils/chat_data";

type Props = {
  inputInfo: CHAT.TInputInfo;
  product: CHAT.Product;
  currentChat: any;
  isNewChat: boolean;
};

const ChatViewOnePage: GenieType.FC<Props> = (props) => {
  const { inputInfo: inputInfoProp, product } = props;
  const [taskList, setTaskList] = useState<MESSAGE.Task[]>([]);
  const chatList = useRef<CHAT.ChatItem[]>([]);
  const [activeTask, setActiveTask] = useState<CHAT.Task>();
  const [plan, setPlan] = useState<CHAT.Plan>();
  const [showAction, setShowAction] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLInputElement>(null);
  const actionViewRef = ActionView.useActionView();
  const [modal, contextHolder] = Modal.useModal();
  const spinLoadingRef = useRef<SpinLoadingActionType>({
    openSpinLoading: () => {},
    closeSpinLoading: () => {},
  });
  const [_, forceUpdate] = useState(0); // 用于强制更新

  const combineCurrentChat = (
    inputInfo: CHAT.TInputInfo,
    sessionId: string,
    requestId: string
  ): CHAT.ChatItem => {
    return {
      query: inputInfo.message!,
      files: inputInfo.files!,
      responseType: "txt",
      sessionId,
      requestId,
      loading: true,
      forceStop: false,
      tasks: [],
      thought: "",
      response: "",
      taskStatus: 0,
      tip: "已接收到你的任务，将立即开始处理...",
      multiAgent: { tasks: [] },
    };
  };

  // 深度思考
  const sendMessage = useMemoizedFn((inputInfo: CHAT.TInputInfo) => {
    const { message, deepThink, searchEnabled, outputStyle } = inputInfo;
    const sessionId = props.currentChat?.sessionId;
    const requestId = getUniqId();
    let currentChat = combineCurrentChat(inputInfo, sessionId, requestId);
    chatList.current = [...chatList.current, currentChat];
    setLoading(true);
    const params = {
      sessionId: sessionId,
      requestId: requestId,
      query: message,
      deepThink: deepThink ? 1 : 0,
      searchEnabled: searchEnabled ? 1 : 0,
      outputStyle,
    };
    console.log("sendMessage---params=", params);

    const handleMessage = (data: MESSAGE.Answer) => {
      const { finished, resultMap, packageType, status } = data;
      if (status === "tokenUseUp") {
        modal.info({
          title: "您的试用次数已用尽",
          content: "如需额外申请，请联系 liyang.1236@jd.com",
        });
        const taskData = handleTaskData(
          currentChat,
          deepThink,
          searchEnabled,
          currentChat.multiAgent
        );
        currentChat.loading = false;
        setLoading(false);

        setTaskList(taskData.taskList);
        return;
      }
      if (packageType !== "heartbeat") {
        requestAnimationFrame(() => {
          if (resultMap?.eventData) {
            currentChat = combineData(resultMap.eventData || {}, currentChat);
            const taskData = handleTaskData(
              currentChat,
              deepThink,
              searchEnabled,
              currentChat.multiAgent
            );
            setTaskList(taskData.taskList);
            temporaryChangeTask(taskData.taskList);
            updatePlan(taskData.plan!);
            openAction(taskData.taskList);
            if (finished) {
              currentChat.loading = false;
              setLoading(false);
            }
            const newChatList = [...chatList.current];
            newChatList.splice(newChatList.length - 1, 1, currentChat);
            chatList.current = newChatList;
          }
        });
        scrollToTop(chatRef.current!);
      }
    };

    const openAction = (taskList: MESSAGE.Task[]) => {
      if (
        taskList.filter((t) => !RESULT_TYPES.includes(t.messageType)).length
      ) {
        setShowAction(true);
      }
    };

    const handleError = (error: unknown) => {
      throw error;
    };

    const handleClose = () => {
      console.log("🚀 ~ close");
    };

    querySSE({
      body: params,
      handleMessage,
      handleError,
      handleClose,
    });
  });

  const temporaryChangeTask = (taskList: MESSAGE.Task[]) => {
    const task = taskList[taskList.length - 1] as CHAT.Task;
    if (!["task_summary", "result"].includes(task?.messageType)) {
      setActiveTask(task);
    }
  };

  const changeTask = (task: CHAT.Task) => {
    actionViewRef.current?.changeActionView(ActionViewItemEnum.follow);
    changeActionStatus(true);
    setActiveTask(task);
  };

  const updatePlan = (plan: CHAT.Plan) => {
    setPlan(plan);
  };

  const changeFile = (file: CHAT.TFile) => {
    changeActionStatus(true);
    actionViewRef.current?.setFilePreview(file);
  };

  const changePlan = () => {
    changeActionStatus(true);
    actionViewRef.current?.openPlanView();
  };

  const changeActionStatus = (status: boolean) => {
    setShowAction(status);
  };

  useEffect(() => {
    if (inputInfoProp.message?.length !== 0) {
      sendMessage(inputInfoProp);
    }
  }, [inputInfoProp, sendMessage]);

  useEffect(() => {
    console.log("ChatViewOnePage---props.currentChat=", props.currentChat);
    console.log("ChatViewOnePage---props.isNewChat=", props.isNewChat);
    if (props.isNewChat) {
    } else {
      loadingData();
    }
  }, [props.currentChat, props.isNewChat]);

  const loadingData = async () => {
    spinLoadingRef.current.openSpinLoading();
    setLoading(false);
    chatList.current = [];

    await new Promise((resolve, reject) => {
      setTimeout(() => {
        const data: any[] = getChatTestData();
        resolve(data);
      }, 1000);
    })
      .then((res: any) => {
        chatList.current = res;
      })
      .catch(() => {
        chatList.current = [];
      })
      .finally(() => {
        forceUpdate((prev) => prev + 1); // 强制重新渲染
        spinLoadingRef.current.closeSpinLoading();
      });
  };

  const renderMultAgent = () => {
    return (
      <div className="h-full w-full flex justify-center">
        <div
          className={classNames("p-24 flex flex-col flex-1 w-0", {
            "max-w-[1200px]": !showAction,
          })}
          id="chat-view"
        >
          <div
            className="w-full flex-1 overflow-auto no-scrollbar mb-[36px]"
            ref={chatRef}
          >
            {chatList.current.length > 0 ? (
              chatList.current.map((chat) => {
                return (
                  <div key={chat.sessionId}>
                    <Dialogue
                      chat={chat}
                      deepThink={inputInfoProp.deepThink}
                      changeTask={changeTask}
                      changeFile={changeFile}
                      changePlan={changePlan}
                    />
                  </div>
                );
              })
            ) : (
              <div className="flex flex-1 h-full w-full justify-center items-center">
                <Empty description="暂无对话" />
              </div>
            )}
          </div>
          <GeneralInput
            placeholder={
              loading ? "任务进行中" : "希望 华夏研究 为你做哪些任务呢？"
            }
            showBtn={false}
            size="medium"
            disabled={loading}
            product={product}
            // 多轮问答也不支持切换deepThink，使用传进来的
            send={(info) =>
              sendMessage({
                ...info,
                deepThink: inputInfoProp.deepThink,
                searchEnabled: inputInfoProp.searchEnabled, // 多轮问答也不支持切换searchEnabled，使用传进来的
              })
            }
            newSessionId={props.currentChat?.sessionId}
          />
        </div>
        {contextHolder}
        <div
          className={classNames("transition-all w-0", {
            "opacity-0 overflow-hidden": !showAction,
            "flex-1": showAction,
          })}
        >
          <ActionView
            activeTask={activeTask}
            taskList={taskList}
            plan={plan}
            ref={actionViewRef}
            onClose={() => changeActionStatus(false)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex justify-center">{renderMultAgent()}</div>
  );
};

export default ChatViewOnePage;
