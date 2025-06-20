import { message } from "antd";

function useMessage() {
  const [messageApi, contextHolder] = message.useMessage();

  const success = (message) => {
    messageApi.open({
      type: "success",
      content: message,
    });
  };
  const error = (message) => {
    messageApi.open({
      type: "error",
      content: message,
    });
  };
  const warning = (message) => {
    messageApi.open({
      type: "warning",
      content: message,
    });
  };

  return { success, error, warning, contextHolder };
}

export default useMessage;
