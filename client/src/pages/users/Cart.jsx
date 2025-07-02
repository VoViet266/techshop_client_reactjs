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
  Flex,
  Divider,
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
        setCartItems(response.data.data.items);
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

  const handleRemoveItems = async (id) => {
    try {
      const cartServices = new CartServices();
      const response = await cartServices.deleteOne(id);
    } catch (error) {}
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

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows,
      );
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  const renderSkeletonTable = () => {
    const skeletonRows = Array.from({ length: 4 });
    const cellStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    };

    return (
      <div className="border-none! flex gap-12 p-0!">
        <div className="bg-[#fafafa] rounded-t-md py-12 px-16 border-b border-b-[#f0f0f0] font-medium flex items-center justify-between text-center">
          <div style={{ width: '25%', ...cellStyle }}>Sản phẩm</div>
          <div style={{ width: '15%', ...cellStyle }}>Đơn giá</div>
          <div style={{ width: '20%', ...cellStyle }}>Số lượng</div>
          <div style={{ width: '20%', ...cellStyle }}>Thành tiền</div>
          <div style={{ width: '10%', ...cellStyle }}>Xóa</div>
        </div>

        {skeletonRows.map((_, idx) => (
          <div
            key={idx}
            className="w-2/3"
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
        <Flex className="w-full" gap={12}>
          <Table
            rowKey="id"
            columns={columns}
            pagination={false}
            className="w-2/3"
            dataSource={cartItems}
            locale={<Empty description={<Text>Giỏ hàng trống</Text>} />}
            rowSelection={Object.assign({ type: 'checkbox' }, rowSelection)}
          />

          <div className="border flex-1 rounded-md border-[#e5e7eb]">
            <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
              <Typography.Title level={5} className="m-0!">
                Thông tin đơn hàng
              </Typography.Title>
            </div>
            <div className="p-12 flex flex-col gap-10">
              <Flex justify='space-between'>
                <Typography.Text className="text-lg!">
                  Tổng tiền
                </Typography.Text>
                <Typography.Text
                  level={3}
                  className="m-0! text-lg! font-medium!"
                >
                  {total.toLocaleString()}₫
                </Typography.Text>
              </Flex>
              <Divider className="my-0!" />
              <Button
                type="primary"
                size="large"
                disabled={cartItems.length === 0}
                className="rounded-md!"
              >
                Tiến hành thanh toán
              </Button>
            </div>
          </div>
        </Flex>
      )}
    </div>
  );
}

export default Cart;
