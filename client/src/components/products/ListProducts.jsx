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
  Tabs,
} from 'antd';
import { Card } from '@components/products';
import { ReloadOutlined, FilterOutlined } from '@ant-design/icons';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { use, useEffect, useState } from 'react';
import { callFetchBranches, callFetchBrands } from '@/services/apis';
import Categories from '@/services/categories';
import { PRODUCT_CONFIGS } from './productConfig';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

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
    categorieCurrent,
    currentBrand,
    setCurrentBrand,
    filteredProducts,

    setProductType,
  } = properties;

  const [searchParams, setSearchParams] = useSearchParams();
  const _page = parseInt(searchParams.get('_page') || '1');
  const _limit = parseInt(searchParams.get('_limit') || '8');

  const currentConfig =
    PRODUCT_CONFIGS[categorieCurrent] || PRODUCT_CONFIGS['dien-thoai'];

  const fetchBranches = async () => {
    try {
      const res = await callFetchBrands();
      setAllBrands(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchBranches();
  }, []);

  const startIndex = (_page - 1) * _limit;
  const endIndex = startIndex + _limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const handleBrandClick = (brand) => {
    if (brand === 'Tất cả') {
      setCurrentBrand('');
      return;
    }
    setCurrentBrand(brand);
    setSearchParams({ _page: '1', _limit: _limit.toString() });
  };

  const handleProductTypeChange = (type) => {
    setProductType(type);

    setFilter({
      price: null,
      color: null,
      ram: null,
      storage: null,
      priceRange: null,
      os: null,
      processor: null,
      screenSize: null,
      batteryCapacity: null,
      connectivity: null,
    });

    setCurrentBrand('');
    setSort(null);
    setActiveFilters({});
    setSearchParams({ _page: '1', _limit: _limit.toString() });
  };

  const handleFilterReset = () => {
    setFilter({
      price: null,
      color: null,
      ram: null,
      storage: null,
      priceRange: null,
      os: null,
      processor: null,
      screenSize: null,
      batteryCapacity: null,
      connectivity: null,
    });
    setCurrentBrand('');
    setSort(null);

    setSearchParams({ _page: '1', _limit: _limit.toString() });
  };

  const handleSortChange = (value) => {
    setSort(value);
    setSearchParams({ _page: '1', _limit: _limit.toString() });
  };

  const handlePriceRangeChange = (value) => {
    setFilter((prev) => ({
      ...prev,
      priceRange: value,
      price: null,
    }));
    setSearchParams({ _page: '1', _limit: _limit.toString() });
  };

  const handlePaginationChange = (page, pageSize) => {
    setSearchParams({
      _page: page.toString(),
      _limit: pageSize.toString(),
    });
  };

  const handleFilterChange = (filterType, value, checked) => {
    setFilter((prev) => ({
      ...prev,
      [filterType]: checked ? { label: value } : null,
    }));

    setSearchParams({ _page: '1', _limit: _limit.toString() });
  };

  const formatCurrency = (amount, locale = 'vi-VN', currency = 'VND') => {
    return new Intl.NumberFormat(locale, {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderFilterPanel = (key, title, options) => (
    <Panel header={title} key={key}>
      <div className="space-y-2">
        {options.map((option, index) => {
          const label = typeof option === 'object' ? option.label : option;
          return (
            <div key={index} className="flex items-center">
              <Checkbox
                checked={filter[key]?.label === option}
                onChange={(e) =>
                  handleFilterChange(key, option, e.target.checked)
                }
              >
                {label}
              </Checkbox>
            </div>
          );
        })}
      </div>
    </Panel>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <Title level={3} className="mb-0! text-gray-800 font-extrabold!">
          {currentConfig?.title}
        </Title>
      </div>

      <Row gutter={[10, 10]} className="mb-6 flex-wrap">
        <Col xs={24} sm={6}>
          <Button
            size="large"
            type="default"
            className="h-[50px]! w-full mb-2 sm:mb-0"
            onClick={() => handleBrandClick('Tất cả')}
          >
            Tất cả
          </Button>
        </Col>
        {brands.map((brand, index) => (
          <Col xs={12} sm={6} md={6} lg={4} key={index}>
            <Button
              size="large"
              type="default"
              onClick={() => handleBrandClick(brand)}
              className={`
                w-full h-[50px]! 
                flex items-center justify-center 
                transition-all duration-300 ease-in-out
                hover:shadow-lg hover:scale-105
                ${brand === currentBrand ? 'border-1! border-primary!' : 'border border-gray-300'}
              `}
            >
              {brand?.logo ? (
                <div className="flex items-center justify-center w-full h-full p-2">
                  <img
                    src={brand?.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <span className="text-sm font-medium text-center px-2">
                  {brand.name}
                </span>
              )}
            </Button>
          </Col>
        ))}
      </Row>

      <Row gutter={[10, 10]}>
        <Col xs={24} md={8} lg={6} xl={5} xxl={4}>
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 sticky top-6">
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
              <div className="grid grid-cols-2 gap-2">
                {brands.slice(0, 6).map((brand, index) => (
                  <Button
                    key={index}
                    size="small"
                    type={currentBrand === brand ? 'primary' : 'default'}
                    onClick={() => handleBrandClick(brand)}
                    className="text-xs! p-2! rounded-[10px]!"
                  >
                    {brand.name}
                  </Button>
                ))}
              </div>
            </div>

            <Collapse defaultActiveKey={['price']} ghost>
              <Panel header="Mức giá" key="price">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox
                      checked={
                        filter.price === null && filter.priceRange === null
                      }
                      onChange={() => {
                        setFilter((prev) => ({
                          ...prev,
                          price: null,
                          priceRange: null,
                        }));
                        setSearchParams({
                          _page: '1',
                          _limit: _limit.toString(),
                        });
                      }}
                    >
                      <Text className="text-sm! text-gray-600!">Tất cả</Text>
                    </Checkbox>
                  </div>
                  {currentConfig.priceRanges.map((range, index) => (
                    <div key={index} className="flex! items-center">
                      <Checkbox
                        checked={
                          JSON.stringify(filter.price) ===
                          JSON.stringify(range.value)
                        }
                        onChange={() => {
                          setFilter((prev) => ({
                            ...prev,
                            price:
                              JSON.stringify(prev.price) ===
                              JSON.stringify(range.value)
                                ? null
                                : range.value,
                            priceRange: null,
                          }));
                          setSearchParams({
                            _page: '1',
                            _limit: _limit.toString(),
                          });
                        }}
                      >
                        <Text className="text-sm! text-gray-600!">
                          {range.label}
                        </Text>
                      </Checkbox>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Text className="text-sm! text-gray-600! mb-2 block!">
                    Hoặc nhập khoảng giá phù hợp:
                  </Text>
                  <div className="mb-4!">
                    <Slider
                      range
                      min={currentConfig.minPrice}
                      max={currentConfig.maxPrice}
                      defaultValue={[
                        currentConfig.minPrice,
                        currentConfig.maxPrice,
                      ]}
                      value={
                        filter.priceRange || [
                          currentConfig.minPrice,
                          currentConfig.maxPrice,
                        ]
                      }
                      step={100000}
                      onChange={handlePriceRangeChange}
                      tooltip={{
                        formatter: (value) => formatCurrency(value) + ' ₫',
                      }}
                    />
                  </div>
                  <div className="flex! justify-between! text-xs! text-gray-500! mt-2!">
                    <span>
                      {formatCurrency(
                        filter.priceRange?.[0] || currentConfig.minPrice,
                      )}{' '}
                      vnđ
                    </span>
                    <span>
                      {formatCurrency(
                        filter.priceRange?.[1] || currentConfig.maxPrice,
                      )}{' '}
                      vnđ
                    </span>
                  </div>
                </div>
              </Panel>

              {currentConfig.filters.operatingSystems &&
                renderFilterPanel(
                  'os',
                  'Hệ điều hành',
                  currentConfig.filters.operatingSystems,
                )}

              {currentConfig.filters.ramCapacities &&
                renderFilterPanel(
                  'ram',
                  'Dung lượng RAM',
                  currentConfig.filters.ramCapacities,
                )}

              {currentConfig.filters.storageCapacities &&
                renderFilterPanel(
                  'storage',
                  'Dung lượng bộ nhớ',
                  currentConfig.filters.storageCapacities,
                )}

              {currentConfig.filters.processors &&
                renderFilterPanel(
                  'processor',
                  'Bộ xử lý',
                  currentConfig.filters.processors,
                )}

              {currentConfig.filters.screenSize &&
                renderFilterPanel(
                  'screenSize',
                  'Kích thước màn hình',
                  currentConfig.filters.screenSize,
                )}

              {currentConfig.filters.batteryCapacity &&
                renderFilterPanel(
                  'batteryCapacity',
                  'Dung lượng pin',
                  currentConfig.filters.batteryCapacity,
                )}

              {currentConfig.filters.batteryLife &&
                renderFilterPanel(
                  'batteryLife',
                  'Thời lượng pin',
                  currentConfig.filters.batteryLife,
                )}

              {currentConfig.filters.connectivity &&
                renderFilterPanel(
                  'connectivity',
                  'Kết nối',
                  currentConfig.filters.connectivity,
                )}

              {currentConfig.filters.graphicsCard &&
                renderFilterPanel(
                  'graphicsCard',
                  'Card đồ họa',
                  currentConfig.filters.graphicsCard,
                )}

              {currentConfig.filters.features &&
                renderFilterPanel(
                  'features',
                  'Tính năng',
                  currentConfig.filters.features,
                )}
            </Collapse>
          </div>
        </Col>

        <Col xs={24} md={16} lg={18} xl={19} xxl={20}>
          <div className="bg-white rounded-lg shadow-sm p-2 md:p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-2 md:p-4 gap-2">
              <Text className="text-sm text-gray-600">
                Tìm thấy{' '}
                <span className="font-semibold">
                  {filteredProducts.length}
                </span>{' '}
              </Text>

              <div className="flex flex-wrap items-center gap-4 md:gap-4">
                <div className="flex items-center gap-4 ">
                  <Button
                    className="p-3! border-none! rounded-xl!"
                    type={sort === null ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleSortChange(null)}
                  >
                    Nổi bật
                  </Button>
                  <Button
                    className="p-3! border-none! rounded-xl!"
                    type={sort === 1 ? 'primary' : 'default'}
                    size="small"
                    onClick={() => handleSortChange(1)}
                  >
                    Giá tăng dần
                  </Button>
                  <Button
                    className="p-3! border-none! rounded-xl!"
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
            ) : paginatedProducts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {paginatedProducts.map((product, index) => (
                  <Col
                    key={index}
                    xs={24}
                    sm={12}
                    md={12}
                    lg={8}
                    xl={6}
                    xxl={4}
                  >
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

          {!loading && filteredProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-2 md:p-4 w-full md:w-[50%] mx-auto">
              <Flex justify="center">
                <Pagination
                  total={filteredProducts.length}
                  current={_page}
                  pageSize={_limit}
                  onChange={handlePaginationChange}
                  onShowSizeChange={handlePaginationChange}
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
