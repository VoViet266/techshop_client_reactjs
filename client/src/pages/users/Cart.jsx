import React, { useEffect, useState } from 'react';
import CartServices from '@services/carts';
import { useAppContext } from '@/contexts';
import {
  Table,
  Button,
  InputNumber,
  Card,
  Typography,
  Space,
  Empty,
  Skeleton,
} from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const { message } = useAppContext();
  const [loading, setLoading] = useState(true);

  const getCart = async () => {
    try {
      const cartServices = new CartServices();
      const response = await cartServices.get();
      if (response.status === 200) {
        setCartItems(response.data.data[0].items);
        setLoading(false);
        message.success('Lấy giỏ hàng thành công');
      }
    } catch (error) {
      message.error('Không thể lấy giỏ hàng');
      console.error('Lỗi khi lấy giỏ hàng:', error);
    }
  };

  useEffect(() => {
    getCart();
  }, []);

  // useEffect(() => {
  //   if (cartItems.length > 0) {
  //     console.log(cartItems);
  //   }
  // }, [cartItems]);

  const updateQuantity = (id, value) => {
    if (value < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.product._id === id ? { ...item, quantity: value } : item,
      ),
    );
  };

  const removeItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.product._id !== id));
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
      align: 'center',
      render: (_, item) => `${item?.variant?.name}`,
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'center',
      render: (_, item) => `${item?.variant?.price.toLocaleString()}₫`,
    },
    {
      title: 'Số lượng',
      key: 'quantity',
      align: 'center',
      render: (_, item) => (
        <InputNumber
          min={1}
          value={item.quantity}
          onChange={(value) => updateQuantity(item.product._id, value)}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'center',
      render: (_, item) =>
        `${(item?.variant?.price * item.quantity).toLocaleString()}₫`,
    },
    {
      title: 'Xóa',
      key: 'action',
      align: 'center',
      render: (_, item) => (
        <Button
          icon={<DeleteOutlined />}
          danger
          onClick={() => removeItem(item.product._id)}
        />
      ),
    },
  ];

  const renderSkeletonTable = () => {
    const skeletonRows = Array.from({ length: 4 });
    const cellStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    return (
      <div className="border-none! p-0!">
        {/* Header giả */}
        <div className="bg-[#fafafa] rounded-t-md py-12 px-16 border-b border-b-[#f0f0f0] font-medium flex items-center justify-between text-center">
          <div style={{ width: '25%', ...cellStyle }}>Sản phẩm</div>
          <div style={{ width: '15%', ...cellStyle }}>Đơn giá</div>
          <div style={{ width: '20%', ...cellStyle }}>Số lượng</div>
          <div style={{ width: '20%', ...cellStyle }}>Thành tiền</div>
          <div style={{ width: '10%', ...cellStyle }}>Xóa</div>
        </div>

        {/* Dòng skeleton */}
        {skeletonRows.map((_, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div style={{ width: '25%', ...cellStyle }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: '80%', borderRadius: 6 }}
              />
            </div>
            <div style={{ width: '15%', ...cellStyle }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: '70%', borderRadius: 6 }}
              />
            </div>
            <div style={{ width: '20%', ...cellStyle }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: '60%', borderRadius: 6 }}
              />
            </div>
            <div style={{ width: '20%', ...cellStyle }}>
              <Skeleton.Input
                active
                size="small"
                style={{ width: '70%', borderRadius: 6 }}
              />
            </div>
            <div style={{ width: '10%', ...cellStyle }}>
              <Skeleton.Button
                active
                size="small"
                shape="circle"
                style={{ width: 32, height: 32 }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full px-50 py-20">
      <Title level={3}>Giỏ hàng của bạn</Title>

      {loading ? (
        renderSkeletonTable()
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={cartItems}
            rowKey="id"
            pagination={false}
            locale={<Empty description={<Text>Giỏ hàng trống</Text>} />}
          />
          <Card className="mt-24! text-right!">
            <Space direction="vertical">
              <Text strong>Tổng tiền:</Text>
              <Title level={3} className="m-0!">
                {total.toLocaleString()}₫
              </Title>
              <Button
                type="primary"
                size="large"
                disabled={cartItems.length === 0}
                className="rounded-md!"
              >
                Tiến hành thanh toán
              </Button>
            </Space>
          </Card>
        </>
      )}
    </div>
  );
}

export default Cart;
