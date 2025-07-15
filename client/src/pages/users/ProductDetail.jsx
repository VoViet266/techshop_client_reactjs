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
import {
  BsShop,
  BsSignTurnRightFill,
  BsCartPlusFill,
  BsFillGeoAltFill,
} from 'react-icons/bs';
import { BsFillTelephoneFill } from 'react-icons/bs';
import {
  ShoppingCartOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  CreditCardOutlined,
  RightOutlined,
} from '@ant-design/icons';
import Products from '@services/products';
import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import { useAppContext } from '@contexts';
import { Comments } from '@components/products';
import 'react-loading-skeleton/dist/skeleton.css';
import { ProductSpecification } from '@components/products';
import { ProductDescription } from '@components/products';
import { callFetchBranches, callFetchStats } from '@/services/apis';
import { formatCurrency } from '@/helpers';
import CartServices from '@/services/carts';

import SliderProduct from '@/components/app/ImagesSlider';
import Recomment from '@/services/recommend';
import Inventory from '@/services/inventories';
import { set } from 'react-hook-form';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAppContext();
  const [comment, setComment] = useState('');
  const [product, setProduct] = useState({});
  const [branchs, setBranchs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedMemory, setSelectedMemory] = useState({});
  const [selectBranchs, setSelectBranchs] = useState({});

  const [detailDrawerSpecsVisible, setDetailDrawerSpecsVisible] =
    useState(false);
  const [drawerAddressVisible, setDrawerAddessVisible] = useState(false);
  const [recommnentProducts, setRecommentProducts] = useState([]);
  const [branchStocks, setBranchStocks] = useState({});
  const { message, setShowLogin } = useAppContext();
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  const fetchProductDetail = async () => {
    try {
      const res = await Products.get(id);
      setProduct(res);
      console.log(res);
      setSelectedColor(res.variants[0].color?.name);
      setSelectedMemory(res.variants[0].memory);
    } catch (error) {
      console.error('Đã có lỗi xảy ra:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  useEffect(() => {
    document.title = 'TechShop | Chi tiết sản phẩm';

    fetchProductDetail();
    fetchBranchs();
    fetchStats();
  }, []);

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
      const res = await Recomment.getRecommendedProducts(id);
      setRecommentProducts(res);
    } catch (error) {
      console.error('Đã có lỗi xảy ra:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchBranchs = async () => {
    try {
      const res = await callFetchBranches();
      setBranchs(res.data.data);
      setSelectBranchs(res.data.data[0]._id);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchRecommentProducts();
  }, [id]);

  useEffect(() => {
    const record = async () => {
      if (product._id && user?._id) {
        try {
          await Promise.all([
            Products.upViewCount(product._id),
            Recomment.recordViewHistory({
              productId: product._id,
              userId: user._id,
            }),
          ]);
        } catch (err) {
          console.error('Failed to record view history', err);
        }
      }
    };

    if (!user && product?._id) {
      const viewed = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
      const updated = [
        product._id,
        ...viewed.filter((id) => id !== product._id),
      ].slice(0, 20);
      localStorage.setItem('viewedProducts', JSON.stringify(updated));
    }

    record();
  }, [product._id, user?._id]);

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
  const selectedVariant = product?.variants?.find(
    (v) =>
      v.memory?.ram === selectedMemory?.ram &&
      v.memory?.storage === selectedMemory?.storage &&
      v.color?.name === selectedColor,
  );

  useEffect(() => {
    const fetchBranchStocks = async () => {
      if (!selectedVariant?._id || !id || !branchs.length) return;

      const result = {};

      await Promise.all(
        branchs.map(async (branch) => {
          try {
            const res = await Inventory.getStockProduct(
              branch._id,
              selectedVariant._id,
              id,
            );
            result[branch._id] = res.data.data;
          } catch (err) {
            result[branch._id] = false;
          }
        }),
      );

      setBranchStocks(result);
    };

    fetchBranchStocks();
  }, [selectedVariant?._id, id, branchs]);

  const variantImages = selectedVariant?.images || [];
  const galleryImages = product.galleryImages || [];

  const allImages = [...variantImages, ...galleryImages];

  const currentStock = branchStocks[selectBranchs];

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full h-full font-inter mt-24 rounded-[10px] px-2 sm:px-4 lg:px-6">
      <div className="mx-auto rounded-[10px]">
        <Row gutter={[10, 10]}>
          <Col xl={14} lg={14} md={24} sm={24} xs={24}>
            <Card className="h-full">
              <div className="relative h-auto sm:h-[80%]">
                <SliderProduct images={allImages} />
              </div>
              <div className="p-2 sm:p-4">
                {branchs.length > 0 && (
                  <div className="space-y-4">
                    <Title level={5} className="mb-3 text-base sm:text-lg">
                      Danh sách cửa hàng
                    </Title>

                    <div className="grid grid-cols-1 gap-3">
                      {branchs.map((branch) => {
                        const inStock = branchStocks[branch._id];
                        return (
                          <Card
                            key={branch._id}
                            size="small"
                            onClick={() => {
                              console.log('branch._id', branch._id);
                              setSelectBranchs(branch._id);
                            }}
                            className="hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Text strong className="text-sm sm:text-base">
                                    {branch.name}
                                  </Text>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">
                                      <BsFillGeoAltFill />
                                    </span>
                                    <Text className="text-xs sm:text-sm text-gray-600">
                                      {branch.address}
                                    </Text>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500 text-sm">
                                      <BsFillTelephoneFill />
                                    </span>
                                    <Text className="text-xs sm:text-sm text-gray-600">
                                      {branch.phone || 'Chưa cập nhật'}
                                    </Text>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                {inStock === undefined ? (
                                  <Text className="text-gray-400 text-xs sm:text-sm">
                                    Đang kiểm tra...
                                  </Text>
                                ) : inStock ? (
                                  <Text className="text-xs! sm:text-sm! font-medium! text-green-500!">
                                    Còn hàng
                                  </Text>
                                ) : (
                                  <Text className="text-xs! sm:text-sm! font-medium! text-red-600!">
                                    Hết hàng
                                  </Text>
                                )}
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </Col>

          <Col xl={10} lg={10} md={24} sm={24} xs={24}>
            <Card>
              <div className="mb-4">
                <Title
                  level={3}
                  className="mb-2 text-lg sm:text-xl lg:text-2xl"
                >
                  {product.name}
                </Title>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 lg:gap-20 mb-6 sm:mb-10">
                  <Rate
                    disabled
                    defaultValue={stats?.averageRating}
                    className="text-sm"
                  />
                  <Text type="secondary" className="text-xs sm:text-sm">
                    {stats?.totalComments} Lượt đánh giá
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    className="p-0 text-xs sm:text-sm"
                    onClick={() => setDetailDrawerSpecsVisible(true)}
                  >
                    Thông số kỹ thuật
                  </Button>
                </div>
              </div>

              {/* Chỉ hiển thị phần Bộ nhớ nếu sản phẩm có memory */}
              {product.variants?.some(
                (v) => v.memory?.ram || v.memory?.storage,
              ) && (
                <div className="mb-6">
                  <Title level={5} className="mb-2 text-sm sm:text-base">
                    Bộ nhớ
                  </Title>
                  <Row gutter={[8, 8]}>
                    {[
                      ...new Map(
                        product.variants
                          ?.filter((v) => v.memory?.ram || v.memory?.storage) // Lọc variants có memory
                          ?.map((v) => [
                            `${v.memory?.ram || 'no-ram'}-${v.memory?.storage || 'no-storage'}`,
                            v,
                          ]),
                      ).values(),
                    ].map((variant, index) => {
                      const isSelected =
                        selectedMemory?.ram === variant.memory?.ram &&
                        selectedMemory?.storage === variant.memory?.storage;

                      return (
                        <Col span={12} key={`memory-${index}`}>
                          <Button
                            block
                            className={`py-10! sm:py-4! px-8! sm:px-4! rounded-lg! text-xs! sm:text-sm! ${
                              isSelected ? 'border! border-primary!' : ' '
                            } `}
                            onClick={() => {
                              setSelectedMemory(variant.memory);
                              const matchedVariants = product.variants.filter(
                                (v) =>
                                  v.memory?.ram === variant.memory?.ram &&
                                  v.memory?.storage === variant.memory?.storage,
                              );

                              if (matchedVariants.length > 0) {
                                const colorNames = matchedVariants.map(
                                  (v) => v.color?.name,
                                );
                                if (!colorNames.includes(selectedColor)) {
                                  setSelectedColor(
                                    matchedVariants[0].color?.name,
                                  );
                                }
                              }
                            }}
                          >
                            <Text strong className="text-xs! sm:text-sm!">
                              {variant.memory?.storage && variant.memory?.ram
                                ? `${variant.memory.storage} - ${variant.memory.ram}`
                                : variant.memory?.storage ||
                                  variant.memory?.ram ||
                                  'Không có thông số'}
                            </Text>
                          </Button>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              )}

              <div className="mb-6">
                <Title level={5} className="mb-2 text-sm sm:text-base">
                  Màu sắc
                </Title>
                <Row gutter={[8, 8]}>
                  {product.variants
                    ?.filter((variant) => {
                      // Nếu sản phẩm không có memory, hiển thị tất cả variants
                      if (
                        !product.variants?.some(
                          (v) => v.memory?.ram || v.memory?.storage,
                        )
                      ) {
                        return true;
                      }

                      // Nếu có memory, filter theo selectedMemory
                      if (selectedMemory) {
                        return (
                          variant.memory?.ram === selectedMemory?.ram &&
                          variant.memory?.storage === selectedMemory?.storage
                        );
                      }

                      // Nếu chưa chọn memory, không hiển thị variants nào
                      return false;
                    })
                    .map((variant, index) => {
                      const isSelected = selectedColor === variant.color?.name;

                      return (
                        <Col span={12} key={`color-${index}`}>
                          <div
                            className={
                              'flex items-center gap-4 py-10 sm:py-4 px-8 sm:px-4 rounded-lg text-xs sm:text-sm cursor-pointer hover:bg-gray-50 ' +
                              (isSelected
                                ? 'border border-primary bg-blue-50'
                                : 'border border-gray-200')
                            }
                            onClick={() =>
                              setSelectedColor(variant.color?.name)
                            }
                          >
                            <div className="w-40 h-40 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                              <Image
                                preview={false}
                                src={
                                  variant.images?.[0] ||
                                  'https://dummyimage.com/200x200/ccc/000&text=No+Image'
                                }
                                className="w-full! h-full! object-contain!"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Typography.Text
                                strong
                                className="block text-xs sm:text-sm truncate"
                              >
                                {variant.color?.name}
                              </Typography.Text>
                              <Typography.Text
                                type="secondary"
                                className="text-xs sm:text-sm"
                              >
                                {formatCurrency(variant.price)}đ
                              </Typography.Text>
                              {/* Hiển thị thông tin memory nếu có */}
                              {(variant.memory?.ram ||
                                variant.memory?.storage) && (
                                <Typography.Text
                                  type="secondary"
                                  className="block text-xs mt-1"
                                >
                                  {variant.memory?.storage &&
                                  variant.memory?.ram
                                    ? `${variant.memory.storage} - ${variant.memory.ram}`
                                    : variant.memory?.storage ||
                                      variant.memory?.ram}
                                </Typography.Text>
                              )}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                </Row>
              </div>

              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-2 sm:gap-3 mb-2">
                  <Title
                    level={2}
                    className="text-red-600 mb-0 text-xl sm:text-2xl lg:text-3xl"
                  >
                    {`${formatCurrency(selectedVariant?.price)}đ`}
                  </Title>
                  <Text delete className="text-gray-500 text-sm sm:text-base">
                    {`${formatCurrency(selectedVariant?.compareAtPrice)}đ`}
                  </Text>
                </div>
              </div>

              <div className="mb-6">
                <Text strong className="block mb-3 text-sm sm:text-base">
                  Chọn 1 trong các khuyến mãi sau:
                </Text>
                <div className="space-y-2">
                  <Card size="small" className="border-red-200 bg-red-50">
                    <div className="flex items-center gap-2">
                      <GiftOutlined className="text-red-500 flex-shrink-0" />
                      <div>
                        <Text
                          strong
                          className="text-red-600 text-xs sm:text-sm"
                        >
                          Khuyến mãi 1
                        </Text>
                        <div className="text-xs sm:text-sm">
                          Giảm ngay 2,500,000đ áp dụng đến 31/07
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card size="small" className="border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-2">
                      <CreditCardOutlined className="text-blue-500 flex-shrink-0" />
                      <div>
                        <Text
                          strong
                          className="text-blue-600 text-xs sm:text-sm"
                        >
                          Khuyến mãi 2
                        </Text>
                        <div className="text-xs sm:text-sm">
                          Giảm ngay 1,700,000đ
                        </div>
                        <div className="text-xs sm:text-sm">Trả góp 0%</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="space-y-3">
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Button
                      type="primary"
                      size="large"
                      block
                      disabled={!currentStock}
                      className="bg-red-600 hover:bg-red-700 border-red-600 font-semibold hover:shadow-md shadow-md h-auto py-2 sm:py-3 text-xs sm:text-sm"
                      icon={<ShoppingCartOutlined />}
                      onClick={async () => {
                        if (!user) {
                          message.warning('Vui lòng đăng nhập để đặt hàng!!');
                          setShowLogin(true);
                          return;
                        }

                        if (!currentStock) {
                          message.error(
                            'Sản phẩm đã hết hàng tại chi nhánh này',
                          );
                          return;
                        }

                        await handleAddItemsToCart([
                          {
                            product: product._id,
                            variant: selectedVariant._id,
                            branch: selectBranchs,
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
                      disabled={!currentStock}
                      className=" py-2! sm:py-3! text-xs! sm:text-sm!"
                      icon={<BsCartPlusFill />}
                      onClick={async () => {
                        if (!user) {
                          message.warning(
                            'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                          );
                          setShowLogin(true);
                          return;
                        }

                        if (!currentStock) {
                          message.error(
                            'Sản phẩm đã hết hàng tại chi nhánh này',
                          );
                          return;
                        }

                        await handleAddItemsToCart([
                          {
                            product: product._id,
                            variant: selectedVariant?._id,
                            branch: selectBranchs,
                            quantity: 1,
                          },
                        ]);
                      }}
                    >
                      <span className="hidden! sm:inline!">
                        Thêm vào giỏ hàng
                      </span>
                      <span className="sm:hidden!">Thêm vào giỏ</span>
                    </Button>
                  </Col>
                  {!currentStock && (
                    <Col span={24}>
                      <Text className="text-red-500! text-sm! sm:text-base! text-center! font-medium!">
                        Sản phẩm đang tạm hết hàng ở khu vực này. Vui lòng chọn
                        khu vực khác!
                      </Text>
                    </Col>
                  )}
                  <Col span={24}>
                    <Card
                      className="shadow"
                      style={{ borderRadius: 8 }}
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
                    <CheckCircleOutlined className="text-green-500 flex-shrink-0" />
                    <Text className="text-xs sm:text-sm">
                      Bảo hành chính hãng 24 tháng
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500 flex-shrink-0" />
                    <Text className="text-xs sm:text-sm">
                      Miễn phí giao hàng toàn quốc
                    </Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500 flex-shrink-0" />
                    <Text className="text-xs sm:text-sm">
                      Đổi trả trong 7 ngày
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[10, 10]} className="mt-6 sm:mt-8 lg:mt-10">
          <Col lg={14} md={24} sm={24} xs={24}>
            <Card>
              <Tabs defaultActiveKey="description" size="small">
                <TabPane tab="Mô tả sản phẩm" key="description">
                  <div className="w-full overflow-hidden">
                    <ProductDescription product={product} loading={loading} />
                  </div>
                </TabPane>
                <TabPane tab="Thông số kỹ thuật" key="specifications">
                  <div className="w-full overflow-hidden">
                    <ProductSpecification product={product} />
                  </div>
                </TabPane>
                <TabPane tab="Đánh giá" key="reviews">
                  <div className="w-full overflow-hidden">
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
          <Col lg={10} md={24} sm={24} xs={24}>
            <Card className="recomment-product">
              <Title level={3} className="mb-4 text-lg sm:text-xl">
                Sản phẩm liên quan
              </Title>
              <div className="flex flex-col gap-4">
                {recommnentProducts && recommnentProducts.length > 0 ? (
                  recommnentProducts.map((product) => (
                    <Link key={product._id} to={`/product/${product._id}`}>
                      <div className="shadow p-3 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 overflow-hidden flex-shrink-0">
                            {product.variants?.[0]?.images?.length > 0 ? (
                              <Image
                                src={product.variants[0].images[0]}
                                className="w-full h-full object-cover"
                                preview={false}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <span className="text-gray-400 text-xs">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text
                              strong
                              className="block text-sm sm:text-base line-clamp-2"
                            >
                              {product.name}
                            </Text>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-red-500 font-semibold text-sm sm:text-base">
                                {product.variants?.[0]?.price
                                  ? `${product.variants[0].price.toLocaleString('vi-VN')} đ`
                                  : 'Liên hệ'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Rate
                                disabled
                                defaultValue={product.rating || 0}
                                className="text-xs"
                              />
                              <span className="text-gray-500 text-xs">
                                ({product.reviewCount || 0})
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
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
        width={window.innerWidth > 768 ? 600 : '90%'}
        onClose={() => setDetailDrawerSpecsVisible(false)}
      >
        <ProductSpecification product={product} />
      </Drawer>

      <Drawer
        title="Danh sách cửa hàng"
        open={drawerAddressVisible}
        placement="right"
        onClose={() => setDrawerAddessVisible(false)}
        width={window.innerWidth > 768 ? 600 : '90%'}
        className="bg-gray-50"
      >
        <Row gutter={[10, 10]}>
          {branchs.map((branch) => (
            <Col span={24} key={branch.id}>
              <Card title={branch.name} className="p-2 sm:p-4">
                <Text strong className="block text-sm sm:text-base mb-2">
                  {branch.address}
                </Text>
                <Button
                  icon={<BsSignTurnRightFill />}
                  className="flex items-center justify-center py-2 sm:py-4 px-4 sm:px-6 w-full sm:w-auto rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
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
                  Xem chỉ đường
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
