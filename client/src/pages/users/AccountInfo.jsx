import React, { useEffect, useState } from 'react';
import {
  Menu,
  Spin,
  Card,
  Select,
  Flex,
  Input,
  Button,
  Space,
  List,
  Modal,
  Tabs,
  Tag,
  Table,
  Typography,
} from 'antd';
import { useAppContext } from '@/contexts';
import '@styles/account-info.css';
import dayjs from 'dayjs';
import ProductService from '@services/products';
import {
  UserOutlined,
  ShoppingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import Address from '@services/address';
import UserService from '@services/users';

const AccountInfoPage = () => {
  const { user, message } = useAppContext();
  const [wards, setWards] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [editingAddressIndex, setEditingAddressIndex] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState([]);
  const [deleteAddressIndex, setDeleteAddressIndex] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] =
    useState(false);
  const [selectedMenu, setSelectedMenu] = useState('personal');
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [updateUserInfo, setUpdateUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [ordersToShow, setOrdersToShow] = useState(null);
  const [orders, setOrders] = useState(null);
  const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statusOptions = [
    { value: 'PENDING', label: 'Chờ xử lý', color: 'orange' },
    { value: 'PROCESSING', label: 'Đang xử lý', color: 'cyan' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: 'blue' },
    { value: 'SHIPPING', label: 'Đang giao hàng', color: 'purple' },
    { value: 'DELIVERED', label: 'Đã giao hàng', color: 'green' },
    { value: 'CANCELLED', label: 'Đã hủy', color: 'red' },
    { value: 'RETURNED', label: 'Đã trả hàng', color: 'gray' },
  ];

  useEffect(() => {
    if (orders) {
      const ordersToShow = orders.map((order) => {
        return {
          id: order._id,
          date: order.createdAt,
          total: order.totalPrice,
          items: order.items,
          status: order.status,
        };
      });
      setOrdersToShow(ordersToShow);
    }
  }, [orders]);

  useEffect(() => {
    if (orders) {
      console.log(orders);
    }
  }, [orders]);

  const fetchProvinces = async () => {
    try {
      const provincesData = await Address.getAllProvinces();
      setProvinces(provincesData);
    } catch (error) {
      message.error('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const districtsData = await Address.getDistricts(provinceCode);
      setDistricts(districtsData);
      return districtsData;
    } catch (error) {
      message.error('Không thể tải danh sách quận/huyện');
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const wardsData = await Address.getWards(districtCode);
      setWards(wardsData);
      return wardsData;
    } catch (error) {
      message.error('Không thể tải danh sách xã/phường');
    }
  };

  const getUser = async () => {
    try {
      const userService = new UserService();
      const response = await userService.get(user._id);
      if (response.status === 200) {
        setUserInfo(response.data.data);
        setUpdateUserInfo(response.data.data);
        setLoading(false);
        return;
      }
      throw new Error('Lỗi khi lấy thông tin người dùng.');
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
    }
  };

  const getAllOrders = async () => {
    try {
      const productService = new ProductService();
      const response = await productService.getAllOrder();
      if (response.status === 200) {
        setOrders(response.data.data);
        return;
      }
      throw new Error('Không thể lấy danh sách đơn hàng.');
    } catch (error) {
      console.error('Lỗi:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const userService = new UserService();
      message.loading('Đang xóa địa chỉ');

      const isDefault = updateUserInfo.addresses[addressId].default;

      const updatedAddresses = updateUserInfo.addresses.filter(
        (_, index) => index !== addressId,
      );

      // Nếu địa chỉ bị xóa là mặc định, gán địa chỉ đầu tiên còn lại làm mặc định
      if (isDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].default = true;
      }

      const updatedUser = {
        ...updateUserInfo,
        addresses: updatedAddresses,
      };

      const response = await userService.update(updatedUser);

      if (response.status === 200) {
        await getUser();
        message.destroy();
        message.success('Xóa địa chỉ thành công');
      } else {
        throw new Error('Xóa thất bại');
      }
    } catch (error) {
      message.destroy();
      console.error('Lỗi khi xóa địa chỉ:', error);
      message.error('Xóa địa chỉ thất bại');
    }
  };

  const handleSetDefaultAddress = async (index) => {
    try {
      const userService = new UserService();
      message.loading('Đang cập nhật địa chỉ mặc định...');

      const updatedAddresses = updateUserInfo.addresses.map((addr, i) => ({
        ...addr,
        default: i === index, // Địa chỉ được chọn sẽ là mặc định
      }));

      const updatedUser = {
        ...updateUserInfo,
        addresses: updatedAddresses,
      };

      const response = await userService.update(updatedUser);
      if (response.status === 200) {
        await getUser();
        message.destroy();
      } else {
        throw new Error('Lỗi khi cập nhật');
      }
    } catch (error) {
      message.destroy();
      message.error('Không thể đặt làm mặc định');
      console.error(error);
    }
  };

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  const getAddress = async (editingAddress) => {
    if (editingAddress) {
      await fetchProvinces();
      const editingProvince = editingAddress.addressDetail.split(', ')[0];
      const selectedProvince = provinces.find(
        (province) => province.name === editingProvince,
      );
      setSelectedProvince(selectedProvince);

      const districtsData = await fetchDistricts(selectedProvince.code);
      const editingDistrict = editingAddress.addressDetail.split(', ')[1];
      const selectedDistrict = districtsData.find(
        (district) => district.name === editingDistrict,
      );
      setSelectedDistrict(selectedDistrict);

      const wardsData = await fetchWards(selectedDistrict.code);
      const editingWard = editingAddress.addressDetail.split(', ')[2];
      const selectedWard = wardsData.find((ward) => ward.name === editingWard);
      setSelectedWard(selectedWard);
    }
  };

  const updateAddress = async (updateUser) => {
    try {
      message.loading('Đang cập nhật');
      const userService = new UserService();
      const response = await userService.update(updateUser);
      if (response.status === 200) {
        await getUser();
        message.destroy();
        message.success('Cập nhật thông tin thành công');
        setIsAddressModalVisible(false);
        setEditingAddress(null);
        return;
      }
      throw new Error('Cập nhật thông tin thất bại');
    } catch (error) {
      console.error(error);
      message.destroy();
      message.error('Cập nhật thông tin thất bại');
    }
  };

  useEffect(() => {
    document.title = 'Thông tin cá nhân';
    getUser();
    getAllOrders();
    fetchProvinces();
  }, []);

  const menuItems = [
    {
      key: 'personal',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: 'Danh sách đơn hàng',
    },
  ];

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      PROCESSING: 'cyan',
      CONFIRMED: 'blue',
      SHIPPING: 'purple',
      DELIVERED: 'green',
      CANCELLED: 'red',
      RETURNED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const getStatusText = (status) => {
    const texts = {
      PROCESSING: 'Đang xử lý',
      CONFIRMED: 'Đã xác nhận',
      DELIVERED: 'Đã giao',
      SHIPPING: 'Đang giao',
      PENDING: 'Chờ xử lý',
      CANCELLED: 'Đã hủy',
      RETURNED: 'Đã trả hàng',
    };
    return texts[status] || status;
  };

  const getFilteredOrders = () => {
    if (!ordersToShow) return [];

    if (activeOrderTab === 'all') return ordersToShow;

    const statusMap = {
      processing: 'PENDING',
      shipping: 'SHIPPING',
      completed: 'DELIVERED',
      cancelled: 'CANCELLED',
    };

    return ordersToShow.filter(
      (order) => order.status === statusMap[activeOrderTab],
    );
  };

  const orderColumns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'date',
      key: 'date',
      render: (_, record) => {
        return dayjs(record.date).format('HH:mm:ss DD/MM/YYYY');
      },
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
      render: (item) => {
        return item[0].product.name;
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total',
      key: 'total',
      render: (total) => `${total.toLocaleString()} VND`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        console.log(status);
        return (
          <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <EyeOutlined
          onClick={() => {
            setSelectedOrder(record);
            setIsOrderDetailModalOpen(true);
          }}
        />
      ),
      align: 'center',
    },
  ];

  const renderPersonalInfo = () => (
    <Card className="p-12!">
      <Typography.Title level={5}>Thông tin cá nhân</Typography.Title>
      <div style={{ marginBottom: '16px' }}>
        <label
          className="text-primary"
          style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
        >
          Họ tên
        </label>
        <Input
          className="h-40!"
          placeholder="Nhập họ tên"
          value={updateUserInfo.name}
          onChange={(e) =>
            setUpdateUserInfo((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          className="text-primary"
          style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}
        >
          Số điện thoại
        </label>
        <Input
          className="h-40!"
          placeholder="Nhập số điện thoại"
          value={updateUserInfo.phone}
          onChange={(e) =>
            setUpdateUserInfo((prev) => ({ ...prev, phone: e.target.value }))
          }
        />
      </div>

      <Button
        className="ml-auto! h-40!"
        type="primary"
        onClick={() => {
          updateAddress(updateUserInfo);
        }}
        style={{ marginBottom: '24px' }}
      >
        Cập nhật thông tin
      </Button>

      <Card
        title="Địa chỉ"
        size="small"
        extra={
          <Button
            type="primary"
            className="my-10! h-40!"
            icon={<PlusOutlined />}
            onClick={async () => {
              setEditingAddress({
                specificAddress: '',
                addressDetail: '',
                default: false,
                isDeleted: false,
                deletedAt: null,
              });
              setEditingAddressIndex(null); // báo đây là "thêm mới" chứ không phải sửa
              await fetchProvinces();
              setSelectedProvince(null);
              setSelectedDistrict(null);
              setSelectedWard(null);
              setIsAddressModalVisible(true);
            }}
          >
            Thêm địa chỉ
          </Button>
        }
      >
        <List
          dataSource={updateUserInfo.addresses}
          renderItem={(item, index) => {
            return (
              <List.Item
                className="flex! items-center!"
                actions={[
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={async () => {
                      message.loading('Đang xử lý');
                      setEditingAddress(JSON.parse(JSON.stringify(item)));
                      setEditingAddressIndex(index);
                      await getAddress(item);
                      message.destroy();
                      setIsAddressModalVisible(true);
                    }}
                  >
                    Sửa
                  </Button>,

                  ...(userInfo?.addresses?.length > 1
                    ? [
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => {
                            setIsDeleteAddressModalOpen(true);
                            setDeleteAddressIndex(index);
                          }}
                        >
                          Xóa
                        </Button>,
                      ]
                    : []),

                  <Button
                    type="text"
                    disabled={item.default}
                    onClick={() => handleSetDefaultAddress(index)}
                  >
                    Đặt làm mặc định
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={
                    item.default ? (
                      <Space>
                        {item.addressDetail + ', ' + item.specificAddress}
                        <Tag color="blue">Mặc định</Tag>
                      </Space>
                    ) : (
                      item.addressDetail + ', ' + item.specificAddress
                    )
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Modal
        title="Xóa địa chỉ"
        open={isDeleteAddressModalOpen}
        onCancel={() => {
          setIsDeleteAddressModalOpen(false);
        }}
        footer={null}
      >
        <Typography.Text>Bạn có chắc chắn muốn xóa địa chỉ?</Typography.Text>
        <Flex gap={8} justify="end">
          <Button
            className="h-40! min-w-100!"
            onClick={() => {
              setIsDeleteAddressModalOpen(false);
            }}
          >
            Hủy
          </Button>

          <Button
            type="primary"
            className="h-40! min-w-100!"
            onClick={async () => {
              await handleDeleteAddress(deleteAddressIndex);
              setIsDeleteAddressModalOpen(false);
            }}
          >
            Xóa
          </Button>
        </Flex>
      </Modal>

      <Modal
        title={
          editingAddressIndex !== null ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'
        }
        open={isAddressModalVisible}
        onCancel={() => {
          setIsAddressModalVisible(false);
          setEditingAddress(null);
        }}
        footer={null}
      >
        <div className="mb-16">
          <Flex gap={8} vertical>
            <Flex vertical>
              <label className="mb-4">Tỉnh/Thành phố</label>
              <Select
                value={selectedProvince?.code}
                options={provinces.map((province) => {
                  return { label: province.name, value: province.code };
                })}
                onChange={(value) => {
                  const province = provinces.find((p) => p.code === value);
                  setSelectedProvince(province);
                  // Reset District/Ward khi chọn Tỉnh mới
                  setSelectedDistrict(null);
                  setSelectedWard(null);
                  fetchDistricts(value);
                }}
              />
            </Flex>

            <Flex vertical>
              <label className="mb-4">Quận/Huyện</label>
              <Select
                value={selectedDistrict?.code}
                options={districts.map((district) => {
                  return { label: district.name, value: district.code };
                })}
                onChange={(value) => {
                  const district = districts.find((d) => d.code === value);
                  setSelectedDistrict(district);
                  setSelectedWard(null);
                  fetchWards(value);
                }}
              />
            </Flex>

            <Flex vertical>
              <label className="mb-4">Xã/Phường</label>
              <Select
                value={selectedWard?.code}
                options={wards.map((ward) => {
                  return { label: ward.name, value: ward.code };
                })}
                onChange={(value) => {
                  const ward = wards.find((w) => w.code === value);
                  setSelectedWard(ward);
                }}
              />
            </Flex>
          </Flex>
          <Flex vertical className="mt-8!">
            <label className="mb-4">Địa chỉ chi tiết</label>
            <Input.TextArea
              value={editingAddress?.specificAddress || ''}
              onChange={(event) => {
                setEditingAddress((prev) => {
                  return {
                    ...prev,
                    specificAddress: event.target.value,
                  };
                });
              }}
              className="min-h-70!"
            ></Input.TextArea>
          </Flex>
        </div>

        <Flex gap={8} justify="end">
          <Button
            className="h-40! min-w-100!"
            onClick={() => {
              setIsAddressModalVisible(false);
              setEditingAddress(null);
            }}
          >
            Hủy
          </Button>

          <Button
            type="primary"
            className="h-40! min-w-100!"
            onClick={async () => {
              if (
                !selectedProvince ||
                !selectedDistrict ||
                !selectedWard ||
                !editingAddress?.specificAddress
              ) {
                return message.warning(
                  'Vui lòng điền đầy đủ thông tin địa chỉ',
                );
              }

              const newAddress = {
                specificAddress: editingAddress.specificAddress,
                addressDetail: `${selectedProvince.name}, ${selectedDistrict.name}, ${selectedWard.name}`,
                default: updateUserInfo.addresses.length === 0, // Nếu là địa chỉ đầu tiên thì đặt làm mặc định
                isDeleted: false,
                deletedAt: null,
              };

              let updateUser;
              setUpdateUserInfo((prev) => {
                let updatedAddresses;
                if (editingAddressIndex !== null) {
                  // Trường hợp sửa địa chỉ
                  updatedAddresses = [...prev.addresses];
                  updatedAddresses[editingAddressIndex] = {
                    ...updatedAddresses[editingAddressIndex],
                    ...newAddress,
                  };
                } else {
                  // Trường hợp thêm mới địa chỉ
                  updatedAddresses = [...prev.addresses, newAddress];
                }

                updateUser = {
                  ...prev,
                  addresses: updatedAddresses,
                };

                return updateUser;
              });

              await updateAddress(updateUser);
            }}
          >
            {editingAddressIndex !== null ? 'Cập nhật' : 'Thêm'}
          </Button>
        </Flex>
      </Modal>
    </Card>
  );

  const renderOrderList = () => (
    <div>
      <Card className="p-12!">
        <Typography.Title level={5}>Danh sách đơn hàng</Typography.Title>
        <Tabs
          activeKey={activeOrderTab}
          onChange={setActiveOrderTab}
          items={[
            {
              key: 'all',
              label: 'Tất cả',
              children: (
                <Table
                  dataSource={getFilteredOrders()}
                  columns={orderColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'processing',
              label: 'Đang xử lý',
              children: (
                <Table
                  dataSource={getFilteredOrders()}
                  columns={orderColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'shipping',
              label: 'Đang giao',
              children: (
                <Table
                  dataSource={getFilteredOrders()}
                  columns={orderColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'completed',
              label: 'Hoàn tất',
              children: (
                <Table
                  dataSource={getFilteredOrders()}
                  columns={orderColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
            {
              key: 'cancelled',
              label: 'Đã hủy',
              children: (
                <Table
                  dataSource={getFilteredOrders()}
                  columns={orderColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-60px)] px-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  const orderData = orders?.find((o) => o._id === selectedOrder?.id);

  return (
    <div className="w-full  p-24 min-h-screen">
      <div className="flex gap-24 max-w-1200 my-0 mx-auto">
        {/* Khối bên trái */}
        <div className="bg-[#f3f4f6]" style={{ flex: '0 0 300px' }}>
          <Card className="p-12!" style={{ marginBottom: '16px' }}>
            <div className="flex items-center mb-16">
              <div className="w-48 h-48 bg-[#ff6b35] rounded-full flex items-center justify-center mr-12">
                <UserOutlined className="text-2xl! text-white!" />
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  {userInfo.name}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  {userInfo.phone}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Quý khách có thể xem thông tin cá nhân và đơn hàng tại đây.
            </div>
          </Card>

          <Card>
            <Menu
              mode="inline"
              selectedKeys={[selectedMenu]}
              onClick={handleMenuClick}
              style={{ border: 'none' }}
              items={menuItems}
            />

            <Modal
              title={`Chi tiết đơn hàng #${selectedOrder?.id}`}
              open={isOrderDetailModalOpen}
              onCancel={() => {
                setIsOrderDetailModalOpen(false);
                setSelectedOrder(null);
              }}
              footer={null}
              width={800}
            >
              {selectedOrder && (
                <Flex vertical gap={20}>
                  <Table
                    bordered
                    showHeader={false}
                    pagination={false}
                    dataSource={[
                      ['Mã đơn hàng', selectedOrder.id],
                      [
                        'Khách hàng',
                        `${orderData?.createdBy?.name} (${orderData?.createdBy?.email})`,
                      ],
                      ['Số điện thoại', orderData?.phone],
                      ['Chi nhánh', orderData?.items?.[0]?.branch?.name],
                      ['Phương thức thanh toán', orderData?.paymentMethod],
                      [
                        'Trạng thái đơn hàng',
                        <Tag color={getStatusColor(selectedOrder.status)}>
                          {selectedOrder.status}
                        </Tag>,
                      ],
                      ['Địa chỉ giao hàng', orderData?.shippingAddress],
                      [
                        'Ngày tạo',
                        new Date(orderData?.createdAt).toLocaleString(),
                      ],
                      [
                        'Cập nhật lần cuối',
                        new Date(orderData?.updatedAt).toLocaleString(),
                      ],
                    ]}
                    columns={[
                      {
                        dataIndex: 0,
                        key: 'label',
                        width: 200,
                        render: (text) => <strong>{text}</strong>,
                      },
                      {
                        dataIndex: 1,
                        key: 'value',
                      },
                    ]}
                  />

                  <div>
                    <Typography.Title level={5} className="mb-10!">
                      Danh sách sản phẩm
                    </Typography.Title>
                    <Table
                      bordered
                      dataSource={
                        orders.find((o) => o._id === selectedOrder.id)?.items ||
                        []
                      }
                      pagination={false}
                      rowKey="_id"
                      columns={[
                        {
                          title: 'Sản phẩm',
                          dataIndex: 'product',
                          key: 'product',
                          render: (product, record) => {
                            return (
                              <>
                                <div>{product.name}</div>
                                <div className="text-xs text-gray-500">
                                  {record.variant.name}
                                </div>
                              </>
                            );
                          },
                        },
                        {
                          title: 'Số lượng',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          align: 'center',
                        },
                        {
                          title: 'Giảm giá',
                          dataIndex: 'discount',
                          key: 'discount',
                          align: 'center',
                          render: (_, record) => {
                            console.log(record);
                          },
                        },
                        {
                          title: 'Đơn giá',
                          dataIndex: 'price',
                          key: 'price',
                          render: (price) => (
                            <Typography.Text strong className="text-primary!">
                              {`${price.toLocaleString()}đ`}
                            </Typography.Text>
                          ),
                          align: 'right',
                        },
                        {
                          title: 'Thành tiền',
                          key: 'total',
                          render: (_, record) => (
                            <Typography.Text
                              strong
                              className="text-primary!"
                            >{`${(record.price * record.quantity).toLocaleString()}đ`}</Typography.Text>
                          ),
                          align: 'right',
                        },
                      ]}
                    />
                  </div>
                  <Typography.Text className="flex! justify-end! mt-4! text-base! text-primary! font-semibold!">
                    Tổng cộng:&nbsp;
                    {selectedOrder.total.toLocaleString()}đ
                  </Typography.Text>
                </Flex>
              )}
            </Modal>
          </Card>
        </div>

        {/* Khối bên phải */}
        <div style={{ flex: 1 }}>
          {selectedMenu === 'personal' && renderPersonalInfo()}
          {selectedMenu === 'orders' && renderOrderList()}
        </div>
      </div>
    </div>
  );
};

export default AccountInfoPage;
