// import ChatView from "@/components/ChatView";
import ChatViewHistory from "@/components/ChatViewHistory";
import { defaultProduct } from "@/utils/constants";
import { useParams } from "react-router-dom";

type ChatProps = Record<string, never>;

const ChatHistory: GenieType.FC<ChatProps> = () => {
  const location = useParams();

  const renderContent = () => {
    return (
      <ChatViewHistory
        inputInfo={{
          message: "",
          deepThink: false,
          searchEnabled: false,
        }}
        product={defaultProduct}
        newSessionId={location.sessionId}
      />
    );
  };

  return (
    <div className="flex-1 flex-col items-center">
      {renderContent()}
    </div>
  );
};

ChatHistory.displayName = "ChatHistory";

export default ChatHistory;
