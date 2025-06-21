import { message } from 'antd';

function useMessage() {
  const [messageApi, contextHolder] = message.useMessage();

  const success = (message) => {
    messageApi.open({
      type: 'success',
      content: message,
    });
  };

  const error = (message) => {
    messageApi.open({
      type: 'error',
      content: message,
    });
  };

  const warning = (message) => {
    messageApi.open({
      type: 'warning',
      content: message,
    });
  };

  const loading = (message) => {
    messageApi.open({
      type: 'loading',
      content: message,
    });
  };

  return { success, error, warning, loading, contextHolder };
}

export default useMessage;
