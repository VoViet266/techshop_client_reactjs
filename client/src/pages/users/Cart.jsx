import React from 'react';
import {
  Table,
  Button,
  InputNumber,
  Card,
  Typography,
  Space,
  message,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Cart() {
  const [cartItems, setCartItems] = React.useState([
    {
      id: 1,
      name: 'Sản phẩm A',
      price: 200000,
      quantity: 2,
    },
    {
      id: 2,
      name: 'Sản phẩm B',
      price: 150000,
      quantity: 1,
    },
  ]);

  const updateQuantity = (id, value) => {
    if (value < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: value } : item,
      ),
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    message.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()}₫`,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      render: (_, item) => (
        <InputNumber
          min={1}
          value={item.quantity}
          onChange={(value) => updateQuantity(item.id, value)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      render: (_, item) => `${(item.price * item.quantity).toLocaleString()}₫`,
    },
    {
      title: '',
      key: 'action',
      render: (_, item) => (
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => removeItem(item.id)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🛒 Giỏ hàng của bạn</Title>
      <Table
        columns={columns}
        dataSource={cartItems}
        rowKey="id"
        pagination={false}
        locale={{ emptyText: 'Giỏ hàng trống' }}
      />
      <Card style={{ marginTop: 24, textAlign: 'right' }}>
        <Space direction="vertical">
          <Text strong>Tổng tiền:</Text>
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
            {total.toLocaleString()}₫
          </Title>
          <Button type="primary" size="large" disabled={cartItems.length === 0}>
            Tiến hành thanh toán
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default Cart;
