import { setCurrentChatIdStore } from '@/store/chatListStore';
import { Result, Button } from 'antd';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const NotFound: GenieType.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <Result
      status="404"
      title="404"
      subTitle="抱歉，您访问的页面不存在。"
      extra={
        <Button type="primary" onClick={() => {
          dispatch(setCurrentChatIdStore(""));
          navigate('/chat')
        }}>
          返回首页
        </Button>
      }
    />
  );
};

export default NotFound;
