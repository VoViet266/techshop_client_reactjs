import {
  Spin,
  Row,
  Col,
  Typography,
  Button,
  Card,
  Rate,
  Space,
  Tabs,
  Image,
  Carousel,
  Flex,
  Drawer,
  Slider,
  Tag,
} from 'antd';
import { BsShop, BsSignTurnRightFill, BsCartPlusFill } from 'react-icons/bs';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  CreditCardOutlined,
  RightOutlined,
  MobileOutlined,
  LaptopOutlined,
  TabletOutlined,
} from '@ant-design/icons';
import Products from '@services/products';
import { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { useAppContext } from '@contexts';
import { Comments } from '@components/products';
import 'react-loading-skeleton/dist/skeleton.css';
import { ProductSpecification } from '@components/products';
import { ProductDescription } from '@components/products';
import {
  callFetchBranches,
  callFetchStats,
  callRecommentProduct,
} from '@/services/apis';
import { formatCurrency } from '@/helpers';
import CartServices from '@/services/carts';

import SliderProduct from '@/components/app/ImagesSlider';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Cấu hình cho từng loại sản phẩm
const PRODUCT_CONFIGS = {
  laptop: {
    icon: <LaptopOutlined />,
    highlightSpecs: [
      { key: 'processor', label: 'CPU', icon: '💻' },
      { key: 'graphics', label: 'Card đồ họa', icon: '🎮' },
      {
        key: 'displaySize',
        label: 'Kích thước màn hình',
        icon: '📱',
        unit: 'inch',
      },
      { key: 'ram', label: 'RAM', icon: '🔧' },
      { key: 'storage', label: 'Bộ nhớ trong', icon: '💾' },
      { key: 'operatingSystem', label: 'Hệ điều hành', icon: '🖥️' },
    ],
    variants: ['memory', 'color'],
    memoryDisplay: (memory) => `${memory.storage} - ${memory.ram}`,
  },
  smartphone: {
    icon: <MobileOutlined />,
    highlightSpecs: [
      { key: 'chipset', label: 'Chipset', icon: '🔬' },
      { key: 'displaySize', label: 'Màn hình', icon: '📱', unit: 'inch' },
      { key: 'camera', label: 'Camera chính', icon: '📷' },
      { key: 'battery', label: 'Pin', icon: '🔋', unit: 'mAh' },
      { key: 'operatingSystem', label: 'Hệ điều hành', icon: '📱' },
      { key: 'connectivity', label: 'Kết nối', icon: '📶' },
    ],
    variants: ['memory', 'color'],
    memoryDisplay: (memory) =>
      `${memory.storage}${memory.ram ? ` - ${memory.ram}` : ''}`,
  },
  tablet: {
    icon: <TabletOutlined />,
    highlightSpecs: [
      { key: 'processor', label: 'Processor', icon: '💻' },
      { key: 'displaySize', label: 'Màn hình', icon: '📱', unit: 'inch' },
      { key: 'camera', label: 'Camera', icon: '📷' },
      { key: 'battery', label: 'Pin', icon: '🔋', unit: 'mAh' },
      { key: 'operatingSystem', label: 'Hệ điều hành', icon: '📱' },
      { key: 'connectivity', label: 'Kết nối', icon: '📶' },
    ],
    variants: ['memory', 'color'],
    memoryDisplay: (memory) =>
      `${memory.storage}${memory.ram ? ` - ${memory.ram}` : ''}`,
  },
  headphones: {
    icon: <BsShop />,
    highlightSpecs: [
      { key: 'driverSize', label: 'Kích thước driver', icon: '🎵', unit: 'mm' },
      { key: 'frequency', label: 'Tần số', icon: '🎶' },
      { key: 'impedance', label: 'Trở kháng', icon: '⚡', unit: 'Ohm' },
      { key: 'connectivity', label: 'Kết nối', icon: '📶' },
      { key: 'battery', label: 'Pin', icon: '🔋', unit: 'giờ' },
      { key: 'noiseCancel', label: 'Chống ồn', icon: '🔇' },
    ],
    variants: ['color'],
    memoryDisplay: null,
  },
  // Có thể thêm các loại sản phẩm khác
  mouse: {
    icon: <BsShop />,
    highlightSpecs: [
      { key: 'dpi', label: 'DPI', icon: '🎯' },
      { key: 'pollingRate', label: 'Tần số phản hồi', icon: '🕒' },
      { key: 'switchType', label: 'Loại switch', icon: '🔘' },
      { key: 'weight', label: 'Trọng lượng', icon: '⚖️', unit: 'g' },
      { key: 'connectivity', label: 'Kết nối', icon: '📶' },
    ],
    variants: ['color'],
    memoryDisplay: null,
  },
};

// Component hiển thị thông số nổi bật
const HighlightSpecs = ({ product, productType, onSpecsClick }) => {
  const config = PRODUCT_CONFIGS[productType] || PRODUCT_CONFIGS.laptop;
  const specs = config.highlightSpecs;

  return (
    <div className="mt-10 p-5 border border-gray-300 rounded-lg">
      <Title level={4} className="mb-4 mt-10">
        Thông số nổi bật
      </Title>
      <Row
        gutter={16}
        onClick={onSpecsClick}
        style={{ cursor: 'pointer', padding: 20 }}
      >
        {specs.slice(0, 3).map((spec, index) => {
          const value = getSpecValue(product.specifications, spec);
          return (
            <Col span={8} key={index}>
              <div className="text-center p-3 bg-white rounded-lg border border-gray-300">
                <div className="text-2xl mb-2">{spec.icon}</div>
                <div className="font-medium">{spec.label}</div>
                <div className="text-sm text-gray-600">{value || 'N/A'}</div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

// Hàm lấy giá trị thông số
const getSpecValue = (specifications, spec) => {
  if (!specifications) return 'N/A';

  const value = specifications[spec.key];
  if (!value) return 'N/A';

  if (spec.unit) {
    return `${value} ${spec.unit}`;
  }

  return value;
};

// Component hiển thị variants linh hoạt
const VariantSelector = ({
  product,
  productType,
  selectedMemory,
  selectedColor,
  onMemoryChange,
  onColorChange,
}) => {
  const config = PRODUCT_CONFIGS[productType] || PRODUCT_CONFIGS.laptop;
  const hasMemoryVariants = config.variants.includes('memory');
  const hasColorVariants = config.variants.includes('color');

  return (
    <>
      {hasMemoryVariants && (
        <div className="mb-6">
          <Title level={5} className="mb-2">
            Phiên bản
          </Title>
          <Row gutter={[12, 12]}>
            {[
              ...new Map(
                product.variants.map((v) => [
                  `${v.memory?.ram || ''}-${v.memory?.storage || ''}`,
                  v,
                ]),
              ).values(),
            ].map((variant, index) => {
              const isSelected =
                selectedMemory?.ram === variant.memory?.ram &&
                selectedMemory?.storage === variant.memory?.storage;

              return (
                <Col xs={24} sm={12} md={8} key={`memory-${index}`}>
                  <Button
                    block
                    style={{
                      padding: '16px',
                      borderRadius: 8,
                      borderColor: isSelected ? '#1890ff' : '#d9d9d9',
                    }}
                    onClick={() => onMemoryChange(variant.memory)}
                  >
                    <Text strong>
                      {config.memoryDisplay
                        ? config.memoryDisplay(variant.memory)
                        : variant.memory?.storage || 'Mặc định'}
                    </Text>
                  </Button>
                </Col>
              );
            })}
          </Row>
        </div>
      )}

      {hasColorVariants && (
        <div className="mb-6">
          <Title level={5} className="mb-2">
            Màu sắc
          </Title>
          <Row gutter={[12, 12]}>
            {product.variants
              .filter((variant) => {
                if (!hasMemoryVariants) return true;
                return (
                  variant.memory?.ram === selectedMemory?.ram &&
                  variant.memory?.storage === selectedMemory?.storage
                );
              })
              .map((variant, index) => {
                const isSelected = selectedColor === variant.color?.name;

                return (
                  <Col xs={24} sm={12} md={8} key={`color-${index}`}>
                    <div
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                      style={{
                        border: isSelected
                          ? '2px solid #1890ff'
                          : '1px solid #d1d5db',
                      }}
                      onClick={() => onColorChange(variant.color?.name)}
                    >
                      <div className="w-50 h-50 bg-gray-100 rounded overflow-hidden">
                        <Image
                          preview={false}
                          src={
                            variant.images?.[0] ||
                            'https://dummyimage.com/200x200/ccc/000&text=No+Image'
                          }
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <Typography.Text strong className="block">
                          {variant.color?.name || 'Mặc định'}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {formatCurrency(variant.price)}đ
                        </Typography.Text>
                      </div>
                    </div>
                  </Col>
                );
              })}
          </Row>
        </div>
      )}
    </>
  );
};

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAppContext();
  const [comment, setComment] = useState('');
  const [product, setProduct] = useState({});
  const [branchs, setBranchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMemory, setSelectedMemory] = useState({});
  const [detailDrawerSpecsVisible, setDetailDrawerSpecsVisible] =
    useState(false);
  const [drawerAddressVisible, setDrawerAddessVisible] = useState(false);
  const [recommnentProducts, setRecommentProducts] = useState([]);
  const { message, setShowLogin } = useAppContext();
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  const getProductType = (product) => {
    if (!product.category) return 'laptop';

    const category = product.category.toLowerCase();
    if (category.includes('laptop') || category.includes('máy tính'))
      return 'laptop';
    if (category.includes('phone') || category.includes('điện thoại'))
      return 'smartphone';
    if (category.includes('tablet') || category.includes('máy tính bảng'))
      return 'tablet';
    if (category.includes('headphone') || category.includes('tai nghe'))
      return 'headphones';
    if (category.includes('mouse') || category.includes('chuột'))
      return 'mouse';

    return 'laptop';
  };

  const productType = getProductType(product);
  const productConfig = PRODUCT_CONFIGS[productType] || PRODUCT_CONFIGS.laptop;

  useEffect(() => {
    document.title = 'TechShop | Chi tiết sản phẩm';
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await Products.get(id);
        setProduct(res);

        if (res.variants && res.variants.length > 0) {
          const firstVariant = res.variants[0];
          setSelectedColor(firstVariant.color?.name || '');
          setSelectedMemory(firstVariant.memory || {});
        }
      } catch (error) {
        console.error('Đã có lỗi xảy ra:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [id]);

  const fetchStats = async () => {
    try {
      const res = await callFetchStats(id);
      setStats(res.data.data.data);
    } catch (error) {
      console.error('Đã có lỗi xảy ra:', error);
    }
  };

  const fetchRecommentProducts = async () => {
    try {
      setLoading(true);
      const res = await callRecommentProduct(id);
      setRecommentProducts(res.data.data);
    } catch (error) {
      console.error('Đã có lỗi xảy ra:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommentProducts();
  }, [id]);
  useEffect(() => {
    if (user && product?._id) {
 
    }
  }, [product, userId]);
  const fetchBranchs = async () => {
    try {
      const res = await callFetchBranches();
      setBranchs(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBranchs();
  }, []);

  const handleAddItemsToCart = async (items) => {
    const cartServices = new CartServices();
    try {
      message.loading({
        content: 'Đang thêm sản phẩm vào giỏ hàng...',
        key: 'loading',
      });
      const response = await cartServices.add(items);
      if (response.status === 201) {
        message.success({
          content: 'Thêm sản phẩm vào giỏ hàng thành công',
          key: 'loading',
        });
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error adding items to cart:', error);
      message.error('Đã có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    }
  };

  const handleMemoryChange = (memory) => {
    setSelectedMemory(memory);
    const matchedVariants = product.variants.filter(
      (v) =>
        v.memory?.ram === memory?.ram && v.memory?.storage === memory?.storage,
    );

    if (matchedVariants.length > 0) {
      const colorNames = matchedVariants.map((v) => v.color?.name);
      if (!colorNames.includes(selectedColor)) {
        setSelectedColor(matchedVariants[0].color?.name || '');
      }
    }
  };

  const handleColorChange = (colorName) => {
    setSelectedColor(colorName);
  };

  const selectedVariant = product?.variants?.find((v) => {
    const memoryMatch = productConfig.variants.includes('memory')
      ? v.memory?.ram === selectedMemory?.ram &&
        v.memory?.storage === selectedMemory?.storage
      : true;
    const colorMatch = productConfig.variants.includes('color')
      ? v.color?.name === selectedColor
      : true;
    return memoryMatch && colorMatch;
  });

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  const allImages = selectedVariant?.images || product.images || [];

  return (
    <div className="min-h-screen rounded-[10px]">
      <div className="max-w-7xl mx-auto rounded-[10px]">
        <Row gutter={[10, 10]}>
          <Col span={14}>
            <Card className="h-full!">
              <div className="relative border border-gray-200 rounded-[15px]">
                <SliderProduct images={allImages} />
              </div>
              <HighlightSpecs
                product={product}
                productType={productType}
                onSpecsClick={() => setDetailDrawerSpecsVisible(true)}
              />
            </Card>
          </Col>

          <Col span={10}>
            <Card>
              <div className="mb-4">
                <Title level={3} className="mb-2">
                  {product.name}
                </Title>
                <div className="flex items-center gap-20 mb-10">
                  <Rate
                    disabled
                    defaultValue={stats?.averageRating}
                    className="text-sm"
                  />
                  <Text type="secondary">
                    {stats?.totalComments} Lượt đánh giá
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    className="p-0"
                    onClick={() => setDetailDrawerSpecsVisible(true)}
                  >
                    Thông số kỹ thuật
                  </Button>
                </div>
              </div>

              <VariantSelector
                product={product}
                productType={productType}
                selectedMemory={selectedMemory}
                selectedColor={selectedColor}
                onMemoryChange={handleMemoryChange}
                onColorChange={handleColorChange}
              />

              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <Title level={2} className="text-red-600 mb-0">
                    {`${formatCurrency(selectedVariant?.price || product.price)}đ`}
                  </Title>
                  {selectedVariant?.compareAtPrice && (
                    <Text delete className="text-gray-500">
                      {`${formatCurrency(selectedVariant.compareAtPrice)}đ`}
                    </Text>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <Text strong className="block mb-3">
                  Chọn 1 trong các khuyến mãi sau:
                </Text>
                <div className="space-y-2">
                  <Card size="small" className="border-red-200 bg-red-50">
                    <div className="flex items-center gap-2">
                      <GiftOutlined className="text-red-500" />
                      <div>
                        <Text strong className="text-red-600">
                          Khuyến mãi 1
                        </Text>
                        <div className="text-sm">
                          Giảm ngay 2,500,000đ áp dụng đến 31/07
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card size="small" className="border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <CreditCardOutlined className="text-blue-500" />
                      <div>
                        <Text strong className="text-blue-600">
                          Khuyến mãi 2
                        </Text>
                        <div className="text-sm">Giảm ngay 1,700,000đ</div>
                        <div className="text-sm">Trả góp 0%</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="space-y-3">
                <Row gutter={[10, 10]}>
                  <Col span={12}>
                    <Button
                      type="primary"
                      size="large"
                      block
                      className="bg-red-600! hover:bg-red-700! border-red-600! font-semibold! hover:shadow-md! shadow-md!"
                      icon={<ShoppingCartOutlined />}
                      onClick={async () => {
                        if (!user) {
                          message.warning('Vui lòng đăng nhập để đặt hàng!!');
                          setShowLogin(true);
                          return;
                        }
                        await handleAddItemsToCart([
                          {
                            product: product._id,
                            variant: selectedVariant?._id,
                            quantity: 1,
                          },
                        ]);
                      }}
                    >
                      Mua ngay
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      size="large"
                      block
                      icon={<BsCartPlusFill />}
                      onClick={async () => {
                        if (!user) {
                          message.warning(
                            'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                          );
                          setShowLogin(true);
                          return;
                        }
                        await handleAddItemsToCart([
                          {
                            product: product._id,
                            variant: selectedVariant?._id,
                            quantity: 1,
                          },
                        ]);
                      }}
                    >
                      Thêm vào giỏ hàng
                    </Button>
                  </Col>
                  <Col span={24}>
                    <Card
                      className="shadow"
                      style={{ borderRadius: 8 }}
                      bodyStyle={{ padding: 16 }}
                      onClick={() => setDrawerAddessVisible(true)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <BsShop className="text-gray-500! text-xl!" />
                          <span className="font-medium text-gray-900">
                            Danh sách cửa hàng
                          </span>
                        </div>
                        <RightOutlined className="text-gray-400" />
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>

              <div className="mt-6 pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <Text>Bảo hành chính hãng 24 tháng</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <Text>Miễn phí giao hàng toàn quốc</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <Text>Đổi trả trong 7 ngày</Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[10, 10]} className="mt-6">
          <Col span={14}>
            <Card
              style={{
                width: '100%',
                maxWidth: '100%',
              }}
            >
              <Tabs defaultActiveKey="description">
                <TabPane tab="Mô tả sản phẩm" key="description">
                  <div style={{ width: '100%', maxWidth: '100%' }}>
                    <ProductDescription product={product} loading={loading} />
                  </div>
                </TabPane>
                <TabPane tab="Thông số kỹ thuật" key="specifications">
                  <div style={{ width: '900px', maxWidth: '100%' }}>
                    <ProductSpecification product={product} />
                  </div>
                </TabPane>
                <TabPane
                  tab="Đánh giá"
                  key="reviews"
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ width: '900px', maxWidth: '100%' }}>
                    <Comments
                      product={product}
                      loading={loading}
                      comment={comment}
                      setComment={setComment}
                    />
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
          <Col span={10}>
            <Card
              className="recomment-product"
              style={{
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
              }}
            >
              <Title
                level={3}
                style={{ marginBottom: '16px' }}
                className="mb-4"
              >
                Sản phẩm liên quan
              </Title>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {recommnentProducts && recommnentProducts.length > 0 ? (
                  recommnentProducts.map((product) => (
                    <Link key={product._id} to={`/product/${product._id}`}>
                      <div
                        key={product._id}
                        className="shadow p-[12px] border border-gray-200 rounded-lg cursor-pointer"
                      >
                        <div className="flex items-center gap-12">
                          <div className="w-[100px] h-[100px] overflow-hidden">
                            {product.variants?.[0]?.images?.length > 0 ? (
                              <Image
                                src={product.variants[0].images[0]}
                                className="w-[100px] h-[100px] object-cover"
                                preview={false}
                              />
                            ) : (
                              <div className="w-[100px] h-[100px] flex items-center justify-center bg-gray-100">
                                <span
                                  style={{
                                    color: '#9ca3af',
                                    fontSize: '12px',
                                  }}
                                >
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong ellipsis>
                              {product.name}
                            </Text>
                            <div className="flex items-center justify-between">
                              <span className="text-red-500 font-semibold">
                                {product.variants?.[0]?.price
                                  ? `${product.variants[0].price.toLocaleString('vi-VN')} đ`
                                  : 'Liên hệ'}
                              </span>
                            </div>
                            <div>
                              <Rate
                                disabled
                                defaultValue={product.rating || 0}
                                style={{ fontSize: '12px' }}
                              />
                              <span
                                style={{
                                  color: '#6b7280',
                                  fontSize: '12px',
                                }}
                              >
                                ({product.reviewCount || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#6b7280',
                      padding: '32px 0',
                    }}
                  >
                    Đang tải sản phẩm liên quan...
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Drawer
        open={detailDrawerSpecsVisible}
        placement="left"
        width={600}
        onClose={() => setDetailDrawerSpecsVisible(false)}
      >
        <ProductSpecification product={product} />
      </Drawer>

      <Drawer
        title={'Danh sách cửa hàng'}
        open={drawerAddressVisible}
        placement="right"
        onClose={() => setDrawerAddessVisible(false)}
        width={600}
        style={{ background: '#f5f5f5' }}
      >
        <Row gutter={[10, 10]}>
          {branchs.map((branch) => (
            <Col span={24} key={branch.id}>
              <Card title={branch.name} className="flex! flex-col! p-[10px]!">
                <Text strong className="block! text-[16px]! my-[5px]!">
                  {branch.address}
                </Text>
                <Button
                  icon={<BsSignTurnRightFill />}
                  className="flex! p-[20px]! w-[200px]! my-20! rounded-2xl! bg-primary! text-white! font-medium!"
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition((position) => {
                      const origin = `${position.coords.latitude},${position.coords.longitude}`;
                      const destination =
                        '16.163951015563573,107.69555685335028';
                      const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
                      window.open(url, '_blank');
                    });
                  }}
                >
                  Xem trên map
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Drawer>
    </div>
  );
}
export default ProductDetail;
