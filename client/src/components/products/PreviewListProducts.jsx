import CardProduct from './Card';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { Typography, Empty, Flex } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useState } from 'react';

function PreviewListProducts({
  title,
  loading,
  products = [],
  category = {},
  viewAll = true,
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const settings = {
    speed: 500,
    infinite: products.length > 5,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow isVisible={isHovered} />,
    prevArrow: <CustomPrevArrow isVisible={isHovered} />,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  function CustomNextArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className={`absolute -right-4 sm:-right-6 lg:-right-8 xl:-right-12 h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] rounded-l-full flex items-center justify-center hover:opacity-80 bg-white/50 backdrop-filter backdrop-blur-md top-1/2 -translate-y-1/2 z-10 text-white cursor-pointer shadow-2xl p-4 sm:p-6 lg:p-7 transition-all text-base sm:text-lg ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <RightOutlined className="font-bold" />
      </button>
    );
  }

  function CustomPrevArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className={`absolute -left-4 sm:-left-6 lg:-left-8 xl:-left-19 h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] rounded-r-full flex items-center justify-center hover:opacity-80 bg-white/50 drop-filter backdrop-blur-md top-1/2 -translate-y-1/2 z-10 text-white cursor-pointer shadow-2xl p-4 sm:p-6 lg:p-7 transition-all text-base sm:text-lg ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <LeftOutlined className="font-bold!" />
      </button>
    );
  }

  return (
    <div className="w-full bg-white p-4 sm:p-8 lg:p-12 xl:p-20 rounded-xl mt-8 sm:mt-12 lg:mt-16 xl:mt-20">
      <div className="flex mb-6 sm:mb-8 lg:mb-10 items-center justify-between">
        <Typography.Title
          level={2}
          className="font-inter! ml-2! sm:ml-4! lg:ml-8! mb-0!"
        >
          {title}
        </Typography.Title>

        {viewAll && (
          <span
            onClick={() => {
              const id = category._id;
              navigate(`/product/all/${id}`);
            }}
            className="cursor-pointer text-sm sm:text-base mr-2 sm:mr-4 lg:mr-8 font-medium text-primary hover:underline"
          >
            Xem tất cả
          </span>
        )}
      </div>

      <Flex justify="center">
        {products.length === 0 && (
          <div className="w-full">
            <Empty
              className="mx-auto"
              description={
                <Typography.Text className="font-inter text-gray-400">
                  Không tìm thấy sản phẩm
                </Typography.Text>
              }
            />
          </div>
        )}

        <div
          className="w-full relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Slider {...settings} className="bg-white w-full h-full">
            {products.map((product, index) => {
              return (
                <div
                  key={index}
                  className="px-2 sm:px-3 lg:px-4 my-6 sm:my-8 lg:my-10 w-1/5"
                >
                  <CardProduct
                    product={product}
                    loading={loading}
                    className="w-full!"
                  />
                </div>
              );
            })}
          </Slider>
        </div>
      </Flex>
    </div>
  );
}

export default PreviewListProducts;
