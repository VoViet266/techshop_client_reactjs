import { Card } from '@components/products';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import 'react-loading-skeleton/dist/skeleton.css';
import { Tag, Typography, Empty, Flex, Row, Col, Carousel, Spin } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import CardProduct from './Card';

function PreviewListProducts({
  title,
  loading,
  category = {},
  products = [],
  canViewAll = true,
  showListBrands = true,
}) {
  const navigate = useNavigate();
  const brands = [...new Set(products.map((product) => product.brand.name))];

  const chunkArray = (array) => {
    const itemsPerRow = 4;
    const chunks = [];
    for (let i = 0; i < array.length; i += itemsPerRow) {
      chunks.push(array.slice(i, i + itemsPerRow));
    }
    return chunks;
  };

  const productsChunks = chunkArray(products);

  function CustomNextArrow(properties) {
    return (
      <button
        type="button"
        onClick={properties.onClick}
        className="absolute right-4 hover:opacity-80 top-1/2 -translate-y-1/2 z-10 hover:text-white text-white! cursor-pointer shadow-lg p-3 transition-all text-2xl!"
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
        className="absolute left-4 hover:opacity-80 top-1/2 -translate-y-1/2 z-10 hover:text-white text-white! cursor-pointer shadow-lg p-3 transition-all text-2xl!"
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
        {products.map((product, index) => {
          return (
            <Col span={5} key={index}>
              <CardProduct
                product={product}
                loading={loading}
                className="w-full!"
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

export default PreviewListProducts;
