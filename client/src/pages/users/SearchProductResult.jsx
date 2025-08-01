import {
  Flex,
  Result,
  Button,
  Typography,
  Select,
  Radio,
  Image,
  Space,
  Card,
  Row,
  Col,
  Divider,
  Slider,
  Checkbox,
  Segmented,
} from 'antd';
import Products from '@services/products';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BsFilter } from 'react-icons/bs';
import { useAppContext } from '@/contexts';
import { Content } from 'antd/es/layout/layout';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { formatCurrency } from '@/helpers';
import CardProduct from '@/components/products/Card';

const { Title, Text } = Typography;

function SearchProductResult() {
  const { query } = useParams();
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(null);
  const [filter, setFilter] = useState({
    price: null,
    priceRange: null,
  });
  const { message } = useAppContext();

  async function fetchSearchResult() {
    try {
      message.loading({
        content: 'Đang tìm kiếm sản phẩm...',
        key: 'search',
      });
      const result = await Products.search(query);
      message.destroy();
      setResult(result);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error({ content: 'Không tìm thấy sản phẩm nào', key: 'search' });
      console.error(error.message);
    }
  }

  useEffect(() => {
    fetchSearchResult();
  }, [query]);

  const filteredProducts = Array.isArray(result)
    ? result.filter((product) => {
        let matchPrice = true;
        const realPrice =
          product?.variants?.[0]?.price -
          product?.variants?.[0]?.price * (product?.discount / 100);

        // Lọc theo khoảng giá cố định
        if (filter.price) {
          const [minPrice, maxPrice] = filter.price;
          matchPrice = realPrice >= minPrice && realPrice <= maxPrice;
        }

        // Lọc theo khoảng giá slider
        if (filter.priceRange) {
          const [minPrice, maxPrice] = filter.priceRange;
          matchPrice = realPrice >= minPrice && realPrice <= maxPrice;
        }

        return matchPrice;
      })
    : [];

  const handleSortChange = (value) => {
    setSort(value);
  };

  const handleResetFilter = () => {
    setFilter({
      price: null,
      priceRange: null,
    });
    setSort(null);
  };

  const getSortedProducts = () => {
    let sortedProducts = [...filteredProducts];

    if (sort === 1) {
      // Giá tăng dần
      sortedProducts.sort((a, b) => {
        const priceA =
          a?.variants?.[0]?.price -
          a?.variants?.[0]?.price * (a?.discount / 100);
        const priceB =
          b?.variants?.[0]?.price -
          b?.variants?.[0]?.price * (b?.discount / 100);
        return priceA - priceB;
      });
    } else if (sort === 2) {
      // Giá giảm dần
      sortedProducts.sort((a, b) => {
        const priceA =
          a?.variants?.[0]?.price -
          a?.variants?.[0]?.price * (a?.discount / 100);
        const priceB =
          b?.variants?.[0]?.price -
          b?.variants?.[0]?.price * (b?.discount / 100);
        return priceB - priceA;
      });
    }

    return sortedProducts;
  };

  const handlePriceRangeChange = (value) => {
    setFilter((prev) => ({
      ...prev,
      priceRange: value,
      price: null,
    }));
  };

  const sortedProducts = getSortedProducts();

  const priceRange = [
    { label: 'Dưới 2 triệu', value: [0, 2000000] },
    { label: 'Từ 2 - 4 triệu', value: [2000000, 4000000] },
    { label: 'Từ 4 - 7 triệu', value: [4000000, 7000000] },
    { label: 'Từ 7 - 13 triệu', value: [7000000, 13000000] },
    { label: 'Từ 13 - 20 triệu', value: [13000000, 20000000] },
    { label: 'Từ 20 - 30 triệu', value: [20000000, 30000000] },
    { label: 'Trên 30 triệu', value: [30000000, 100000000] },
  ];

  const sliderPriceRange = { maxPrice: 100000000, minPrice: 0 };
  useEffect(() => {
    document.title = `Kết quả tìm kiếm cho "${query}"`;
  });
  return (
    <div className="w-full ">
      <Content className="mt-60! sm:mt-[10px]! ">
        <div className="my-20">
          <Title level={2} className="mb-2! flex! flex-col!  ">
            <span className="flex items-center gap-6">
              <SearchOutlined className="text-xl! sm:text-2xl   hidden! sm:block!" />
              <span>Kết quả tìm kiếm cho "{query}"</span>
            </span>
          </Title>

          <Text type="secondary" className="block text-sm sm:text-base">
            Tìm thấy {sortedProducts.length} sản phẩm
          </Text>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div>Đang tải...</div>
          </div>
        ) : result.length === 0 ? (
          <Result
            icon={<SearchOutlined />}
            title="Không tìm thấy sản phẩm nào"
            subTitle={`Không có sản phẩm nào phù hợp với từ khóa "${query}"`}
            extra={
              <Link to="/">
                <Button type="primary">Về trang chủ</Button>
              </Link>
            }
          />
        ) : (
          <Row gutter={[10, 10]}>
            <Col xs={24} md={24} lg={24} xl={6}>
              <Card
                title={
                  <div className="flex items-center gap-2 py-10!">
                    <BsFilter className="text-2xl" />
                    Bộ lọc tìm kiếm
                  </div>
                }
              >
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                  size="middle"
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
                        }}
                      >
                        <Text className="text-sm text-gray-600">Tất cả</Text>
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
                          }}
                        >
                          <Text className="text-sm text-gray-600">
                            {range.label}
                          </Text>
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4">
                    <Text className="text-sm text-gray-600 mb-2 block">
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
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
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
                </Space>
              </Card>
            </Col>

            <Col xs={24} md={24} lg={24} xl={18}>
              <Card>
                <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:justify-between sm:items-center ">
                  <Text strong>{sortedProducts.length} sản phẩm</Text>
                  <Space.Compact className="mb-10!">
                    <Segmented
                      className="p-6!"
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
                </div>

                {sortedProducts.length === 0 ? (
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
                      onClick={handleResetFilter}
                      className="w-200! h-40! rounded-full! mt-20!"
                    >
                      Xóa bộ lọc
                    </Button>
                  </Flex>
                ) : (
                  <Row gutter={[10, 10]}>
                    {sortedProducts.map((product) => (
                      <Col
                        key={product.id}
                        xs={24}
                        sm={12}
                        md={8}
                        lg={6}
                        xl={8}
                      >
                        <CardProduct product={product} />
                      </Col>
                    ))}
                  </Row>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </Content>
    </div>
  );
}

export default SearchProductResult;
