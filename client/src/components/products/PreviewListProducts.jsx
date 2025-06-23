import { Tag, Typography, Empty, Row, Col } from 'antd';
import CardProduct from './Card';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function PreviewListProducts({
  title,
  loading,
  category = {},
  products = [],
  canViewAll = true,
  showListBrands = true,
}) {
  const navigate = useNavigate();
  const { setCurrentCategory } = useAppContext();
  const brands = [...new Set(products.map((product) => product.brand.name))];

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 mt-20">
      <div className="flex items-center justify-between mt-10 mb-5">
        {loading ? (
          <div className="w-200">
            <Skeleton className="h-32" />
          </div>
        ) : (
          <Typography.Title
            level={3}
            className="text-2xl! font-roboto! font-bold! text-primary! mb-6!"
          >
            {title}
          </Typography.Title>
        )}

        {loading && (
          <div className="w-76">
            <Skeleton className="h-24" />
          </div>
        )}
        {!loading && canViewAll && products.length > 0 && (
          <span
            onClick={() => {
              setCurrentCategory(category);
              navigate("/product/all");
            }}
            className="cursor-pointer font-medium text-primary"
          >
            Xem tất cả
          </span>
        )}
      </div>

      {showListBrands && (
        <div className="mb-15 flex gap-2">
          {loading && (
            <>
              <div className="w-80">
                <Skeleton className="h-25" />
              </div>
              <div className="w-80">
                <Skeleton className="h-25" />
              </div>
              <div className="w-80">
                <Skeleton className="h-25" />
              </div>
              <div className="w-80">
                <Skeleton className="h-25" />
              </div>
              <div className="w-80">
                <Skeleton className="h-25" />
              </div>
            </>
          )}
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

      <Row
        gutter={10}
        justify={loading ? 'start' : products.length > 0 ? 'start' : 'center'}
      >
        {loading && (
          <>
            <Col className="w-275">
              <Skeleton className="h-500" />
            </Col>
            <Col className="w-275">
              <Skeleton className="h-500" />
            </Col>
            <Col className="w-275">
              <Skeleton className="h-500" />
            </Col>
            <Col className="w-275">
              <Skeleton className="h-500" />
            </Col>
            <Col className="w-275">
              <Skeleton className="h-500" />
            </Col>
          </>
        )}

        {products.length === 0 && !loading && (
          <Col span={24}>
            <Empty
              className="mx-auto!"
              description={
                <Typography.Text className="font-roboto! text-gray-400!">
                  Không tìm thấy sản phẩm
                </Typography.Text>
              }
            />
          </Col>
        )}

        {products.map((product, index) => {
          return (
            <Col key={index}>
              <CardProduct key={index} product={product} loading={loading} />
            </Col>
          );
        })}
      </Row>
    </div>
  );
}

export default PreviewListProducts;
