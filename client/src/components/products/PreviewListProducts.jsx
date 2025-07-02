import 'react-loading-skeleton/dist/skeleton.css';
import { Tag, Typography, Empty, Flex, Row, Col, Carousel, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import CardProduct from './Card';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';

function PreviewListProducts({ title, loading, products = [], category = {} }) {
  const navigate = useNavigate();
  const brands = [
    'Tất cả',
    ...new Set(products.map((product) => product.brand.name)),
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };

  const productsChunks = chunkArray(products);

  function CustomNextArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className="absolute -right-30 rounded-full! flex items-center justify-center hover:opacity-80 top-1/2 -translate-y-1/2 z-10 text-black! cursor-pointer shadow-lg p-6 transition-all text-xl!"
      >
        <RightOutlined />
      </button>
    );
  }

  function CustomPrevArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className="absolute -left-30 rounded-full! flex items-center justify-center hover:opacity-80 top-1/2 -translate-y-1/2 z-10 text-black! cursor-pointer shadow-lg p-6 transition-all text-xl!"
      >
        <LeftOutlined />
      </button>
    );
  }

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 mt-20">
      <div className="flex items-center justify-between mt-10 mb-5">
        {/* {loading ? (
          <div className="w-200">
            <Skeleton className="h-32" />
          </div>
        ) : (
          <Typography.Title
            level={3}
            className="text-2xl! font-roboto! text-primary! font-bold! uppercase! mb-6!"
          >
            {title}
          </Typography.Title>
        )} */}

        {!loading && canViewAll && products.length > 0 && (
          <span
            onClick={() => {
              const id = category._id;
              navigate(`/product/all/${id}`);
            }}
            className="cursor-pointer font-medium text-primary"
          >
            Xem tất cả
          </span>
        )}
      </div>

      {showListBrands && (
        <div className="mb-15 flex gap-2">
          {brands.map((brand, index) => (
            <div key={index}>
              <Tag
                key={index}
                className="font-roboto! text-sm! px-8! rounded-md! cursor-pointer! min-w-80! text-center! bg-gray-100! border-none! py-4!"
              >
                {brand}
              </Tag>
            </div>
          ))}
        </div>
      )}

      <Row>
        {products.length === 0 && !loading && (
        <><Typography.Title
            level={3}
            className="font-roboto! text-primary! font-bold! mb-6!"
          >
            {title}
          </Typography.Title><span
            onClick={() => {
              const id = category._id;
              navigate(`/product/all/${id}`);
            } }
            className="cursor-pointer font-medium text-primary"
          >
              Xem tất cả
            </span><div className="mb-15 flex gap-2">
              {brands.map((brand, index) => (
                <div key={index}>
                  <Tag
                    key={index}
                    className="font-roboto! text-sm! px-8! rounded-md! cursor-pointer! min-w-80! text-center! bg-gray-100! border-none! py-4!"
                  >
                    {brand}
                  </Tag>
                </div>
              ))}
            </div><Flex justify="center">
              {products.length === 0 && (
                <div className="w-full">
                  <Empty
                    className="mx-auto!"
                    description={<Typography.Text className="font-roboto! text-gray-400!">
                      Không tìm thấy sản phẩm
                    </Typography.Text>} />
                </div>
              )}

              <Slider
                {...settings}
                className="flex! bg-white! items-center! justify-center! w-full!"
              >
                {products.map((product, index) => {
                  return (
                    <div key={index} className="px-8">
                      <CardProduct
                        product={product}
                        loading={loading}
                        className="w-full!" />
                    </div>
                  );
                })}
              </Slider>
            </Flex></>
        )}
      </Row>
    </div>
  );
}

export default PreviewListProducts;
