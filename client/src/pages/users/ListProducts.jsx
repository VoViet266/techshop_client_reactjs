import { useAppContext } from '@contexts';
import { Card } from '@components/products';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Categories from '@services/categories';
import { callFetchProducts } from '@services/apis';
import { Typography, Flex, Row, Col, Tag, Space, Skeleton, Select } from 'antd';

function ProductListPage() {
  const { id } = useParams();
  const { message } = useAppContext();
  const [colors, setColors] = useState([]);
  const [rams, setRams] = useState([]);
  const [storages, setStorages] = useState([]);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState(null);
  const [currentBrand, setCurrentBrand] = useState('');
  const [filter, setFilter] = useState({
    price: null,
    color: null,
    ram: null,
    storage: null,
  });

  const filteredProducts = products.filter((product) => {
    // Lọc theo giá
    let matchPrice = true;
    const realPrice =
      product?.variants?.[0]?.price -
      product?.variants?.[0]?.price * (product?.discount / 100);
    if (filter.price === 1) {
      matchPrice = realPrice < 10000000;
    } else if (filter.price === 2) {
      matchPrice = realPrice >= 10000000 && realPrice <= 20000000;
    } else if (filter.price === 3) {
      matchPrice = realPrice > 20000000;
    }

    // Lọc theo màu
    let matchColor = filter.color
      ? product.variants?.some((v) => v.color.name === filter.color)
      : true;
    // Lọc theo RAM
    let matchRam = filter.ram
      ? product.variants?.some((v) => v.memory.ram === filter.ram)
      : true;
    // Lọc theo bộ nhớ trong
    let matchStorage = filter.storage
      ? product.variants?.some((v) => v.memory.storage === filter.storage)
      : true;

    return matchPrice && matchColor && matchRam && matchStorage;
  });

  useEffect(() => {
    if (products.length > 0 && brands.length === 0) {
      const brands = [
        'Tất cả',
        ...new Set(products.map((product) => product.brand.name)),
      ];
      setBrands(brands);

      const colors = [
        ...new Set(
          products
            .flatMap((p) => p.variants?.map((v) => v.color))
            .filter(Boolean),
        ),
      ];
      setColors(colors);

      const rams = [
        ...new Set(
          products
            .flatMap((p) => p.variants?.map((v) => v.memory.ram))
            .filter(Boolean),
        ),
      ];
      setRams(rams);

      const storages = [
        ...new Set(
          products
            .flatMap((p) => p.variants?.map((v) => v.memory.storage))
            .filter(Boolean),
        ),
      ];
      setStorages(storages);
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
          <Typography.Title
            level={3}
            className="text-2xl! uppercase! font-roboto! text-primary! font-bold! mb-6!"
          >
            {category.name}
          </Typography.Title>
        )}
      </div>

      <div>
        {brands.map((brand, index) => (
          <Tag
            key={index}
            onClick={(event) => {
              const tag = event.target.textContent;
              if (tag === 'Tất cả') {
                setCurrentBrand('');
                return;
              }
              setCurrentBrand(brand);
            }}
            className={`font-roboto! text-sm! px-8! border-none! rounded-md! cursor-pointer! ${currentBrand === brand && 'bg-gray-200!'}  min-w-80! text-center! bg-gray-100! py-4! mb-12!`}
          >
            {brand}
          </Tag>
        ))}
      </div>

      <Flex className="mb-12!" justify="space-between">
        <Space>
          <Space>
            <Typography.Text className="font-medium!">Giá</Typography.Text>
            <Select
              placeholder="Khoảng giá"
              className="min-w-120!"
              allowClear
              options={[
                { value: 1, label: 'Dưới 10 triệu' },
                { value: 2, label: '10 - 20 triệu' },
                { value: 3, label: 'Trên 20 triệu' },
              ]}
              onChange={(value) => {
                setFilter((f) => ({ ...f, price: value }));
              }}
            />
          </Space>
          <Space>
            <Typography.Text className="font-medium!">Màu sắc</Typography.Text>
            <Select
              placeholder="Màu sắc"
              className="min-w-120!"
              allowClear
              options={colors.map((color) => ({
                value: color.name,
                label: color.name,
              }))}
              onChange={(value) => setFilter((f) => ({ ...f, color: value }))}
            />
          </Space>
          <Space>
            <Typography.Text className="font-medium!">RAM</Typography.Text>
            <Select
              placeholder="RAM"
              className="min-w-120!"
              allowClear
              options={rams.map((ram) => ({ value: ram, label: ram }))}
              onChange={(value) => setFilter((f) => ({ ...f, ram: value }))}
            />
          </Space>
          <Space>
            <Typography.Text className="font-medium!">
              Bộ nhớ trong
            </Typography.Text>
            <Select
              placeholder="Bộ nhớ trong"
              className="min-w-120!"
              allowClear
              options={storages.map((storage) => ({
                value: storage,
                label: storage,
              }))}
              onChange={(value) => setFilter((f) => ({ ...f, storage: value }))}
            />
          </Space>
        </Space>
        <Space>
          <Typography.Text className="font-medium! ml-auto!">
            Sắp xếp theo giá
          </Typography.Text>
          <Select
            showSearch
            allowClear
            placeholder="Sắp xếp theo giá"
            className="cursor-pointer! min-w-200!"
            options={[
              { value: 1, label: 'Tăng dần' },
              { value: 2, label: 'Giảm dần' },
            ]}
            onChange={(value) => {
              if (value === 1) {
                const priceAscending = [...products].sort(
                  (a, b) => a.variants[0].price - b.variants[0].price,
                );
                setProducts(priceAscending);
              }
              if (value === 2) {
                const priceDescending = [...products].sort(
                  (a, b) => b.variants[0].price - a.variants[0].price,
                );
                setProducts(priceDescending);
              }
            }}
          />
        </Space>
      </Flex>
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
          filteredProducts.map((product, index) => {
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
