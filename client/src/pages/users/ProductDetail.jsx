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
  BsFillGiftFill,
  BsCheckCircleFill,
} from 'react-icons/bs';
import '@styles/product-detail.css';
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
import { PreviewListProducts } from '@components/products';
import PromotionService from '@/services/promotions';
import WarrantyService from '@/services/warranties';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAppContext();
  const [promotions, setPromotions] = useState(null);
  const [warranties, setWarranties] = useState(null);
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

  
  const [showAllPromotions, setShowAllPromotions] = useState(false);
  const [showAllWarranties, setShowAllWarranties] = useState(false);
  const ITEMS_TO_SHOW = 4; // Số lượng items hiển thị ban đầu

  const fetchProductDetail = async () => {
    try {
      const res = await Products.get(id);
      setProduct(res);
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
    fetchPromotions();
    fetchWarranties();
    fetchBranchs();
    fetchStats();
  }, []);

  const fetchWarranties = async () => {
    try {
      const response = await WarrantyService.getAll();
      if (response.status === 200) {
        const warranties = response.data.data;
        setWarranties(warranties);
      }
    } catch (error) {
      console.error('Lỗi:', error.message);
    }
  };

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

  const fetchPromotions = async () => {
    try {
      const response = await PromotionService.getAll();
      if (response.status === 200) {
        const promotions = response.data.data;
        setPromotions(promotions);
      }
    } catch (error) {
      console.error('Lỗi:', error.message);
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

  // Helper functions để hiển thị items
  const getDisplayedPromotions = () => {
    if (!promotions) return [];
    return showAllPromotions ? promotions : promotions.slice(0, ITEMS_TO_SHOW);
  };

  const getDisplayedWarranties = () => {
    if (!warranties) return [];
    return showAllWarranties ? warranties : warranties.slice(0, ITEMS_TO_SHOW);
  };

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
            <div className="h-full bg-white rounded-xl p-20 flex! flex-col!">
              <div className="relative h-[60%] sm:h-[80%]">
                <SliderProduct images={allImages} />
              </div>
              <div className="sm:p-4 flex-1">
                {branchs.length > 0 && (
                  <div className="">
                    <Text
                      level={5}
                      className="text-primary! text-lg! font-medium! sm:text-lg"
                    >
                      Danh sách cửa hàng
                    </Text>

                    <div className="grid grid-cols-1 gap-10 mt-10">
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
                            className="hover:shadow-none! rounded-md! border-gray-300! cursor-default! transition-shadow"
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
                                  <Text className="text-xs! sm:text-sm! font-medium! bg-primary! rounded-full! text-white! px-8! py-4!">
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
            </div>
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 lg:gap-10 mb-6 sm:mb-10">
                  <Rate
                    disabled
                    defaultValue={stats?.averageRating}
                    className="text-sm"
                  />
                  <Text type="secondary" className="text-xs sm:text-sm">
                    {stats?.totalComments} lượt đánh giá
                  </Text>
                  <Button
                    type="link"
                    size="small"
                    className="p-0 text-xs text-primary! sm:text-sm"
                    onClick={() => setDetailDrawerSpecsVisible(true)}
                  >
                    Thông số kỹ thuật
                  </Button>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-10 sm:gap-3 mb-2">
                  <Title level={2} className="text-2xl! sm:text-2xl! mr-6!">
                    {`${formatCurrency(selectedVariant?.price - selectedVariant?.price * (product?.discount / 100))}đ`}
                  </Title>
                  <Text
                    delete
                    className="text-gray-500! text-base! sm:text-base!"
                  >
                    {`${formatCurrency(selectedVariant?.price)}đ`}
                  </Text>
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
                      // Tạo map để loại trùng theo `ram-storage`
                      ...new Map(
                        product.variants
                          ?.filter((v) => v.memory?.ram || v.memory?.storage)
                          .map((v) => {
                            const key = `${v.memory?.ram || 'no-ram'}-${v.memory?.storage || 'no-storage'}`;
                            return [key, v];
                          }),
                      ).values(),
                    ].map((variant, index) => {
                      const isSelected =
                        selectedMemory?.ram === variant.memory?.ram &&
                        selectedMemory?.storage === variant.memory?.storage;

                      return (
                        <Col xs={12} lg={12} xl={8} key={`memory-${index}`}>
                          <Button
                            block
                            className={`py-[20px]! sm:py-[25px]! px-8! sm:px-4! rounded-md! h-40! text-xs! sm:text-sm! ${
                              isSelected ? 'border! border-primary!' : ''
                            }`}
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
                            <Text className="text-sm! sm:text-sm!">
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
                              'flex items-center gap-4 py-10 sm:py-4 px-8 sm:px-4 text-xs bg-white! rounded-md! sm:text-sm cursor-pointer hover:bg-gray-50 ' +
                              (isSelected
                                ? 'border border-primary bg-blue-50'
                                : 'border border-gray-200')
                            }
                            onClick={() =>
                              setSelectedColor(variant.color?.name)
                            }
                          >
                            <div className="w-50 h-50 bg-gray-100 rounded overflow-hidden flex-shrink-0">
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

              <div className="my-20 flex flex-col gap-10">
                {/* Promotions Section với Show More */}
                <div className="border border-gray-300 rounded-md">
                  <div className="h-35 bg-[#f3f4f6] border-b rounded-t-md flex items-center justify-between border-b-gray-300 px-10">
                    <Typography.Text className="font-medium!">
                      Danh sách khuyến mãi
                    </Typography.Text>
                    {promotions && promotions.length > ITEMS_TO_SHOW && (
                      <Button
                        type="link"
                        size="small"
                        className="p-0 text-primary! text-xs!"
                        onClick={() => setShowAllPromotions(!showAllPromotions)}
                      >
                        {showAllPromotions
                          ? 'Thu gọn'
                          : `Xem thêm (${promotions.length - ITEMS_TO_SHOW})`}
                      </Button>
                    )}
                  </div>
                  <div className="p-10">
                    {getDisplayedPromotions().map((promotion, index) => {
                      return (
                        <div
                          key={index}
                          className="rounded-md! flex! p-8 gap-8 items-center! shadow-none!"
                        >
                          <BsFillGiftFill className="text-primary!" />
                          <Typography.Text>{promotion?.title}</Typography.Text>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Warranties Section với Show More */}
                <div className="border border-gray-300 rounded-md">
                  <div className="h-35 bg-[#f3f4f6] border-b rounded-t-md flex items-center justify-between border-b-gray-300 px-10">
                    <Typography.Text className="font-medium!">
                      Chính sách bảo hành
                    </Typography.Text>
                    {warranties && warranties.length > ITEMS_TO_SHOW && (
                      <Button
                        type="link"
                        size="small"
                        className="p-0 text-primary! text-xs!"
                        onClick={() => setShowAllWarranties(!showAllWarranties)}
                      >
                        {showAllWarranties
                          ? 'Thu gọn'
                          : `Xem thêm (${warranties.length - ITEMS_TO_SHOW})`}
                      </Button>
                    )}
                  </div>
                  <div className="p-10">
                    {getDisplayedWarranties().map((warranty, index) => {
                      return (
                        <div
                          key={index}
                          className="rounded-md! flex! p-8 gap-8 items-center! shadow-none!"
                        >
                          <BsCheckCircleFill className="text-primary!" />
                          <Typography.Text>{warranty?.name}</Typography.Text>
                        </div>
                      );
                    })}
                  </div>
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
                      className="bg-red-600 hover:bg-red-700 border-red-600 font-semibold hover:shadow-md shadow-md h-40! rounded-md! py-2 sm:py-3 text-xs sm:text-sm"
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
                      className=" py-2! sm:py-3! rounded-md! text-xs! h-40! sm:text-sm!"
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
                      <Text className="text-primary! text-sm! sm:text-base! text-center! font-medium!">
                        Sản phẩm đang tạm hết hàng ở khu vực này. Vui lòng chọn
                        khu vực khác!
                      </Text>
                    </Col>
                  )}
                  <Col span={24}>
                    <Card
                      className="shadow-none! rounded-md! hover:border-gray-300! cursor-pointer! mt-10!"
                      style={{ borderRadius: 8 }}
                      onClick={() => setDrawerAddessVisible(true)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-8">
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
            </Card>
          </Col>
        </Row>

        <Row gutter={[10, 10]} className="mt-6 sm:mt-8 lg:mt-10">
          <Col lg={14}>
            <Card className="p-10!">
              <ProductDescription product={product} loading={loading} />
            </Card>
          </Col>
          <Col lg={10}>
            <Card className="p-10!">
              <ProductSpecification product={product} />
            </Card>
          </Col>

          <Col lg={24} md={24} sm={24} xs={24}>
            {recommnentProducts && recommnentProducts.length > 0 && (
              <PreviewListProducts
                viewAll={false}
                title="Sản phẩm liên quan"
                products={recommnentProducts}
              />
            )}
          </Col>
        </Row>
        <Row gutter={[10, 10]} className="mt-6 sm:mt-8 lg:mt-10">
          <Col lg={24}>
            <Comments
              stats={stats}
              product={product}
              loading={loading}
              comment={comment}
              setComment={setComment}
            />
          </Col>
        </Row>
      </div>

      <Drawer
        title="Thông số kỹ thuật"
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
        className="custom-drawer-body"
      >
        <Row gutter={[10, 10]}>
          {branchs.map((branch) => (
            <Col span={24} key={branch.id}>
              <Card className="sm:p-4 flex! gap-8!">
                <Title level={5} className="mb-4!">
                  {branch.name}
                </Title>
                <Text className="block! text-sm! sm:text-base mb-8!">
                  {branch.address}
                </Text>
                <Button
                  icon={<BsSignTurnRightFill />}
                  type="primary"
                  className="flex! items-center! justify-center! py-2 sm:py-4 px-4 sm:px-6 w-full sm:w-auto shadow-none! rounded-full! border-none! text-white font-medium!"
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
