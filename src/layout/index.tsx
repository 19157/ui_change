import { memo, useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import {
  Avatar,
  ConfigProvider,
  Dropdown,
  MenuProps,
  message,
  Modal,
  Tooltip,
} from "antd";
import { ConstantProvider } from "@/hooks";
import * as constants from "@/utils/constants";
import { getSessionId, setMessage } from "@/utils";
import "./index.css";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { setChatListStore } from "@/store/chatListStore";
import { Logo } from "@/components";

type ChatType = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

// Layout 组件：应用的主要布局结构
const Layout: GenieType.FC = memo(() => {
  const [messageApi, messageContent] = message.useMessage();
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();
  const location = useParams();
  const dispatch = useDispatch();
  // const [chatList, setChatList] = useState<ChatType[]>([]);
  const { chatListStore } = useSelector((state: any) => state.chatListStore);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const [showList, setShowList] = useState<boolean>(true); // 是否隐藏侧边栏标志
  const { userInfo } = useSelector((state: any) => state.user); // 用户信息

  const items: MenuProps["items"] = [
    {
      key: "logout",
      label: "退出登录",
    },
  ];

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      modal.confirm({
        title: "确定要退出吗？",
        content: "确定要退出吗？",
        okText: "确定",
        cancelText: "取消",
        onOk() {},
        onCancel() {},
      });
    }
  };

  const deleteItem = (id: string) => {
    modal.confirm({
      title: "确定要删除会话吗？",
      content: "确定要删除会话吗？",
      okText: "确定",
      cancelText: "取消",
      onOk() {
        const newList = chatListStore.filter((itemChat: any) => itemChat.id !== id);
        dispatch(setChatListStore(newList));
        if (currentChat?.id === id) {
          navigateHome();
        }
      },
      onCancel() {},
    });
  };

  useEffect(() => {
    // 初始化全局 message
    setMessage(messageApi);
  }, [messageApi]);

  useEffect(() => {
    if (!chatListStore || chatListStore.length <= 0) {
      loadChats();
    }
  }, []);

  const loadChats = async () => {
    const list: any[] = [];
    for (let index = 0; index < 20; index++) {
      let sessionId = getSessionId();
      list.push({
        id: sessionId,
        title: "chat_" + (index + 1) + "_" + sessionId,
        createdAt: "2025-10-11 16:50:00",
        updatedAt: "2025-10-11 16:50:00",
      });
    }
    dispatch(setChatListStore(list));
  };

  const navigateHome = () => {
    // setCurrentChat(null);
    // navigate("/", { replace: true });
    navigate("/");
  };

  const navigateChat = (chat: any) => {
    // setCurrentChat(chat);
    // navigate(`/chat/${chat.id}`, { replace: true });
    navigate(`/chat/${chat.id}`);
  };

  useEffect(() => {
    console.log("layout---location.sessionId=", location.sessionId);
    if (location.sessionId) {
      const chatItem = chatListStore.find(
        (itemChat: any) => itemChat.id === location.sessionId
      );
      if (chatItem) {
        setCurrentChat(chatItem);
      } else {
        messageApi.info("该会话不存在");
        setCurrentChat(null);
      }
    } else {
      setCurrentChat(null);
    }
  }, [location.sessionId]);

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#4040FFB2" } }}>
      {messageContent}
      {contextHolder}
      {/* 暂时只有静态的 */}
      <ConstantProvider value={constants}>
        <div className="app">
          {showList && (
            <div className="chat-history">
              <div className="chat-history-header">
                {/* <Logo/> */}
                <div className="chat-history-header-icon">
                  <Tooltip placement="bottomLeft" title={"收起对话记录"}>
                    <MenuFoldOutlined
                      className="new-chat-close"
                      onClick={() => {
                        setShowList(!showList);
                      }}
                    />
                  </Tooltip>
                  <Tooltip placement="bottomLeft" title={"开启新会话"}>
                    <PlusCircleOutlined
                      className="new-chat-btn"
                      onClick={() => {
                        if (!currentChat) {
                          return;
                        } else {
                          navigateHome();
                        }
                      }}
                    />
                  </Tooltip>
                </div>
              </div>
              <div className="chat-list-container">
                <div className="chat-list">
                  {chatListStore && chatListStore.length > 0 ? (
                    chatListStore.map((chat: any) => (
                      <div
                        key={chat.id}
                        className={`chat-item ${currentChat?.id === chat.id ? "selected" : ""}`}
                        onClick={() => {
                          if (currentChat?.id === chat.id) {
                            return;
                          } else {
                            navigateChat(chat);
                          }
                        }}
                      >
                        <div className="chat-info">
                          <div className="chat-title">{chat.title || ""}</div>
                        </div>
                        <Tooltip placement="bottom" title={"删除会话"}>
                          <div
                            className="delete-chat-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(chat.id);
                            }}
                          >
                            ×
                          </div>
                        </Tooltip>
                      </div>
                    ))
                  ) : (
                    <div className="empty-chats">暂无聊天记录</div>
                  )}
                </div>
              </div>
              <div className="chat-footer">
                <div className="avatar">
                  <Avatar size={30} src={userInfo.url || ""} />
                  <span style={{ marginLeft: 10 }}>{userInfo.name || ""}</span>
                </div>
                <Dropdown menu={{ items, onClick }} placement="top" arrow>
                  <div className="point-more">...</div>
                </Dropdown>
              </div>
            </div>
          )}
          <div className="chat-content-container">
            {showList ? (
              currentChat ? (
                <div className="chat-title-container">
                  <Logo />
                  <div className="chat-content-title">{currentChat.title}</div>
                </div>
              ) : null
            ) : (
              <div className="chat-title-container">
                <div className="chat-history-header-icon">
                  <Tooltip placement="bottom" title={"打开侧边栏"}>
                    <MenuUnfoldOutlined
                      className="new-chat-close"
                      onClick={() => {
                        setShowList(!showList);
                      }}
                    />
                  </Tooltip>
                  <Tooltip placement="bottom" title={"开启新会话"}>
                    <PlusCircleOutlined
                      className="new-chat-btn"
                      onClick={() => {
                        if (!currentChat) {
                          return;
                        } else {
                          navigateHome();
                        }
                      }}
                    />
                  </Tooltip>
                  <Logo />
                  {currentChat ? (
                    <div className="chat-content-title">
                      {currentChat.title}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            <div className="chat-outlet-container">
              <Outlet />
            </div>
          </div>
        </div>
      </ConstantProvider>
    </ConfigProvider>
  );
});

Layout.displayName = "Layout";

export default Layout;
