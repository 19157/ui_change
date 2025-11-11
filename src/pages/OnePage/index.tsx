import { useState, useEffect } from "react";
import GeneralInput from "@/components/GeneralInput";
import Slogn from "@/components/Slogn";
import ChatViewOnePage from "@/components/ChatViewOnePage";
import { productList, defaultProduct } from "@/utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { setChatListStore } from "@/store/chatListStore";
import { getSessionId, setMessage } from "@/utils";
import moment from "moment";
import { Avatar, Dropdown, MenuProps, message, Modal, Tooltip } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import "../../layout/index.css";
import { setToken } from "@/store/user";
import Logo from "@/components/Logo";

const OnePage: GenieType.FC = () => {
  const [inputInfo, setInputInfo] = useState<CHAT.TInputInfo>({
    message: "",
    deepThink: false,
    searchEnabled: false,
  });
  const [messageApi, messageContent] = message.useMessage();
  const [modal, contextHolder] = Modal.useModal();
  const [product, setProduct] = useState(defaultProduct);
  const [currentChat, setCurrentChat] = useState<any>(null);
  const dispatch = useDispatch();
  const { chatListStore } = useSelector((state: any) => state.chatListStore);
  const { userInfo } = useSelector((state: any) => state.user); // 用户信息
  const [showList, setShowList] = useState<boolean>(true); // 是否隐藏侧边栏标志
  const [isNewChat, setIsNewChat] = useState(true);

  const changeInputInfo = (info: CHAT.TInputInfo) => {
    // 新建对话在这里创建
    let id = getSessionId();
    const newItem = {
      sessionId: id,
      query: info.message,
      title: info.message,
      tasks: [],
      createdAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      updatedAt: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
    };
    dispatch(setChatListStore([newItem, ...chatListStore]));
    setCurrentChat(newItem);
    setIsNewChat(true);

    setInputInfo(info);
  };

  useEffect(() => {
    // 初始化全局 message
    setMessage(messageApi);
  }, [messageApi]);

  useEffect(() => {
    console.log("OnePage---currentChat=", currentChat);
    setInputInfo({
      message: "",
      deepThink: false,
      searchEnabled: false,
    });
  }, [currentChat]);

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
        onOk() {
          dispatch(setToken(""));
        },
        onCancel() {
          // messageApi.info('取消成功');
        },
      });
    }
  };

  const deleteItem = (sessionId: string) => {
    modal.confirm({
      title: "确定要删除会话吗？",
      content: "确定要删除会话吗？",
      okText: "确定",
      cancelText: "取消",
      onOk() {
        const newList = chatListStore.filter(
          (itemChat: any) => itemChat.sessionId !== sessionId
        );
        dispatch(setChatListStore(newList));
        if (currentChat?.sessionId === sessionId) {
          setCurrentChat(null);
          setIsNewChat(true);
        }
      },
      onCancel() {},
    });
  };

  const renderContent = () => {
    if (inputInfo.message.length === 0) {
      return (
        <div className="pt-[80px] flex flex-col items-center">
          <Slogn />
          <div className="w-640 rounded-xl shadow-[0_18px_39px_0_rgba(198,202,240,0.1)]">
            <GeneralInput
              placeholder={product.placeholder}
              showBtn={true}
              size="big"
              disabled={false}
              product={product}
              send={changeInputInfo}
            />
          </div>
          <div className="w-640 flex flex-wrap gap-16 mt-[16px]">
            {productList.map((item, i) => (
              <div
                key={i}
                className={`w-[18%] h-[36px] cursor-pointer flex items-center justify-center border rounded-[8px] ${item.type === product.type ? "border-[#4040ff] bg-[rgba(64,64,255,0.02)] text-[#4040ff]" : "border-[#E9E9F0] text-[#666]"}`}
                onClick={() => setProduct(item)}
              >
                <i className={`font_family ${item.img} ${item.color}`}></i>
                <div className="ml-[6px]">{item.name}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    // 这个地方好像永远也执行不到
    // return (
    //   <ChatViewOnePage
    //     inputInfo={inputInfo}
    //     product={product}
    //     currentChat={currentChat}
    //     isNewChat={isNewChat}
    //   />
    // );
    return null;
  };

  return (
    <div className="app">
      {messageContent}
      {contextHolder}
      {showList && (
        <div className="chat-history">
          <div className="chat-history-header">
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
                      setCurrentChat(null);
                      setIsNewChat(true);
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
                    key={chat.sessionId}
                    className={`chat-item ${currentChat?.sessionId === chat.sessionId ? "selected" : ""}`}
                    onClick={() => {
                      if (currentChat?.sessionId === chat.sessionId) {
                        return;
                      } else {
                        setCurrentChat(chat);
                        setIsNewChat(false);
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
                          deleteItem(chat.sessionId);
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
          ) : (
            <div className="chat-title-container" />
          )
        ) : (
          <div className="chat-title-container">
            <div className="chat-history-header-icon">
              <Tooltip placement="bottom" title={"展开对话记录"}>
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
                      setCurrentChat(null);
                      setIsNewChat(true);
                    }
                  }}
                />
              </Tooltip>
              <Logo />
              {currentChat ? (
                <div className="chat-content-title">{currentChat.title}</div>
              ) : null}
            </div>
          </div>
        )}
        <div className="chat-outlet-container">
          {currentChat ? (
            <div className="h-full flex flex-col items-center">
              <ChatViewOnePage
                inputInfo={inputInfo}
                product={product}
                currentChat={currentChat}
                isNewChat={isNewChat}
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center overflow-auto">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

OnePage.displayName = "OnePage";

export default OnePage;
