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
} from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import { set } from 'react-hook-form';

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

  useEffect(() => {
    if (cartItems.length > 0) {
      console.log('Cart items:', cartItems);
    }
    if (deleteItem) {
      console.log('Delete item:', deleteItem);
    }
  }, [cartItems, deleteItem]);

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
        message.destroy();
        await getCart();
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
        message.destroy();
        message.success('Xóa tất cả sản phẩm khỏi giỏ hàng thành công');
        setCartItems([]);
        setSelectedRowKeys([]);
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
          onClick={() => {
            setDeleteType('item');
            showModal();
            setDeleteItem(item);
          }}
        />
      ),
    },
  ];

  const rowSelection = {
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: record.name === 'Disabled User', // Column configuration not to be checked
      name: record.name,
    }),
  };

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] px-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full px-50 py-20">
      <Title level={3} className="text-primary! font-bold!">
        Giỏ hàng của bạn
      </Title>

      <Modal
        centered
        open={open}
        okText="Xóa"
        title="Xác nhận"
        cancelText="Hủy"
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
      >
        <p>{modalText}</p>
      </Modal>

      <Flex className="w-full relative!" gap={12}>
        <Button
          icon={<DeleteOutlined />}
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
          className="absolute! z-10 left-840! -top-40"
        >
          Xóa tất cả
        </Button>
        <Table
          rowKey="id"
          columns={columns}
          pagination={false}
          dataSource={cartItems}
          className="w-2/3 border border-[#e5e7eb] rounded-lg! overflow-hidden!"
          rowSelection={Object.assign({ type: 'checkbox' }, rowSelection)}
          locale={{
            emptyText: <Empty description={<Text>Giỏ hàng trống</Text>} />,
          }}
        />

        <div className="border flex-1 rounded-md border-[#e5e7eb]">
          <div className="bg-[#f3f4f6] rounded-t-md px-12 py-6 font-medium">
            <Typography.Title level={5} className="m-0!">
              Thông tin đơn hàng
            </Typography.Title>
          </div>
          <div className="p-12 flex flex-col gap-10">
            <Flex justify="space-between">
              <Typography.Text className="text-lg!">Tổng tiền</Typography.Text>
              <Typography.Text
                level={3}
                className="m-0! text-primary! text-lg! font-medium!"
              >
                {total.toLocaleString()}đ
              </Typography.Text>
            </Flex>
            <Divider className="my-0!" />
            <Link to="/order">
              <Button
                type="primary"
                size="large"
                className="rounded-md! w-full!"
                disabled={cartItems.length === 0}
              >
                Tiến hành thanh toán
              </Button>
            </Link>
          </div>
        </div>
      </Flex>
    </div>
  );
}

export default Cart;
