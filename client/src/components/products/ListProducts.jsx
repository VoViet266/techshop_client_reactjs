import {
  Col,
  Row,
  Flex,
  Space,
  Image,
  Button,
  Skeleton,
  Typography,
  Pagination,
  Checkbox,
  Slider,
  Collapse,
  Segmented,
  Spin,
} from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { callFetchBrands } from '@/services/apis';
import { RotateCcw } from 'lucide-react';
import CardProduct from './Card';
import { BsFilter } from 'react-icons/bs';

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

  const uniqueRams = Array.from(
    new Set(memoryOptions.ram.map((r) => r.toLowerCase())),
  );
  const uniqueStorages = Array.from(
    new Set(memoryOptions.storage.map((s) => s.toLowerCase())),
  );
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
        <Col xs={24} md={24} lg={8} xl={6}>
          <div className="bg-white rounded-lg py-10 px-16 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-5">
                <BsFilter className="w-16! h-16!" />
                <Text
                  level={3}
                  className="text-lg! font-semibold! text-gray-800!"
                >
                  Bộ lọc tìm kiếm
                </Text>
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
              <div className="grid grid-cols-2 gap-8">
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

            <Collapse
              defaultActiveKey={['price']}
              bordered={false}
              className="bg-white!"
            >
              <Panel
                header={
                  <span className="text-gray-900 font-medium text-base">
                    Giá
                  </span>
                }
                key="price"
                className="!p-0 !bg-transparent !rounded-none"
              >
                <div className="px-6 pb-6 space-y-4">
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
                      <Text className="text-gray-600 text-sm font-normal">
                        Tất cả
                      </Text>
                    </Checkbox>
                  </div>

                  {priceRange.map((range, index) => (
                    <div key={index} className="flex items-center">
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
                        className="hover:!border-blue-500 focus:!border-blue-500"
                      >
                        <Text className="text-gray-600 text-sm font-normal">
                          {range.label}
                        </Text>
                      </Checkbox>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-100">
                    <Text className="text-gray-700 text-sm font-medium mb-4 block">
                      Hoặc nhập khoảng giá phù hợp:
                    </Text>
                    <div className="mb-4">
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
                          formatter: (value) => formatCurrency(value) + ' vnđ',
                        }}
                        className="!mb-0"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-3">
                      <span className="bg-gray-50 px-2 py-1 rounded-md">
                        {formatCurrency(
                          filter.priceRange?.[0] || sliderPriceRange.minPrice,
                        )}{' '}
                        vnđ
                      </span>
                      <span className="bg-gray-50 px-2 py-1 rounded-md">
                        {formatCurrency(
                          filter.priceRange?.[1] || sliderPriceRange.maxPrice,
                        )}{' '}
                        vnđ
                      </span>
                    </div>
                  </div>
                </div>
              </Panel>

              {/* Bộ lọc RAM */}
              {hasMemoryProducts && memoryOptions.ram.length > 0 && (
                <Panel
                  header={
                    <span className="text-gray-900 font-medium text-base">
                      RAM
                    </span>
                  }
                  key="ram"
                  className="!p-0 !bg-transparent !rounded-none !mt-2"
                >
                  <div className="px-6 pb-6 space-y-4">
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
                        className="hover:!border-blue-500 focus:!border-blue-500"
                      >
                        <Text className="text-gray-600 text-sm font-normal">
                          Tất cả
                        </Text>
                      </Checkbox>
                    </div>

                    {uniqueRams.map((ramValue, index) => {
                      const lowerRam = ramValue.toLowerCase();
                      return (
                        <div key={index} className="flex items-center">
                          <Checkbox
                            checked={
                              filter.ram?.label.toLowerCase() === lowerRam
                            }
                            onChange={(e) =>
                              handleFilterChange(
                                'ram',
                                ramValue,
                                e.target.checked,
                              )
                            }
                            className="hover:!border-blue-500 focus:!border-blue-500"
                          >
                            <Text className="text-gray-600 text-sm font-normal">
                              {ramValue.toUpperCase()}
                            </Text>
                          </Checkbox>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              )}

              {/* Bộ lọc Storage */}
              {hasMemoryProducts && memoryOptions.storage.length > 0 && (
                <Panel
                  header={
                    <span className="text-gray-900 font-medium text-base">
                      Dung lượng
                    </span>
                  }
                  key="storage"
                  className="!p-0 !bg-transparent !rounded-none !mt-2"
                >
                  <div className="px-6 pb-6 space-y-4">
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
                        <Text className="text-gray-600! text-sm! font-normal!">
                          Tất cả
                        </Text>
                      </Checkbox>
                    </div>

                    {uniqueStorages.map((storageValue, index) => (
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
                          <Text className="text-gray-600! text-sm! font-normal!">
                            {storageValue.toUpperCase()}
                          </Text>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
              {categoryConfig?.configFields?.extraFields
                ?.filter((field) => field.filterable)
                ?.map(
                  (field) =>
                    dynamicOptions[field.name]?.length > 0 && (
                      <Panel
                        header={
                          <span className="text-gray-900 font-medium text-base">
                            {field.label}
                          </span>
                        }
                        key={field.name}
                        className="!p-0 !bg-transparent !rounded-none !mt-2"
                      >
                        <div className="px-6 pb-6 space-y-4">
                          {dynamicOptions[field.name].map((value, index) => (
                            <div key={value} className="flex items-center">
                              <Checkbox
                                checked={filter[field.name]?.label === value}
                                onChange={(e) =>
                                  handleFilterChange(
                                    field.name,
                                    value,
                                    e.target.checked,
                                  )
                                }
                                className="hover:!border-blue-500 focus:!border-blue-500"
                              >
                                <Text className="text-gray-600 text-sm font-normal">
                                  {typeof value === 'boolean'
                                    ? value
                                      ? 'Có'
                                      : 'Không'
                                    : value}
                                </Text>
                              </Checkbox>
                            </div>
                          ))}
                        </div>
                      </Panel>
                    ),
                )}
            </Collapse>
          </div>
        </Col>

        <Col xs={24} md={24} lg={16} xl={18}>
          <div className="bg-white rounded-lg md:p-4 mb-6">
            <Flex vertical className="md:items-center! md:p-4! gap-2!">
              <Flex
                justify="space-between"
                align="center"
                wrap="wrap"
                className="w-full! px-10!"
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
                  <Segmented
                    className="p-6! mb-10!"
                    options={['Nổi bật', 'Giá tăng dần', 'Giá giảm dần']}
                    onChange={(value) => {
                      switch (value) {
                        case 'Nổi bật':
                          handleSortChange(null);
                          break;
                        case 'Giá tăng dần':
                          handleSortChange(1);
                          break;
                        case 'Giá giảm dần':
                          handleSortChange(2);
                          break;

                        default:
                          break;
                      }
                    }}
                  />
                </Space.Compact>
              </Flex>
              <div className="mb-8 w-full p-10">
                {loading ? (
                  <Row gutter={[16, 16]}>
                    {Array.from({ length: 8 }).map((_, index) => (
                      <Col key={index} xs={12} sm={8} md={6} lg={6}>
                        <Skeleton.Input
                          active
                          className="w-full h-80 rounded-lg"
                        />
                      </Col>
                    ))}
                  </Row>
                ) : paginatedProducts.length > 0 ? (
                  <>
                    <Row gutter={[10, 10]} className="">
                      {paginatedProducts.map((product, index) => (
                        <Col key={index} xs={24} sm={12} lg={12} xl={8} xxl={6}>
                          <CardProduct product={product} loading={loading} />
                        </Col>
                      ))}
                    </Row>
                    {filteredProducts.length > 0 && (
                      <div className="bg-white rounded-lg shadow-none p-2 md:p-4 w-full md:w-[50%] mx-auto mt-10">
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
                  </>
                ) : (
                  // <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  //   <Empty
                  //     image={Empty.PRESENTED_IMAGE_SIMPLE}
                  //     description={
                  //       <Text className="text-gray-500">
                  //         Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn
                  //       </Text>
                  //     }
                  //   />
                  //   <Button
                  //     type="primary"
                  //     onClick={handleFilterReset}
                  //     className="mt-4"
                  //   >
                  //     Đặt lại bộ lọc
                  //   </Button>
                  // </div>
                  <Flex vertical justify="center" align="center">
                    <div className="w-250 h-200 flex items-center justify-center mx-auto">
                      <Image
                        preview={false}
                        src="https://fptshop.com.vn/img/empty_state.png?w=640&q=75"
                      />
                    </div>
                    <Typography.Title level={3} className="mb-10!">
                      Không có sản phẩm nào phù hợp
                    </Typography.Title>
                    <Typography.Text>
                      Hãy thử điều chỉnh bộ lọc để tìm thấy sản phẩm phù hợp
                    </Typography.Text>
                    <Button
                      onClick={handleFilterReset}
                      className="w-200! h-40! rounded-full! mt-20!"
                    >
                      Xóa bộ lọc
                    </Button>
                  </Flex>
                )}
              </div>
            </Flex>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default ListProducts;
