import {
  Col,
  Row,
  Tag,
  Flex,
  Empty,
  Space,
  Select,
  Button,
  Skeleton,
  Typography,
  Pagination,
} from 'antd';
import { Card } from '@components/products';
import { ReloadOutlined } from '@ant-design/icons';

function ListProducts(properties) {
  const {
    sort,
    rams,
    title,
    brands,
    filter,
    setSort,
    loading,
    products,
    storages,
    setFilter,
    setProducts,
    currentBrand,
    setCurrentBrand,
    filteredProducts,
    currentPage = null,
    setCurrentPage = {},
  } = properties;

  return (
    <>
      <div className="flex items-center justify-between mt-10 mb-5">
        {loading ? (
          <div className="w-200 mb-20">
            <Skeleton.Input active className="h-32" />
          </div>
        ) : (
          <Typography.Title level={3}>{title}</Typography.Title>
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
              value={filter.price}
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
            <Typography.Text className="font-medium!">RAM</Typography.Text>
            <Select
              value={filter.ram}
              placeholder="RAM"
              className="min-w-120!"
              allowClear
              options={rams.map((ram, index) => ({ value: index, label: ram }))}
              onChange={(_, label) =>
                setFilter((filter) => ({ ...filter, ram: label }))
              }
            />
          </Space>
          <Space>
            <Typography.Text className="font-medium!">
              Bộ nhớ trong
            </Typography.Text>
            <Select
              value={filter.storage}
              placeholder="Bộ nhớ trong"
              className="min-w-120!"
              allowClear
              options={storages.map((storage, index) => ({
                value: index,
                label: storage,
              }))}
              onChange={(_, label) =>
                setFilter((filter) => ({ ...filter, storage: label }))
              }
            />
          </Space>
          <Button
            type="primary"
            className="min-w-120!"
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilter({ price: null, color: null, ram: null, storage: null });
              setCurrentBrand('');
              setSort(null);
            }}
          >
            Đặt lại
          </Button>
        </Space>
        <Space>
          <Typography.Text className="font-medium! ml-auto!">
            Sắp xếp theo giá
          </Typography.Text>
          <Select
            showSearch
            allowClear
            value={sort}
            placeholder="Sắp xếp theo giá"
            className="cursor-pointer! min-w-200!"
            options={[
              { value: 1, label: 'Tăng dần' },
              { value: 2, label: 'Giảm dần' },
            ]}
            onChange={(value) => {
              setSort(value);
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
            <Col className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </Col>
            <Col className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </Col>
            <Col className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </Col>
            <Col className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </Col>
            <Col className="w-275">
              <Skeleton.Input active className="w-275! h-450!" />
            </Col>
          </>
        )}
        {!loading &&
          filteredProducts.length > 0 &&
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
        {!loading && filteredProducts.length === 0 && (
          <Col span={24} className="mt-120!">
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
      </Row>
      {!loading && filteredProducts.length > 0 && currentPage && (
        <Flex justify="center" className="mt-20!">
          <Pagination
            total={products.length}
            defaultCurrent={currentPage}
            onChange={(page) => setCurrentPage(page)}
          />
        </Flex>
      )}
    </>
  );
}

export default ListProducts;
