import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import React, { useState, useRef, useEffect } from 'react';
import SpeechToTextButton from './SpeechToTextButton';
import { Send, MessageCircle, X, RefreshCw, Loader } from 'lucide-react';
import axiosInstance from '@/services/apis';
import { useAppContext } from '@/contexts';

const Chatbot = () => {
  const { user } = useAppContext();
  const chatBoxRef = useRef(null);
  const inputRef = useRef(null);
  const wasRecordingRef = useRef(false);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const quickReplies = [
    'Cho tôi điện thoại giá rẻ',
    'Máy tính học sinh sinh viên',
    'Chính sách bảo hành',
  ];

  // --- Lưu và load lịch sử chat ---
  useEffect(() => {
    try {
      const savedChat = localStorage.getItem('chat_history');
      if (savedChat) {
        setChatHistory(JSON.parse(savedChat));
      } else {
        const initialChat = [
          {
            sender: 'bot',
            text: `Chào bạn, mình là trợ lý AI của TechShop!`,
            quickReplies,
          },
        ];
        setChatHistory(initialChat);
        localStorage.setItem('chat_history', JSON.stringify(initialChat));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (wasRecordingRef.current && !isRecording) {
      inputRef.current?.focus();
    }
    wasRecordingRef.current = isRecording;
  }, [isRecording]);

  // --- Gửi tin nhắn hoặc payload đến Rasa ---
  const handleSend = async (textToSend = null, isPayload = false) => {
    console.log(textToSend);
    const messageText = textToSend || input;
    if (!messageText.trim()) return;
    if (!isPayload) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'user', text: messageText },
        { sender: 'bot', loading: true },
      ]);
    } else {
      setChatHistory((prev) => [...prev, { sender: 'bot', loading: true }]);
    }

    setInput('');
    setLoading(true);

    try {
      const payload = {
        sender: user?._id || 'guest_user',
        message: messageText, // có thể là text hoặc payload "/order"
        metadata: {
          accessToken: localStorage.getItem('access_token'),
        },
      };

      const response = await axiosInstance.post(
        import.meta.env.VITE_RASA_URL,
        payload,
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        const rasaResponses = response.data;
        const newMessages = rasaResponses.map((res) => ({
          sender: 'bot',
          text:
            res.text ||
            res.custom ||
            'Xin lỗi, tôi chưa hiểu rõ yêu cầu của bạn.',
          buttons: res.buttons || [],
        }));

        setChatHistory((prev) => [
          ...prev.slice(0, -1), // xóa trạng thái "Đang trả lời..."
          ...newMessages,
        ]);
      }
    } catch (error) {
      console.error('Lỗi khi gửi tin:', error);
      setChatHistory((prev) => [
        ...prev.slice(0, -1),
        {
          sender: 'bot',
          text: 'Xin lỗi, hiện không thể kết nối với máy chủ. Vui lòng thử lại sau.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleQuickReply = (text) => {
    setChatHistory((prev) => [...prev, { sender: 'user', text }]);
    handleSend(text);
  };

  // --- Khi bấm nút từ bot (dùng payload thật) ---
  const handleButtonPress = (title, payload) => {
    setChatHistory((prev) => [...prev, { sender: 'user', text: title }]);
    handleSend(payload, true); // gửi payload, không gửi title
  };

  const handleTranscript = (text) => {
    setInput(text);
    handleSend(text);
  };

  const handleListeningChange = (isListening) => {
    setIsRecording(isListening);
  };

  const handleClearChat = async () => {
    try {
      localStorage.removeItem('chat_history');
      const initialChat = [
        {
          sender: 'bot',
          text: `Chào bạn, mình là trợ lý AI của TechShop!`,
          quickReplies,
        },
      ];
      setChatHistory(initialChat);

      await axiosInstance.post(import.meta.env.VITE_RASA_URL, {
        message: '/restart',
        sender: user?._id || 'guest_user',
      });

      localStorage.setItem('chat_history', JSON.stringify(initialChat));
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const toggleChat = () => setVisible(!visible);

  return (
    <>
      {visible && (
        <div className="fixed bottom-20 right-6 w-[550px] h-[650px] z-[1000] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden border border-gray-200 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-gradient-to-r from-pink-200 to-pink-100 px-6 py-6 rounded-t-2xl">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🤖</div>
                <h2 className="text-xl font-bold text-gray-800">Trợ lý AI</h2>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleClearChat}
                  className="p-3 hover:bg-white hover:bg-opacity-50 rounded-lg transition"
                  title="Clear chat"
                >
                  <RefreshCw size={19} className="text-gray-600" />
                </button>
                <button
                  onClick={toggleChat}
                  className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={chatBoxRef}
            className="flex-1 overflow-y-auto p-[15px] space-y-4 bg-white"
          >
            {chatHistory.map((msg, index) => (
              <div key={index}>
                {msg.sender === 'bot' ? (
                  <div className="flex justify-start mb-8">
                    <div className="max-w-[450px] bg-pink-50 text-gray-800 p-7 rounded-xl border border-pink-200 shadow-sm">
                      {msg.loading ? (
                        <div className="flex items-center gap-2">
                          <Loader
                            size={16}
                            className="animate-spin text-gray-500"
                          />
                          <span className="text-sm text-gray-500">
                            Đang trả lời...
                          </span>
                        </div>
                      ) : (
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: msg.text }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end mb-4">
                    <div className="max-w-xs bg-primary text-white p-7 rounded-xl shadow-sm">
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                )}

                {/* --- Các nút từ bot --- */}
                {msg.sender === 'bot' && msg.buttons?.length > 0 && (
                  <div className="flex flex-wrap gap-4 justify-start mt-2 mb-4">
                    {msg.buttons.map((button, idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          handleButtonPress(button.title, button.payload)
                        }
                        disabled={loading}
                        className="text-sm bg-blue-100 hover:bg-blue-200 disabled:bg-gray-200 text-blue-800 px-4 py-2 rounded-full transition border border-blue-300"
                      >
                        {button.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* --- Gợi ý nhanh ban đầu --- */}
                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-4 justify-start mt-3 mb-4">
                    {msg.quickReplies.map((reply, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickReply(reply)}
                        disabled={loading}
                        className="text-sm bg-pink-100 hover:bg-pink-200 disabled:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition border border-pink-300"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl h-[50px]">
            <div className="flex gap-2 items-center bg-gray-100 rounded-xl px-5 py-2">
              <SpeechToTextButton
                onTranscript={handleTranscript}
                onListeningChange={handleListeningChange}
                className="flex items-center justify-center rounded-full bg-transparent border-none shadow-none text-gray-500 hover:text-blue-500 transition"
              />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Bạn cần hỗ trợ gì?"
                disabled={loading || isRecording}
                className="flex-1 bg-transparent focus:outline-none text-sm text-gray-800 placeholder-gray-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim() || isRecording}
                className="p-4 text-white rounded-full transition flex-shrink-0"
              >
                <Send size={19} />
              </button>
            </div>
          </div>
        </div>
      )}

      {!visible && (
        <button
          onClick={toggleChat}
          className="fixed bottom-24 right-10 w-[50px] h-[50px] bg-primary text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-[999] animate-bounce print:hidden"
        >
          <MessageCircle size={24} />
        </button>
      )}

      <style>{`
        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #f1f1f1; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 2px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
      `}</style>
    </>
  );
};

export default Chatbot;
