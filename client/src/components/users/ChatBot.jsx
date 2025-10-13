import axios from 'axios';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import { useState, useRef, useEffect } from 'react';
import { Button, Input, Flex, Typography, Spin } from 'antd';
import {
  SendOutlined,
  MessageOutlined,
  CloseOutlined,
  RobotOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { BsChatLeftFill, BsSearch } from 'react-icons/bs';
import axiosInstance from '@/services/apis';
import { useAppContext } from '@/contexts';

const { Text } = Typography;
// Component hiệu ứng typing
const TypingEffect = ({ text, speed = 30 }) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    setDisplayText('');
    setIsTyping(true);

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText((prev) => prev + text[index]);
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="typing-container">
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{displayText}</ReactMarkdown>
      {isTyping && <span className="typing-cursor animate-pulse">|</span>}
    </div>
  );
};

const ChatBot = () => {
  const { user } = useAppContext();
  const chatBoxRef = useRef(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { sender: 'bot', text: 'Xin chào! Tôi có thể giúp gì cho bạn?' },
  ]);
  const [latestBotMessageIndex, setLatestBotMessageIndex] = useState(-1);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const toggleChat = () => setVisible(!visible);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };

    setChatHistory((prev) => [
      ...prev,
      userMessage,
      { sender: 'bot', loading: true },
    ]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        sender: user?._id,
        message: input,
        metadata: {
          accessToken: localStorage.getItem('access_token'),
        }
      }
      print('Payload:', payload)
      const response = await axiosInstance.post(import.meta.env.VITE_RASA_URL, payload);

      if (response.status === 200) {
        setChatHistory((prev) => {
          const newHistory = [
            ...prev.slice(0, -1), // Xóa phần tử loading cuối cùng
            { sender: 'bot', text: response.data?.[0]?.text, typing: true },
          ];
          // Cập nhật index của tin nhắn bot mới nhất
          setLatestBotMessageIndex(newHistory.length - 1);
          return newHistory;
        });
        setLoading(false);
        return;
      }
      throw new Error('Không tìm thấy câu trả lời.');
    } catch (error) {
      setChatHistory((prev) => {
        const newHistory = [
          ...prev.slice(0, -1), // Xóa phần tử loading cuối cùng
          {
            sender: 'bot',
            text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
            typing: true,
          },
        ];

        setLatestBotMessageIndex(newHistory.length - 1);
        return newHistory;
      });
      setLoading(false);
      console.error('Lỗi:', error);
    }
  };

  return (
    <>
      {visible && (
        <div className="fixed bottom-20 right-6 w-[500px] h-[600px] z-[1000] bg-white shadow-2xl rounded-xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gradient-to-r bg-primary text-white px-12 py-8 rounded-t-xl">
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={8}>
                <BsChatLeftFill className="text-lg!" />
                <Text className="text-white! font-medium! text-lg!">
                  Chatbot hỗ trợ khách hàng
                </Text>
              </Flex>
              <Button
                onClick={toggleChat}
                className="border-none! font-medium! bg-transparent!"
                size="small"
              >
                <CloseOutlined className="text-white!" />
              </Button>
            </Flex>
          </div>
          <div
            ref={chatBoxRef}
            className={`flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 ${chatHistory.length === 0 && !loading
              ? 'flex items-center justify-center'
              : ''
              }`}
          >
            {chatHistory.length === 0 && !loading && (
              <div className="text-center">
                <RobotOutlined className="text-4xl text-gray-400 mb-2" />
                <Text className="text-gray-500 block">
                  Xin chào! Tôi có thể giúp gì cho bạn?
                </Text>
              </div>
            )}

            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in px-4 fade-in-0 slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`flex items-start gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`px-15 py-10 rounded-lg my-10 shadow-none ${msg.sender === 'user'
                      ? 'bg-primary! text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-8">
                        <Spin size="small" />
                        <span className="text-sm text-gray-500">
                          Đang trả lời...
                        </span>
                      </div>
                    ) : msg.sender === 'bot' ? (
                      <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                      // <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      //   {msg.text}
                      // </ReactMarkdown>
                    ) : (
                      <span className="whitespace-pre-line">{msg.text}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-10 border-t border-gray-200 bg-white">
            <div className="rounded-full! relative">
              <Button
                onClick={handleSend}
                icon={
                  <SendOutlined className="text-primary! hover:text-[#6D0606]!" />
                }
                className="absolute! flex! items-center! w-30! h-30! justify-center! right-6! rounded-full! bg-transparent! border-none! shadow-none! text-white! z-10! top-1/2! -translate-y-1/2!"
              ></Button>
              <Input
                value={input}
                // onSearch={handleSend}
                onPressEnter={handleSend}
                placeholder="Nhập câu hỏi của bạn..."
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="rounded-full! px-12! placeholder:text-sm! text-sm!"
                size="large"
              />
            </div>
          </div>
        </div>
      )}

      {!visible && (
        <Button
          size="large"
          shape="circle"
          type="primary"
          onClick={toggleChat}
          icon={<MessageOutlined />}
          className="print:hidden! fixed! bottom-24! right-24! z-1000! shadow-[0_2px_8px_rgba(0,0,0,0.2)]! hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:scale-110 animate-bounce"
        />
      )}

      <style>{`
        .typing-cursor {
          color: #3b82f6;
          font-weight: bold;
        }

        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </>
  );
};

export default ChatBot;
