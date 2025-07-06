import CardProduct from './Card';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import { Typography, Empty, Flex } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

function PreviewListProducts({ title, loading, products = [], category = {} }) {
  const navigate = useNavigate();
  const brands = [
    'Tất cả',
    ...new Set(products.map((product) => product.brand.name)),
  ];

  const settings = {
    speed: 500,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };

  function CustomNextArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className="absolute -right-35 rounded-full! flex items-center justify-center hover:opacity-80 bg-white top-1/2 -translate-y-1/2 z-10 text-black! cursor-pointer shadow-lg p-8! transition-all text-lg!"
      >
        <RightOutlined className='font-medium!' />
      </button>
    );
  }

  function CustomPrevArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className="absolute -left-35 rounded-full! flex items-center justify-center hover:opacity-80 bg-white top-1/2 -translate-y-1/2 z-10 text-black! cursor-pointer shadow-lg p-8! transition-all text-lg!"
      >
        <LeftOutlined className='font-medium!' />
      </button>
    );
  }

  return (
    <div className="w-full bg-white p-20 rounded-xl mt-20">
      <div className="flex items-center justify-between">
        <Typography.Title
          level={3}
          className="font-roboto! uppercase font-bold! ml-8! mb-6!"
        >
          {title}
        </Typography.Title>

        <span
          onClick={() => {
            const id = category._id;
            navigate(`/product/all/${id}`);
          }}
          className="cursor-pointer text-base mr-8 font-medium text-primary"
        >
          Xem tất cả
        </span>
      </div>

      <Flex justify="center">
        {products.length === 0 && (
          <div className="w-full">
            <Empty
              className="mx-auto!"
              description={
                <Typography.Text className="font-roboto! text-gray-400!">
                  Không tìm thấy sản phẩm
                </Typography.Text>
              }
            />
          </div>
        )}

        <Slider {...settings} className="bg-white! w-full!">
          {products.map((product, index) => {
            return (
              <div key={index} className="px-8">
                <CardProduct
                  product={product}
                  loading={loading}
                  className="w-full!"
                />
              </div>
            );
          })}
        </Slider>
      </Flex>
    </div>
  );
}

export default PreviewListProducts;
