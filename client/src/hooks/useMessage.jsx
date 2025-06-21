import { message } from 'antd';

function useMessage() {
  const [messageApi, contextHolder] = message.useMessage();

  const success = (message) => {
    messageApi.open({
      type: 'success',
      content: message,
      duration: 2,
    });
  };

  const error = (message) => {
    messageApi.open({
      type: 'error',
      content: message,
      duration: 2,
    });
  };

  const warning = (message) => {
    messageApi.open({
      type: 'warning',
      content: message,
      duration: 2,
    });
  };

  const loading = (message) => {
    messageApi.open({
      key: 'loading',
      type: 'loading',
      content: message,
      duration: 0,
    });
  };

  const destroyLoading = () => {
    messageApi.destroy('loading');
  };

  return { success, error, warning, loading, destroyLoading, contextHolder };
}

export default useMessage;
