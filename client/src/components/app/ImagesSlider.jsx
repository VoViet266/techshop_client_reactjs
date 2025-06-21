import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import React from 'react';
import Slider from 'react-slick';
import { GoChevronLeft } from 'react-icons/go';
import { FaArrowAltCircleRight, FaArrowAltCircleLeft } from 'react-icons/fa';

function PrevArrow(props) {
  const { onClick } = props;

  return (
    <div
      onClick={onClick}
      className="hidden absolute z-1 top-[50%] left-30 rounded-full bg-white cursor-pointer shadow-md hover:bg-opacity-90 transition-all duration-200 group-hover:flex items-center justify-center"
    >
      <FaArrowAltCircleLeft className="text-gray-800 text-3xl" />
    </div>
  );
}

function NextArrow(props) {
  const { onClick } = props;

  return (
    <div
      onClick={onClick}
      className="hidden absolute z-1 top-[50%] right-30 rounded-full bg-white cursor-pointer shadow-md hover:bg-opacity-90 transition-all duration-200 group-hover:flex items-center justify-center"
    >
      <FaArrowAltCircleRight className="text-gray-800 text-3xl" />
    </div>
  );
}

function ImagesSlider({ images }) {
  var settings = {
    dots: true,
    speed: 500,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    accessibility: true,
    pauseOnDotsHover: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };

  return (
    <Slider {...settings} className="group">
      {images.map((image, index) => {
        return (
          <div key={index} className="rounded-md flex justify-center px-10">
            <img alt="" className="rounded-md" src={image} />
          </div>
        );
      })}
    </Slider>
  );
}

export default ImagesSlider;
