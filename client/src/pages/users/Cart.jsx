import React, { useEffect, useState } from 'react';
import CartServices from '@services/carts';
import { useAppContext } from '@/contexts';
import {
  Table,
  Button,
  InputNumber,
  Typography,
  Empty,
  Flex,
  Modal,
  Divider,
  Spin,
  Card,
  Space,
  Tag,
  Image,
  Tooltip,
  Row,
  Col,
} from 'antd';
import { Link } from 'react-router-dom';
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

function Cart() {
  const { message, user } = useAppContext();
  const [open, setOpen] = useState(false);
  const [modalText, setModalText] = useState();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteType, setDeleteType] = useState('item');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const getCart = async () => {
    try {
      const cartServices = new CartServices();
      const response = await cartServices.get();
      if (response.status === 200) {
        setCartItems(response.data.data.items);
        setLoading(false);
      }
    } catch (error) {
      message.error('Không thể lấy giỏ hàng!');
      console.error('Lỗi khi lấy giỏ hàng:', error);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  const updateQuantity = (id, value) => {
    if (value < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.product._id === id ? { ...item, quantity: value } : item,
      ),
    );
  };

  const handleRemoveItems = async (productId, variantId) => {
    try {
      setConfirmLoading(true);
      const cartServices = new CartServices();
      const response = await cartServices.deleteOne(productId, variantId);
      if (response.status === 200) {
        await getCart();
        message.destroy();
        message.success('Xóa sản phẩm khỏi giỏ hàng thành công');
        setOpen(false);
        setConfirmLoading(false);
        return;
      }
      throw new Error('Xóa sản phẩm khỏi giỏ hàng thất bại');
    } catch (error) {
      message.error('Xóa sản phẩm khỏi giỏ hàng thất bại');
      console.error('Lỗi khi xóa sản phẩm khỏi giỏ hàng:', error);
    }
  };

  const handleRemoveAllItems = async (userId) => {
    try {
      setConfirmLoading(true);
      const cartServices = new CartServices();
      const response = await cartServices.delete(userId);
      if (response.status === 200) {
        await getCart();
        setSelectedRowKeys([]);
        message.destroy();
        message.success('Xóa tất cả sản phẩm khỏi giỏ hàng thành công');
        setOpen(false);
        setConfirmLoading(false);
        return;
      }
      throw new Error('Xóa tất cả sản phẩm khỏi giỏ hàng thất bại');
    } catch (error) {
      message.destroy();
      message.error('Xóa tất cả sản phẩm khỏi giỏ hàng thất bại');
      console.error('Lỗi khi xóa tất cả sản phẩm khỏi giỏ hàng:', error);
    }
  };

  const showModal = () => {
    setOpen(true);
    if (deleteType === 'item')
      setModalText('Bạn có chắc chắn muốn xóa sản phẩm này không?');

    if (deleteType === 'all')
      setModalText(
        'Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng không?',
      );
  };

  const handleOk = () => {
    if (deleteType === 'item')
      handleRemoveItems(deleteItem.product._id, deleteItem.variant._id);

    if (deleteType === 'all') {
      handleRemoveAllItems(user._id);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shippingFee = 0;

  const calculateDiscountedPrice = (item) => {
    const originalPrice = item?.variant?.price * item.quantity;
    const discountAmount = originalPrice * (item.product.discount / 100);
    return originalPrice - discountAmount;
  };

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (_, item) => {
        return (
          <div className="flex items-center gap-3">
            <div className=" bg-gray-100 my-2.5 rounded-lg flex items-center justify-center overflow-hidden">
              <Image
                src={item?.variant?.images[0] || '/placeholder-image.jpg'}
                alt={item?.variant?.name}
                width={64}
                height={64}
                className="object-cover"
                fallback="/placeholder-image.jpg"
              />
            </div>
            <div className="flex-1">
              <Link to={`/product/${item.product._id}`}>
                <Text className="text-gray-900 font-medium text-base hover:text-blue-600 hover:underline cursor-pointer">
                  {item?.variant?.name}
                </Text>
              </Link>
              {item.product.discount > 0 && (
                <div className="mt-1">
                  <Tag color="red" className="text-xs">
                    -{item.product.discount}%
                  </Tag>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      width: '20%',
      render: (_, item) => (
        <div className="text-center">
          <Text className="text-gray-900 font-medium text-base">
            {`${item?.variant?.price.toLocaleString()}₫`}
          </Text>
        </div>
      ),
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      align: 'center',
      width: '25%',
      render: (_, item) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="flex items-center justify-center w-8 h-8"
          />
          <InputNumber
            min={1}
            value={item.quantity}
            onChange={(value) => updateQuantity(item.product._id, value)}
            className="w-16 text-center"
            controls={false}
          />
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
            className="flex items-center justify-center w-8 h-8"
          />
        </div>
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'center',
      width: '15%',
      render: (_, item) => {
        const discountedPrice = calculateDiscountedPrice(item);
        const originalPrice = item?.variant?.price * item.quantity;

        return (
          <div className="text-center">
            <Text className="text-gray-900 font-semibold text-base">
              {`${discountedPrice.toLocaleString()}₫`}
            </Text>
            {item.product.discount > 0 && (
              <div className="text-xs text-gray-500 line-through mt-1">
                {`${originalPrice.toLocaleString()}₫`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'action',
      align: 'center',
      width: '5%',
      render: (_, item) => (
        <Tooltip title="Xóa sản phẩm">
          <Button
            icon={<DeleteOutlined />}
            danger
            type="text"
            onClick={() => {
              setDeleteType('item');
              showModal();
              setDeleteItem(item);
            }}
            className="hover:bg-red-50"
          />
        </Tooltip>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User',
      name: record.name,
    }),
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex justify-center items-center">
        <div className="text-center">
          <Spin size="large" />
          <div className="mt-4 text-gray-500">Đang tải giỏ hàng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 mt-24 w-full">
      <Modal
        centered
        open={open}
        okText="Xóa"
        title={
          <div className="flex items-center gap-2">
            <DeleteOutlined className="text-red-500" />
            <span>Xác nhận xóa</span>
          </div>
        }
        cancelText="Hủy"
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        okButtonProps={{ danger: true }}
      >
        <p className="text-gray-700 py-4">{modalText}</p>
      </Modal>

      {cartItems.length === 0 ? (
        <Card className="text-center! shadow-none! flex! justify-center! py-20! h-[500px]!">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Text className="text-gray-500 text-lg">
                  Giỏ hàng của bạn đang trống
                </Text>
                <div className="mt-4">
                  <Link to="/">
                    <Button type="primary" size="large" className="rounded-lg">
                      Tiếp tục mua sắm
                    </Button>
                  </Link>
                </div>
              </div>
            }
          />
        </Card>
      ) : (
        <Row gutter={[10, 10]} className="w-full!">
          <Col span={18}>
            <Card className="shadow-none!">
              <div className="flex justify-between items-center mb-6">
                <Flex align="center" justify="space-between">
                  <Flex className="mb-8!" align="center">
                    <Title
                      level={2}
                      className="text-gray-900 font-bold flex items-center gap-3 mb-2"
                    >
                      <ShoppingCartOutlined />
                      Giỏ hàng của bạn
                    </Title>
                    <Text className="text-gray-600! block!">
                      {cartItems.length > 0
                        ? `${cartItems.length} sản phẩm`
                        : null}
                    </Text>
                  </Flex>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    type="text"
                    onClick={() => {
                      setModalText(
                        'Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng không?',
                      );
                      setOpen(true);
                      setDeleteType('all');
                    }}
                    disabled={
                      !(
                        selectedRowKeys.length === cartItems.length &&
                        cartItems.length > 0
                      )
                    }
                    className="hover:bg-red-50"
                  >
                    Xóa tất cả
                  </Button>
                </Flex>
              </div>

              <Table
                rowKey={(record) =>
                  `${record.product._id}-${record.variant._id}`
                }
                columns={columns}
                pagination={false}
                dataSource={cartItems}
                bordered
                className="w-full! rounded-md!"
                rowSelection={Object.assign({ type: 'checkbox' }, rowSelection)}
                locale={{
                  emptyText: <Empty description="Giỏ hàng trống" />,
                }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card className="shadow-sm sticky ">
              <div className="mb-6">
                <Title level={4} className="text-gray-900 font-semibold mb-0">
                  Tóm tắt đơn hàng
                </Title>
              </div>

              <div className="space-y-4">
                <Flex justify="space-between" align="center">
                  <Text className="text-gray-600">Tạm tính</Text>
                  <Text className="text-lg font-medium">
                    {total.toLocaleString()}₫
                  </Text>
                </Flex>

                <Flex justify="space-between" align="center">
                  <Text className="text-gray-600">Phí vận chuyển</Text>
                  <Text className="text-green-600 font-medium">
                    {shippingFee?.toLocaleString()
                      ? shippingFee?.toLocaleString()
                      : 'Miễn phí'}
                  </Text>
                </Flex>

                <Divider className="my-4" />

                <Flex justify="space-between" align="center">
                  <Text className="text-lg font-medium">Tổng cộng</Text>
                  <Text className="text-xl font-bold text-blue-600">
                    {total.toLocaleString()}₫
                  </Text>
                </Flex>

                <div className="pt-4">
                  <Link to="/order">
                    <Button
                      type="primary"
                      size="large"
                      icon={<CreditCardOutlined />}
                      className="w-full rounded-lg h-12 font-medium"
                      disabled={cartItems.length === 0}
                    >
                      Tiến hành thanh toán
                    </Button>
                  </Link>
                </div>

                <div className="text-center pt-2">
                  <Link to="/">
                    <Button type="link" className="text-blue-600">
                      ← Tiếp tục mua sắm
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default Cart;
