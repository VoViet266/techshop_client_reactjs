import axios from 'axios';
import { useState } from 'react';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import { Button, Input, Flex, Typography } from 'antd';
import { SendOutlined, MessageOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ChatBot = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const toggleChat = () => setVisible(!visible);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };

    setChatHistory((prev) => [...prev, userMessage]);
    setInput('');
    try {
      const response = await axios.post('http://localhost:8080/chat', {
        message: input,
      });
      if (response.status === 201) {
        setChatHistory((prev) => [
          ...prev,
          { sender: 'bot', text: response.data.data.reply },
        ]);
        return;
      }
      throw new Error('Không tìm thấy câu trả lời.');
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };

  return (
    <>
      {visible && (
        <div className="fixed! h-450 bottom-20! right-24! w-350! z-1000 bg-white p-16 shadow-[0_0_10px_rgba(0,0,0,0.15)]! rounded-xl! flex! flex-col!">
          <Flex justify="space-between" align="center">
            <Text className="text-base! font-medium!">ChatBot</Text>
            <Button onClick={toggleChat} className="h-30!">
              Đóng
            </Button>
          </Flex>
          <div className="mt-10 overflow-y-auto flex-1 mb-8 pr-4">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`${msg.sender === 'user' ? 'text-right' : 'text-left'} mb-8`}
              >
                <Text
                  className={`py-8! px-12! rounded-lg! inline-block! max-w-[80%]! whitespace-pre-line! ${msg.sender === 'user' ? 'bg-[#d6f2ff]!' : 'bg-[#f1f1f1]!'}`}
                >
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </Text>
              </div>
            ))}
          </div>
          <Input.Search
            value={input}
            onSearch={handleSend}
            placeholder="Nhập câu hỏi..."
            enterButton={<SendOutlined />}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
      )}

      {!visible && (
        <Button
          size="large"
          shape="circle"
          type="primary"
          onClick={toggleChat}
          icon={<MessageOutlined />}
          className="fixed! bottom-24! right-24! z-1000! shadow-[0_2px_8px_rgba(0,0,0,0.2)]!"
        />
      )}
    </>
  );
};

export default ChatBot;
