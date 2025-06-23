import { useAppContext } from '@contexts';
import { Card } from '@components/products';
import { useEffect, useState } from 'react';
import { callFetchProducts } from '@services/apis';
import { Typography, Flex, Tag, Skeleton } from 'antd';

function ProductListPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentBrand, setCurrentBrand] = useState('');
  const { message, currentCategory } = useAppContext();

  useEffect(() => {
    if (products.length > 0) {
      const brands = [
        ...new Set(products.map((product) => product.brand.name)),
      ];
      setBrands(brands);
    }
  }, [products]);

  console.log('Brands:', brands);

  useEffect(() => {
    if (currentCategory) {
      callFetchProducts(1, 10, currentCategory?.name, currentBrand)
        .then((response) => {
          setLoading(true);
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
  }, [currentCategory, currentBrand]);

  return (
    <div className="w-full xl:px-50 lg:px-30 md:px-20 my-20">
      <div className="flex items-center justify-between mt-10 mb-5">
        {loading ? (
          <div className="w-200 mb-20">
            <Skeleton.Input active className="h-32" />
          </div>
        ) : (
          <Typography.Title level={3} className="text-2xl! font-roboto! mb-6!">
            {currentCategory.name}
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
      <Flex gap={8} justify="center" wrap>
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
              <div className="w-1/5" key={index}>
                <Card
                  key={index}
                  product={product}
                  className="mb-8!"
                  loading={loading}
                />
              </div>
            );
          })}
      </Flex>
    </div>
  );
}

export default ProductListPage;
