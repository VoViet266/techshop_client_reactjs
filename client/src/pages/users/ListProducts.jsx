import { useAppContext } from '@contexts';
import { Card } from '@components/products';
import { useParams } from 'react-router-dom';
import Categories from '@services/categories';
import { useEffect, useState } from 'react';
import { callFetchProducts } from '@services/apis';
import { Typography, Row, Col, Tag, Skeleton } from 'antd';

function ProductListPage() {
  const { id } = useParams();
  const { message } = useAppContext();
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [currentBrand, setCurrentBrand] = useState('');

  useEffect(() => {
    if (products.length > 0) {
      const brands = [
        ...new Set(products.map((product) => product.brand.name)),
      ];
      setBrands(brands);
    }
  }, [products]);

  useEffect(() => {
    const categoriesService = new Categories();

    categoriesService
      .findOne(id)
      .then((response) => {
        setCategory(response.data.data);
      })
      .catch(() => {
        message.error('Không thể lấy thể loại');
      });
  }, []);

  useEffect(() => {
    if (category) {
      callFetchProducts(1, 10, category.name, currentBrand)
        .then((response) => {
          message.success('Lấy danh sách sản phẩm thành công');
          setProducts(response.data.data.result);
        })
        .catch(() => {
          message.error('Không thể lấy danh sách sản phẩm');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [category, currentBrand]);

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 my-20">
      <div className="flex items-center justify-between mt-10 mb-5">
        {loading ? (
          <div className="w-200 mb-20">
            <Skeleton.Input active className="h-32" />
          </div>
        ) : (
          <Typography.Title level={3} className="text-2xl! font-roboto! mb-6!">
            {category.name}
          </Typography.Title>
        )}
      </div>
      {brands.map((brand, index) => (
        <div key={index}>
          <Tag
            key={index}
            onClick={() => {
              setCurrentBrand(brand);
            }}
            className={`font-roboto! text-sm! px-8! border-none! rounded-md! cursor-pointer! ${currentBrand === brand && 'bg-gray-200!'}  min-w-80! text-center! bg-gray-100! py-4! mb-12!`}
          >
            {brand}
          </Tag>
        </div>
      ))}
      <Row gutter={10} justify="start">
        {loading && (
          <>
            <div className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </div>
            <div className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </div>
            <div className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </div>
            <div className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </div>
            <div className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </div>
          </>
        )}
        {!loading &&
          products.map((product, index) => {
            return (
              <Col span={5} key={index}>
                <Card
                  product={product}
                  loading={loading}
                  className="mb-8! w-full!"
                />
              </Col>
            );
          })}
      </Row>
    </div>
  );
}

export default ProductListPage;
