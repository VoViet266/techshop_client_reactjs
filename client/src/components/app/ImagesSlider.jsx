import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import React from "react";
import Slider from "react-slick";
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from "react-icons/fa";

function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} absolute top-1/2 right-full z-1 cursor-pointer -translate-y-1/2`}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
      <div className="rounded-full shadow-md hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center w-30 h-30">
        <FaArrowAltCircleLeft className="text-gray-800 text-2xl" />
      </div>
    </div>
  );
}

function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} absolute top-1/2 right-0 z-1 cursor-pointer -translate-y-1/2`}
      style={{ ...style, display: "block" }}
      onClick={onClick}
    >
      <div className="rounded-full shadow-md hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center w-30 h-30">
        <FaArrowAltCircleRight className="text-gray-800 text-2xl" />
      </div>
    </div>
  );
}

function ImagesSlider() {
  var settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };
  return (
    <Slider {...settings}>
      <div className="rounded-md flex justify-center px-10">
        <img
          alt=""
          className="rounded-md"
          src="https://happyphone.vn/wp-content/uploads/2024/12/Banner-Sale-Iphone-Thang-12-1920x1080-1.webp"
        />
      </div>
      <div className="rounded-md flex justify-center px-10">
        <img
          alt=""
          className="rounded-md"
          src="https://happyphone.vn/wp-content/uploads/2024/12/Banner-Sale-Iphone-Thang-12-1920x1080-1.webp"
        />
      </div>
    </Slider>
  );
}

export default ImagesSlider;
