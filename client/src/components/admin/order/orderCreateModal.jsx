import { useAppContext } from '@/contexts';
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  Card,
  Col,
  Divider,
  Form,
  InputNumber,
  Modal,
  Row,
  Select,
  Typography,
  Button,
  Input,
  Table,
  Popconfirm,
  notification,
  Tag,
  Tooltip,
} from 'antd';
import get from 'lodash.get';
import { useState } from 'react';

const CreateOrderModal = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  productsInInventory,
  user,
  products,
}) => {
  const { message } = useAppContext();
  const [form] = Form.useForm();
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    items: [],
    paymentMethod: 'cash',
    branch: user?.branch,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const { Option } = Select;
  const { Text } = Typography;

  const PAYMENT_METHODS = [
    { value: 'cash', label: 'Thanh toán tiền mặt' },
    { value: 'momo', label: 'Thanh toán qua MOMO' },
    { value: 'bank', label: 'Thanh toán qua chuyển khoản' },
    { value: 'cod', label: 'Thanh toán khi nhận hàng' },
  ];

  // Hàm format tiền tệ (giả sử có sẵn)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const addProductToCart = () => {
    if (
      !selectedProduct ||
      !selectedVariant ||
      !selectedColor ||
      quantity <= 0
    ) {
      notification.warning({
        message: 'Thông tin chưa đầy đủ',
        description:
          'Vui lòng chọn sản phẩm, phân loại, màu sắc và nhập số lượng hợp lệ.',
        duration: 4,
      });
      return;
    }

    const existingItemIndex = orderData.items.findIndex(
      (item) =>
        item.product === selectedProduct._id &&
        item.variant === selectedVariant._id &&
        item.variantColor === selectedColor,
    );

    let newItems;
    if (existingItemIndex >= 0) {
      newItems = [...orderData.items];
      newItems[existingItemIndex].quantity += quantity;
    } else {
      const newItem = {
        product: selectedProduct._id,
        productName: selectedProduct.product.name,
        variant: selectedVariant.variantId._id,
        variantColor: selectedColor,
        variantName: selectedVariant.variantId.name,
        quantity: quantity,
        price: getPriceForSelectedVariant,
        branch: user?.branch,
      };

      newItems = [...orderData.items, newItem];
    }

    setOrderData({ ...orderData, items: newItems });
    setSelectedProduct(null);
    setSelectedVariant(null);
    setSelectedColor(null);
    setQuantity(1);
    message.success('Sản phẩm đã được thêm vào đơn hàng');
  };
  console.log('orderData', orderData);
  const removeProductFromCart = (index) => {
    const newItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({ ...orderData, items: newItems });
  };

  const updateCartItemQuantity = (index, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromCart(index);
      return;
    }

    const newItems = [...orderData.items];
    newItems[index].quantity = newQuantity;
    setOrderData({ ...orderData, items: newItems });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  };

  const handleSubmit = () => {
    if (!orderData.phone) {
      notification.warning({
        message: 'Thiếu thông tin bắt buộc',
        description: 'Vui lòng nhập số điện thoại khách hàng.',
        duration: 4,
      });
      return;
    }

    if (orderData.items.length === 0) {
      notification.warning({
        message: 'Giỏ hàng trống',
        description: 'Vui lòng thêm ít nhất một sản phẩm vào đơn hàng.',
        duration: 4,
      });
      return;
    }

    // Tính tổng tiền và thêm vào orderData
    const finalOrderData = {
      ...orderData,
      totalPrice: calculateTotal(),
      recipient: {
        name: orderData.name || 'Khách hàng',
        phone: orderData.phone,
        address: user?.branch?.address || '',
        note: '',
      },
      buyer: {
        name: orderData.name || 'Khách hàng',
        phone: orderData.phone,
        address: user?.branch?.address || '',
      },
      source: 'counter', // Đơn hàng tại quầy
    };

    onSubmit(finalOrderData);
  };

  const resetForm = () => {
    setOrderData({
      name: '',
      phone: '',
      items: [],
      paymentMethod: 'cash',
      branch: user?.branch,
    });
    setSelectedProduct(null);
    setSelectedVariant(null);
    setSelectedColor(null);
    setQuantity(1);
  };
  const variantColors =
    selectedProduct?.variants
      ?.filter((v) => v.variantId._id === selectedVariant?.variantId._id)
      ?.map((v) => v.variantColor) || [];
  const getPriceForSelectedVariant =
    products
      ?.find((p) => p._id === selectedProduct?.product?._id)
      ?.variants?.find((v) => v._id === selectedVariant?.variantId._id)
      ?.price || 0;
  console.log('selectedProduct', selectedProduct);
  console.log('selectedVariant', selectedVariant);
  console.log('selectedColor', selectedColor);

  return (
    <Modal
      title="Tạo Đơn Hàng Tại Quầy"
      open={visible}
      onCancel={() => {
        onCancel();
        resetForm();
      }}
      footer={[
        <Button
          key="cancel"
          onClick={() => {
            onCancel();
            resetForm();
          }}
        >
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          Tạo Đơn Hàng
        </Button>,
      ]}
      width={1000}
    >
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Khách hàng</Text>
            </div>
            <Input
              placeholder="Nhập tên khách hàng"
              value={orderData.name}
              onChange={(e) =>
                setOrderData({ ...orderData, name: e.target.value })
              }
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Số điện thoại</Text>
              <Text style={{ color: '#ff4d4f' }}> *</Text>
            </div>
            <Input
              placeholder="Nhập số điện thoại"
              value={orderData.phone}
              onChange={(e) =>
                setOrderData({ ...orderData, phone: e.target.value })
              }
            />
          </Col>
          <Col span={8}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Phương thức thanh toán</Text>
            </div>
            <Select
              style={{ width: '100%' }}
              value={orderData.paymentMethod}
              onChange={(value) =>
                setOrderData({ ...orderData, paymentMethod: value })
              }
            >
              {PAYMENT_METHODS.map((method) => (
                <Option key={method.value} value={method.value}>
                  {method.label}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Divider>Chọn sản phẩm</Divider>

        <Card
          size="small"
          style={{ marginBottom: 16, backgroundColor: '#fafafa' }}
        >
          <Row gutter={[10, 10]} align="bottom">
            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Sản phẩm</Text>
                <Text style={{ color: '#ff4d4f' }}> *</Text>
              </div>
              <Select
                showSearch
                placeholder="Tìm và chọn sản phẩm"
                style={{ width: '100%' }}
                value={selectedProduct?.product?._id}
                onChange={(value) => {
                  const product = productsInInventory?.find(
                    (inv) => inv.product?._id === value,
                  );

                  setSelectedProduct(product);
                  setSelectedVariant(null);
                  setSelectedColor(null);
                }}
               
              >
                {productsInInventory?.map((inventory) => (
                  <Option key={inventory._id} value={inventory.product?._id}>
                    {inventory.product?.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={12}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Phân loại</Text>
                <Text style={{ color: '#ff4d4f' }}> *</Text>
              </div>
              <Select
                placeholder="Chọn biến thể"
                style={{ width: '100%' }}
                value={selectedVariant?.variantId?._id}
                onChange={(value) => {
                  const variant = selectedProduct?.variants?.find(
                    (v) => v.variantId._id === value,
                  );

                  setSelectedVariant(variant);
                  setSelectedColor(null);
                }}
                disabled={!selectedProduct}
              >
                {selectedProduct?.variants?.map((variant) => (
                  <Option
                    key={variant.variantId._id}
                    value={variant.variantId._id}
                  >
                    <Tooltip title={variant.variantId.description}>
                      {variant.variantId.name}
                    </Tooltip>
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={8}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Màu sắc</Text>
                <Text style={{ color: '#ff4d4f' }}> *</Text>
              </div>
              <Select
                placeholder="Chọn màu"
                style={{ width: '100%' }}
                value={selectedColor}
                onChange={(value) => setSelectedColor(value)}
                disabled={!selectedVariant}
              >
                {variantColors.map((color) => (
                  <Option key={color} value={color}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: color?.toLowerCase(),
                          border: '1px solid #d9d9d9',
                        }}
                      />
                      {color}
                    </div>
                  </Option>
                ))}
              </Select>
            </Col>

            <Col span={7}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Số lượng</Text>
                <Text style={{ color: '#ff4d4f' }}> *</Text>
              </div>
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
              />
            </Col>

            <Col span={7}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Giá bán</Text>
              </div>
              <Input
                value={formatCurrency(getPriceForSelectedVariant) || '0'}
                disabled
                style={{ width: '100%' }}
              />
            </Col>

            <Col span={2}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addProductToCart}
                disabled={
                  !selectedProduct || !selectedVariant || !selectedColor
                }
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>

        <Divider>Giỏ hàng ({orderData.items.length} sản phẩm)</Divider>

        {orderData.items.length === 0 ? (
          <div
            style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}
          >
            <ShoppingCartOutlined
              style={{ fontSize: '48px', marginBottom: '16px' }}
            />
            <div>Chưa có sản phẩm nào trong giỏ hàng</div>
            <div>Vui lòng chọn sản phẩm ở trên để thêm vào đơn hàng</div>
          </div>
        ) : (
          <Table
            dataSource={orderData.items}
            pagination={false}
            size="small"
            rowKey={(record, index) =>
              `${record.product}-${record.variant}-${record.variantColor}-${index}`
            }
            columns={[
              {
                title: 'Sản phẩm',
                render: (_, item) => (
                  <div>
                    <div style={{ fontWeight: 500 }}>{item.productName}</div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <span>{item.variantName}</span>
                      <Tag color={item.variantColor?.toLowerCase()}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: item.variantColor?.toLowerCase(),
                              border: '1px solid #fff',
                            }}
                          />
                          {item.variantColor}
                        </div>
                      </Tag>
                    </div>
                  </div>
                ),
                width: '35%',
              },
              {
                title: 'Đơn giá',
                render: (_, item) => formatCurrency(item.price),
                align: 'right',
                width: '20%',
              },
              {
                title: 'Số lượng',
                render: (_, item, index) => (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      size="small"
                      icon={<MinusOutlined />}
                      onClick={() =>
                        updateCartItemQuantity(index, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    />
                    <InputNumber
                      size="small"
                      min={1}
                      value={item.quantity}
                      onChange={(value) =>
                        updateCartItemQuantity(index, value || 1)
                      }
                      style={{ width: '60px', margin: '0 8px' }}
                    />
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() =>
                        updateCartItemQuantity(index, item.quantity + 1)
                      }
                    />
                  </div>
                ),
                align: 'center',
                width: '25%',
              },
              {
                title: 'Thành tiền',
                render: (_, item) => (
                  <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                ),
                align: 'right',
                width: '15%',
              },
              {
                title: '',
                render: (_, item, index) => (
                  <Popconfirm
                    title="Bạn có chắc muốn xóa sản phẩm này?"
                    onConfirm={() => removeProductFromCart(index)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                ),
                width: '5%',
              },
            ]}
          />
        )}

        {orderData.items.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: 16,
              backgroundColor: '#f5f5f5',
              borderRadius: 6,
              textAlign: 'right',
            }}
          >
            <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
              Tổng cộng: {formatCurrency(calculateTotal())}
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CreateOrderModal;
