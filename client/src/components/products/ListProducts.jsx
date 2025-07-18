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

import { Filter, RotateCcw } from 'lucide-react';
import CardProduct from './Card';

const { Title, Text } = Typography;
const { Panel } = Collapse;

function ListProducts(properties) {
  const {
    sort,
    brands,
    filter,
    setSort,
    loading,
    setFilter,
    products,
    title,
    currentBrand,
    setCurrentBrand,
    filteredProducts,
    categoryConfig,
  } = properties;

  const [searchParams, setSearchParams] = useSearchParams();
  const _page = parseInt(searchParams.get('_page') || '1');
  const _limit = parseInt(searchParams.get('_limit') || '8');

  const priceRange = [
    { label: 'Dưới 2 triệu', value: [0, 2000000] },
    { label: 'Từ 2 - 4 triệu', value: [2000000, 4000000] },
    { label: 'Từ 4 - 7 triệu', value: [4000000, 7000000] },
    { label: 'Từ 7 - 13 triệu', value: [7000000, 13000000] },
    { label: 'Từ 13 - 20 triệu', value: [13000000, 20000000] },
    { label: 'từ 20 - 30 triệu', value: [20000000, 30000000] },
    { label: 'Trên 30 triệu', value: [30000000, 100000000] },
  ];
  const sliderPriceRange = { maxPrice: 100000000, minPrice: 0 };

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

  const handleFilterReset = () => {
    setFilter({});
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Kiểm tra xem có sản phẩm nào có memory không
  const hasMemoryProducts = products.some((product) =>
    product?.variants?.some(
      (variant) => variant?.memory?.ram || variant?.memory?.storage,
    ),
  );

  const getDynamicOptions = () => {
    const options = {};
    categoryConfig?.configFields?.extraFields?.forEach((field) => {
      const values = [
        ...new Set(
          products.map((p) => p?.attributes?.[field.name]).filter(Boolean),
        ),
      ];
      if (values.length > 0) {
        options[field.name] = values;
      }
    });
    return options;
  };

  const getMemoryOptions = () => {
    const ramOptions = new Set();
    const storageOptions = new Set();

    products.forEach((product) => {
      if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((variant) => {
          const ram = variant.memory?.ram;
          if (ram) {
            ramOptions.add(ram);
          }

          const storage = variant.memory?.storage;
          if (storage) {
            storageOptions.add(storage);
          }
        });
      }
    });
    return {
      ram: Array.from(ramOptions)
        .filter(Boolean) // Loại bỏ null/undefined
        .sort((a, b) => parseFloat(a) - parseFloat(b)),
      storage: Array.from(storageOptions)
        .filter(Boolean) // Loại bỏ null/undefined
        .sort((a, b) => parseFloat(a) - parseFloat(b)),
    };
  };

  const dynamicOptions = getDynamicOptions();
  const memoryOptions = hasMemoryProducts
    ? getMemoryOptions()
    : { ram: [], storage: [] };

  console.log('memoryOptions', memoryOptions);

  return (
    <div className="min-h-screen w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
        <Title level={3} className="mb-0! text-gray-800 font-extrabold!">
          {title?.name}
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-800">
                  Bộ lọc tìm kiếm
                </h3>
              </div>
              <button
                onClick={handleFilterReset}
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-13 h-13" />
                Làm mới
              </button>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2">
                {brands.slice(0, 6).map((brand, index) => (
                  <Button
                    key={index}
                    size="small"
                    type={currentBrand === brand ? 'primary' : 'default'}
                    onClick={() => handleBrandClick(brand)}
                    className="text-[16px]! p-8! h-[40px]! rounded-[5px]!"
                  >
                    {brand.name}
                  </Button>
                ))}
              </div>
            </div>

            <Collapse defaultActiveKey={['price']} bordered={false}>
              <Panel
                header={'Giá'}
                key="price"
                className="p-0! bg-gray-50! rounded-xl!"
              >
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
                  {priceRange.map((range, index) => (
                    <div key={index} className="flex! items-center">
                      <Checkbox
                        checked={
                          JSON.stringify(filter.price) ===
                          JSON.stringify(range.value)
                        }
                        value={range.value}
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
                <div className="mt-4 pt-4 ">
                  <Text className="text-sm! text-gray-600! mb-2 block!">
                    Hoặc nhập khoảng giá phù hợp:
                  </Text>
                  <div className="mb-4!">
                    <Slider
                      range
                      min={sliderPriceRange.minPrice}
                      max={sliderPriceRange.maxPrice}
                      defaultValue={[
                        sliderPriceRange.minPrice,
                        sliderPriceRange.maxPrice,
                      ]}
                      value={
                        filter.priceRange || [
                          sliderPriceRange.minPrice,
                          sliderPriceRange.maxPrice,
                        ]
                      }
                      step={100000}
                      onChange={handlePriceRangeChange}
                      tooltip={{
                        formatter: (value) => formatCurrency(value) + ' vn₫',
                      }}
                    />
                  </div>
                  <div className="flex! justify-between! text-xs! text-gray-500! mt-2!">
                    <span>
                      {formatCurrency(
                        filter.priceRange?.[0] || sliderPriceRange.minPrice,
                      )}{' '}
                      vnđ
                    </span>
                    <span>
                      {formatCurrency(
                        filter.priceRange?.[1] || sliderPriceRange.maxPrice,
                      )}{' '}
                      vnđ
                    </span>
                  </div>
                </div>
              </Panel>

              {/* Bộ lọc RAM - chỉ hiển thị khi có sản phẩm có memory */}
              {hasMemoryProducts && memoryOptions.ram.length > 0 && (
                <Panel
                  header="RAM"
                  key="ram"
                  className="p-0! bg-gray-50! rounded-xl! mb-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        checked={filter.ram === null}
                        onChange={() => {
                          setFilter((prev) => ({
                            ...prev,
                            ram: null,
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
                    {memoryOptions.ram.map((ramValue, index) => (
                      <div key={index} className="flex items-center">
                        <Checkbox
                          checked={filter.ram?.label === ramValue}
                          onChange={(e) =>
                            handleFilterChange(
                              'ram',
                              ramValue,
                              e.target.checked,
                            )
                          }
                        >
                          <Text className="text-sm! text-gray-600!">
                            {ramValue}
                          </Text>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {hasMemoryProducts && memoryOptions.storage.length > 0 && (
                <Panel
                  header="Dung lượng"
                  key="storage"
                  className="p-0! bg-gray-50! rounded-xl! mb-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Checkbox
                        checked={filter.storage === null}
                        onChange={() => {
                          setFilter((prev) => ({
                            ...prev,
                            storage: null,
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
                    {memoryOptions.storage.map((storageValue, index) => (
                      <div key={index} className="flex items-center">
                        <Checkbox
                          checked={filter.storage?.label === storageValue}
                          onChange={(e) =>
                            handleFilterChange(
                              'storage',
                              storageValue,
                              e.target.checked,
                            )
                          }
                        >
                          <Text className="text-sm! text-gray-600!">
                            {storageValue}
                          </Text>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {/* Các bộ lọc động khác */}
              {categoryConfig?.configFields?.extraFields
                ?.filter((field) => field.filterable)
                ?.map(
                  (field) =>
                    dynamicOptions[field.name]?.length > 0 && (
                      <Panel
                        header={field.label}
                        key={field.name}
                        className="p-0! bg-gray-50! rounded-xl! mb-4"
                      >
                        {dynamicOptions[field.name].map((value, index) => (
                          <div key={value}>
                            <Checkbox
                              checked={filter[field.name]?.label === value}
                              onChange={(e) =>
                                handleFilterChange(
                                  field.name,
                                  value,
                                  e.target.checked,
                                )
                              }
                            >
                              {typeof value === 'boolean'
                                ? value
                                  ? 'Có'
                                  : 'Không'
                                : value}
                            </Checkbox>
                          </div>
                        ))}
                      </Panel>
                    ),
                )}
            </Collapse>
          </div>
        </Col>

        <Col xs={24} md={16} lg={18} xl={19} xxl={20}>
          <div className="bg-white rounded-lg shadow-sm p-2 md:p-4 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-2 md:p-4 gap-2">
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                className="w-full"
                gap={16}
              >
                <Text className="text-gray-600">
                  Tìm thấy{' '}
                  <span className="font-semibold text-primary">
                    {filteredProducts.length}
                  </span>{' '}
                  sản phẩm
                </Text>

                <Space.Compact>
                  <Button
                    type={sort === null ? 'primary' : 'default'}
                    onClick={() => handleSortChange(null)}
                    className="rounded-l-xl"
                  >
                    Nổi bật
                  </Button>
                  <Button
                    type={sort === 1 ? 'primary' : 'default'}
                    onClick={() => handleSortChange(1)}
                  >
                    Giá tăng dần
                  </Button>
                  <Button
                    type={sort === 2 ? 'primary' : 'default'}
                    onClick={() => handleSortChange(2)}
                    className="rounded-r-xl"
                  >
                    Giá giảm dần
                  </Button>
                </Space.Compact>
              </Flex>
            </div>
          </div>

          <div className="mb-8">
            {loading ? (
              <Row gutter={[16, 16]}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <Col key={index} xs={12} sm={8} md={6} lg={6}>
                    <Skeleton.Input active className="w-full h-80 rounded-lg" />
                  </Col>
                ))}
              </Row>
            ) : paginatedProducts.length > 0 ? (
              <Row gutter={[16, 16]}>
                {paginatedProducts.map((product, index) => (
                  <Col key={index} xs={24} sm={12} lg={12} xl={8} xxl={6}>
                    <CardProduct
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
