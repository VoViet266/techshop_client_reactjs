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
  Popconfirm,
  message,
  Typography,
} from 'antd';
import { useAppContext } from '@/contexts';
import {
  UserOutlined,
  ShoppingOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import Address from '@services/address';
import UserService from '@services/users';
import { doc } from 'prettier';

const AccountInfoPage = () => {
  const { user } = useAppContext();
  const [wards, setWards] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState('personal');
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [updateUserInfo, setUpdateUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempPersonalInfo, setTempPersonalInfo] = useState({
    fullName: '',
    phone: '',
  });
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [tempAddress, setTempAddress] = useState('');

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
    } catch (error) {
      message.error('Không thể tải danh sách quận/huyện');
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const wardsData = await Address.getWards(districtCode);
      setWards(wardsData);
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

  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  useEffect(() => {
    if (userInfo) {
      console.log('User:', userInfo);
    }

    if (provinces) {
      console.log('Provinces:', provinces);
    }

    if (districts) {
      console.log('Districts:', districts);
    }

    if (wards) {
      console.log('Wards:', wards);
    }
  }, [userInfo, provinces, districts, wards]);

  useEffect(() => {
    document.title = 'Thông tin cá nhân';
    getUser();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (editingAddress) {
      setSelectedProvince(editingAddress.addressDetail.split(', ')[0]);
      setSelectedDistrict(editingAddress.addressDetail.split(', ')[1]);
    }
  }, [editingAddress]);

  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince.code);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict.code);
    }
  }, [selectedDistrict]);

  // Dữ liệu mẫu cho thông tin cá nhân
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Nguyễn Văn A',
    phone: '0987654321',
    addresses: [
      {
        id: 1,
        address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
        isDefault: true,
      },
      {
        id: 2,
        address: '456 Đường DEF, Phường GHI, Quận 2, TP.HCM',
        isDefault: false,
      },
    ],
  });

  // Dữ liệu mẫu cho đơn hàng
  const [orders] = useState([
    {
      id: 'DH001',
      date: '2024-01-15',
      total: 500000,
      status: 'completed',
      items: 'Áo sơ mi, Quần jean',
    },
    {
      id: 'DH002',
      date: '2024-01-20',
      total: 300000,
      status: 'shipping',
      items: 'Giày thể thao',
    },
    {
      id: 'DH003',
      date: '2024-01-25',
      total: 750000,
      status: 'processing',
      items: 'Túi xách, Ví da',
    },
    {
      id: 'DH004',
      date: '2024-01-30',
      total: 200000,
      status: 'cancelled',
      items: 'Nón kết',
    },
    {
      id: 'DH005',
      date: '2024-02-05',
      total: 450000,
      status: 'completed',
      items: 'Áo khoác',
    },
  ]);

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

  const handlePersonalInfoSubmit = () => {
    if (!tempPersonalInfo.fullName.trim()) {
      message.error('Vui lòng nhập họ tên!');
      return;
    }
    if (!tempPersonalInfo.phone.trim()) {
      message.error('Vui lòng nhập số điện thoại!');
      return;
    }
    if (!/^[0-9]{10,11}$/.test(tempPersonalInfo.phone)) {
      message.error('Số điện thoại không hợp lệ!');
      return;
    }

    setPersonalInfo((prev) => ({
      ...prev,
      fullName: tempPersonalInfo.fullName,
      phone: tempPersonalInfo.phone,
    }));
    message.success('Cập nhật thông tin thành công!');
  };

  const handleAddressSubmit = () => {
    if (!tempAddress.trim()) {
      message.error('Vui lòng nhập địa chỉ!');
      return;
    }

    if (editingAddress) {
      // Cập nhật địa chỉ
      setPersonalInfo((prev) => ({
        ...prev,
        addresses: prev.addresses.map((addr) =>
          addr.id === editingAddress.id
            ? { ...addr, address: tempAddress }
            : addr,
        ),
      }));
      message.success('Cập nhật địa chỉ thành công!');
    } else {
      // Thêm địa chỉ mới
      const newAddress = {
        id: Date.now(),
        address: tempAddress,
        isDefault: personalInfo.addresses.length === 0,
      };
      setPersonalInfo((prev) => ({
        ...prev,
        addresses: [...prev.addresses, newAddress],
      }));
      message.success('Thêm địa chỉ thành công!');
    }
    setIsAddressModalVisible(false);
    setEditingAddress(null);
    setTempAddress('');
  };

  const handleDeleteAddress = (addressId) => {
    setPersonalInfo((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((addr) => addr.id !== addressId),
    }));
    message.success('Xóa địa chỉ thành công!');
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setTempAddress(address.address);
    setIsAddressModalVisible(true);
  };

  // Khởi tạo tempPersonalInfo với dữ liệu ban đầu
  React.useEffect(() => {
    setTempPersonalInfo({
      fullName: personalInfo.fullName,
      phone: personalInfo.phone,
    });
  }, [personalInfo.fullName, personalInfo.phone]);

  const getStatusColor = (status) => {
    const colors = {
      completed: 'green',
      shipping: 'blue',
      processing: 'orange',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      completed: 'Hoàn tất',
      shipping: 'Đang giao',
      processing: 'Đang xử lý',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getFilteredOrders = () => {
    if (activeOrderTab === 'all') return orders;
    return orders.filter((order) => order.status === activeOrderTab);
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
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'items',
      key: 'items',
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
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
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
        onClick={handlePersonalInfoSubmit}
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
            onClick={() => setIsAddressModalVisible(true)}
          >
            Thêm địa chỉ
          </Button>
        }
      >
        <List
          dataSource={updateUserInfo.addresses}
          renderItem={(item) => {
            console.log('Address:', item.addressDetail.split(', '));
            return (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditAddress(item)}
                  >
                    Sửa
                  </Button>,
                  <Popconfirm
                    title="Bạn có chắc chắn muốn xóa địa chỉ này?"
                    onConfirm={() => handleDeleteAddress(item.id)}
                    okText="Có"
                    cancelText="Không"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Xóa
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    item.default ? (
                      <Space>
                        {item.addressDetail + item.specificAddress}
                        <Tag color="blue">Mặc định</Tag>
                      </Space>
                    ) : (
                      item.addressDetail + item.specificAddress
                    )
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>

      <Modal
        title={editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
        open={isAddressModalVisible}
        onCancel={() => {
          setIsAddressModalVisible(false);
          setEditingAddress(null);
          setTempAddress('');
        }}
        footer={null}
      >
        <div className="mb-16">
          <Flex gap={8} vertical>
            <Flex vertical>
              <label className="mb-4">Tỉnh/Thành phố</label>
              <Select
                defaultValue={editingAddress?.addressDetail?.split(', ')[0]}
                placeholder="Chọn Tỉnh/Thành phố"
                onChange={(_, option) => {
                  setSelectedProvince(option);
                }}
                optionFilterProp="label"
                options={provinces.map((province) => {
                  return {
                    label: province.name,
                    value: province.name,
                    code: province.code,
                  };
                })}
              />
            </Flex>

            <Flex vertical>
              <label className="mb-4">Quận/Huyện</label>
              <Select
                defaultValue={editingAddress?.addressDetail?.split(', ')[1]}
                placeholder="Chọn Quận/Huyện"
                optionFilterProp="label"
                onChange={(_, option) => {
                  setSelectedDistrict(option);
                }}
                options={districts.map((district) => {
                  return {
                    label: district.name,
                    value: district.name,
                    code: district.code,
                  };
                })}
              />
            </Flex>

            <Flex vertical>
              <label className="mb-4">Xã/Phường</label>
              <Select
                defaultValue={editingAddress?.addressDetail?.split(', ')[2]}
                placeholder="Chọn Xã/Phường"
                optionFilterProp="label"
                options={wards.map((ward) => {
                  return {
                    label: ward.name,
                    value: ward.name,
                    code: ward.code,
                  };
                })}
              />
            </Flex>
          </Flex>
          <Flex vertical className="mt-8!">
            <label className="mb-4">Địa chỉ chi tiết</label>
            <Input.TextArea
              className="min-h-70!"
              value={editingAddress?.specificAddress}
              onChange={(event) => {
                setEditingAddress(event.target.value);
              }}
            ></Input.TextArea>
          </Flex>
        </div>

        <Flex gap={8} justify="end">
          <Button
            className="h-40! min-w-100!"
            onClick={() => {
              setIsAddressModalVisible(false);
              setEditingAddress(null);
              setTempAddress('');
            }}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            className="h-40! min-w-100!"
            // onClick={handleAddressSubmit}
            onClick={() => {
              console.log('Editing address:', editingAddress);
            }}
          >
            {editingAddress ? 'Cập nhật' : 'Thêm'}
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

  return (
    <div className="w-full p-24 min-h-screen">
      <div
        style={{
          display: 'flex',
          gap: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Khối bên trái */}
        <div style={{ flex: '0 0 300px' }}>
          <Card className="p-12!" style={{ marginBottom: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#ff6b35',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                }}
              >
                <UserOutlined style={{ fontSize: '24px', color: '#fff' }} />
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
