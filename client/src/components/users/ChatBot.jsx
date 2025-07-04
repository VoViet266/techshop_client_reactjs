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
                  style={{
                    backgroundColor:
                      msg.sender === 'user' ? '#d6f2ff' : '#f1f1f1',
                    padding: '8px 12px',
                    borderRadius: 8,
                    display: 'inline-block',
                    maxWidth: '80%',
                    whiteSpace: 'pre-line',
                  }}
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
            onChange={(e) => setInput(e.target.value)}
            onSearch={handleSend}
            enterButton={<SendOutlined />}
            placeholder="Nhập câu hỏi..."
          />
        </div>
      )}

      {!visible && (
        <Button
          type="primary"
          shape="circle"
          icon={<MessageOutlined />}
          size="large"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onClick={toggleChat}
        />
      )}
    </>
  );
};

export default ChatBot;
