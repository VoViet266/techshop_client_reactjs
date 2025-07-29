import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

const SliderProduct = ({ images = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (images.length === 0) {
    return (
      <div className=" h-[400px] w-[400px] flex items-center justify-center bg-gray-100 rounded-[15px]">
        <p className="text-gray-500">Không có ảnh</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-4xl mx-auto relative rounded-[15px] overflow-hidden">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((url, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={url}
                alt={`Slide ${index + 1}`}
                className="w-full h-[400px] object-contain bg-white rounded-[15px]"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-8 overflow-x-auto">
        {images.map((url, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-60 h-60 border-1 cursor-pointer rounded-md overflow-hidden ${
              index === currentSlide ? 'border-primary' : 'border-gray-300'
            }`}
          >
            <img
              src={url}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-contain rounded-[15px] "
            />
          </button>
        ))}
      </div>
      <button
        onClick={prevSlide}
        className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 w-45 h-45 bg-[#090d1466]  shadow-md rounded-full flex items-center justify-center"
      >
        <LeftOutlined className="font-medium! text-white! text-xl" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 w-45 h-45 bg-[#090d1466] shadow-md rounded-full flex items-center justify-center"
      >
        <RightOutlined className=" font-medium! text-white! text-xl" />
      </button>
    </div>
  );
};

export default SliderProduct;
