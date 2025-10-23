// SpeechToTextButton.js
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'antd';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';

const SpeechToTextButton = ({ onTranscript, onListeningChange, className }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Dùng useRef để lưu đối tượng recognition qua các lần re-render
  const recognitionRef = useRef(null);

  // Dùng useRef để lưu các hàm callback, tránh lỗi "stale closure"
  const onTranscriptRef = useRef(onTranscript);
  const onListeningChangeRef = useRef(onListeningChange);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
    onListeningChangeRef.current = onListeningChange;
  }, [onTranscript, onListeningChange]);

  // Hook useEffect này chỉ chạy 1 LẦN khi component được mount
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        onListeningChangeRef.current(true); // Báo cho cha (ChatBot)
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscriptRef.current(transcript); // Gửi text về cho cha
      };

      recognition.onerror = (event) => {
        console.error('Lỗi nhận dạng giọng nói:', event.error);
        setIsListening(false);
        onListeningChangeRef.current(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        onListeningChangeRef.current(false); // Báo cho cha
      };

      recognitionRef.current = recognition; // Lưu vào ref
    } else {
      setIsSupported(false);
      console.warn('Trình duyệt không hỗ trợ SpeechRecognition.');
    }

    // Hàm cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy 1 lần

  const handleClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Không thể bắt đầu ghi âm:', error);
      }
    }
  };

  // Nếu trình duyệt không hỗ trợ, không hiển thị nút
  if (!isSupported) {
    return null;
  }

  // Render nút bằng Ant Design
  return (
    <Button
      type="text" // Kiểu 'text' cho nó hòa vào input
      shape="circle"
      danger={isListening} // Tự động chuyển sang màu đỏ khi isListening = true
      icon={
        isListening ? (
          <LoadingOutlined size={20} />
        ) : (
          <AudioOutlined size={20} />
        )
      }
      onClick={handleClick}
      title={isListening ? 'Đang ghi âm...' : 'Nhấn để nói'}
      className={className}
    />
  );
};

export default SpeechToTextButton;
