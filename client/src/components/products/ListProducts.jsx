import {
  Col,
  Row,
  Tag,
  Flex,
  Spin,
  Empty,
  Space,
  Select,
  Button,
  Skeleton,
  Typography,
  Pagination,
  Checkbox,
  Slider,
  Collapse,
  Input,
} from 'antd';
import { Card } from '@components/products';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Panel } = Collapse;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  const handleBrandClick = (brand) => {
    if (brand === 'Tất cả') {
      setCurrentBrand('');
      return;
    }
    setCurrentBrand(brand);
  };

  const handleFilterReset = () => {
    setFilter({
      price: null,
      color: null,
      ram: null,
      storage: null,
      priceRange: null,
    });
    setCurrentBrand('');
    setSort(null);
  };

  const handleSortChange = (value) => {
    setSort(value);
  };

  const handlePriceRangeChange = (value) => {
    setFilter((prev) => ({
      ...prev,
      priceRange: value,
      price: null,
    }));
  };

  const priceRanges = [
    { label: 'Dưới 2 triệu', value: [0, 2000000] },
    { label: 'Từ 2 - 4 triệu', value: [2000000, 4000000] },
    { label: 'Từ 4 - 7 triệu', value: [4000000, 7000000] },
    { label: 'Từ 7 - 13 triệu', value: [7000000, 13000000] },
    { label: 'Từ 13 - 20 triệu', value: [13000000, 20000000] },
    { label: 'Trên 20 triệu', value: [20000000, 100000000] },
  ];

  const operatingSystems = ['iOS', 'Android'];
  const storageCapacities = ['≤128 GB', '256 GB', '512 GB', '1 TB'];
  const connectivity = ['NFC', 'Bluetooth'];

  const minPrice = 0;
  const maxPrice = 50000000;
  const defaultPriceRange = [0, 50000000];

  const formatCurrency = (amount, locale = 'vi-VN', currency = 'VND') => {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen w-full">
      <Row gutter={[10, 10]}>
        <Col xs={24} md={6} lg={6}>
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <div className="flex items-center justify-between gap-2 my-6">
              <Title level={5} className="mb-0! text-gray-800">
                <FilterOutlined className="mr-2!" />
                Bộ lọc tìm kiếm
              </Title>
              <Button
                type="link"
                size="small"
                onClick={handleFilterReset}
                className="ml-auto text-blue-500!"
              >
                <ReloadOutlined /> Làm mới
              </Button>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-8">
                {brands.slice(0, 6).map((brand, index) => (
                  <Button
                    key={index}
                    size="small"
                    type={currentBrand === brand ? 'primary' : 'default'}
                    onClick={() => handleBrandClick(brand)}
                    className="text-xs! p-18! rounded-[10px]!"
                  >
                    {brand}
                  </Button>
                ))}
              </div>
              {brands.length > 6 && (
                <Button
                  type="link"
                  size="small"
                  className="p-0 mt-2 text-blue-500"
                >
                  Xem thêm
                </Button>
              )}
            </div>

            <Collapse defaultActiveKey={['price']} ghost>
              <Panel header="Mức giá" key="price">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      checked={
                        filter.price === null && filter.priceRange === null
                      }
                      onChange={() =>
                        setFilter((prev) => ({
                          ...prev,
                          price: null,
                          priceRange: null,
                        }))
                      }
                    >
                      <Text className="text-sm text-gray-600">Tất cả</Text>
                    </Checkbox>
                  </div>
                  {priceRanges.map((range, index) => (
                    <div key={index} className="flex items-center">
                      <Checkbox
                        checked={
                          JSON.stringify(filter.price) ===
                          JSON.stringify(range.value)
                        }
                        onChange={() =>
                          setFilter((prev) => ({
                            ...prev,
                            price:
                              JSON.stringify(prev.price) ===
                              JSON.stringify(range.value)
                                ? null
                                : range.value,
                            priceRange: null, // Reset slider khi chọn fixed range
                          }))
                        }
                      >
                        <Text className="text-sm text-gray-600">
                          {range.label}
                        </Text>
                      </Checkbox>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Text className="text-sm text-gray-600 mb-2 block">
                    Hoặc nhập khoảng giá phù hợp:
                  </Text>
                  <div className="mb-4!">
                    <Slider
                      range
                      min={minPrice}
                      max={maxPrice}
                      defaultValue={defaultPriceRange}
                      value={filter.priceRange || defaultPriceRange}
                      step={100000}
                      onChange={handlePriceRangeChange}
                      tooltip={{
                        formatter: (value) => formatCurrency(value) + ' ₫',
                      }}
                    />
                  </div>

                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="0"
                      value={filter.priceRange?.[0] || minPrice}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const currentRange =
                          filter.priceRange || defaultPriceRange;
                        handlePriceRangeChange([value, currentRange[1]]);
                      }}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-gray-400">~</span>
                    <Input
                      type="number"
                      placeholder="50.000.000"
                      value={formatCurrency(filter.priceRange?.[1] || maxPrice)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || maxPrice;
                        const currentRange =
                          filter.priceRange || defaultPriceRange;
                        handlePriceRangeChange([currentRange[0], value]);
                      }}
                      className="flex-1 px-2 py-1 border rounded text-sm"
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>
                      {formatCurrency(filter.priceRange?.[0] || minPrice)} vnđ
                    </span>
                    <span>
                      {formatCurrency(filter.priceRange?.[1] || maxPrice)} vnđ
                    </span>
                  </div>
                </div>
              </Panel>

              <Panel header="Hệ điều hành" key="os">
                <div className="space-y-2">
                  {operatingSystems.map((os, index) => (
                    <div key={index} className="flex items-center">
                      <Checkbox>{os}</Checkbox>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel header="Dung lượng RAM" key="ram">
                <div className="space-y-2">
                  {rams.map((ram, index) => (
                    <div key={index} className="flex items-center">
                      <Checkbox
                        checked={filter.ram?.label === ram}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilter((prev) => ({
                              ...prev,
                              ram: { label: ram },
                            }));
                          } else {
                            setFilter((prev) => ({ ...prev, ram: null }));
                          }
                        }}
                      >
                        {ram}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel header="Dung lượng ROM" key="storage">
                <div className="space-y-2">
                  {storageCapacities.map((capacity, index) => (
                    <div key={index} className="flex items-center">
                      <Checkbox
                        checked={filter.storage?.label === capacity}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilter((prev) => ({
                              ...prev,
                              storage: { label: capacity },
                            }));
                          } else {
                            setFilter((prev) => ({ ...prev, storage: null }));
                          }
                        }}
                      >
                        {capacity}
                      </Checkbox>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel header="Kết nối" key="connectivity">
                <div className="space-y-2">
                  {connectivity.map((conn, index) => (
                    <div key={index} className="flex items-center">
                      <Checkbox>{conn}</Checkbox>
                    </div>
                  ))}
                </div>
              </Panel>
            </Collapse>
          </div>
        </Col>

        <Col xs={24} md={18} lg={18}>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center p-10">
              <Text className="text-sm text-gray-600">
                Tìm thấy
                <span className="font-semibold">{filteredProducts.length}</span>
                kết quả
              </Text>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 b">
                  <Button
                    className=" p-15! border-none!"
                    type={sort === null ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleSortChange(null)}
                  >
                    Nổi bật
                  </Button>
                  <Button
                    className=" p-15! border-none!"
                    type={sort === 1 ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleSortChange(1)}
                  >
                    Giá tăng dần
                  </Button>
                  <Button
                    className=" p-15! border-none!"
                    type={sort === 2 ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleSortChange(2)}
                  >
                    Giá giảm dần
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            {loading ? (
              <Row gutter={[16, 16]}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <Col key={index} xs={12} sm={8} md={6} lg={6} xl={4}>
                    <Skeleton.Input active className="w-full h-80 rounded-lg" />
                  </Col>
                ))}
              </Row>
            ) : filteredProducts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {filteredProducts.map((product, index) => (
                  <Col key={index} xs={12} xl={6}>
                    <Card
                      product={product}
                      loading={loading}
                      className="h-full bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Text className="text-gray-500">
                      Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn
                    </Text>
                  }
                />
                <Button
                  type="primary"
                  onClick={handleFilterReset}
                  className="mt-4"
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            )}
          </div>

          {!loading && filteredProducts.length > 0 && currentPage && (
            <div className="bg-white rounded-lg shadow-sm p-4 w-[50%] mx-auto ">
              <Flex justify="center">
                <Pagination
                  total={filteredProducts.length}
                  current={currentPage}
                  pageSize={10}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} của ${total} sản phẩm`
                  }
                />
              </Flex>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default ListProducts;
