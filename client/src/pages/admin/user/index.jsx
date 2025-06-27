import React, { useEffect, useRef, useState } from 'react';
import {
  Table,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Input,
  message,
  Tooltip,
  Tag,
  Flex,
  Modal,
  Empty,
  Form,
  Select,
  Space,
  Avatar,
  Descriptions,
  Divider,
  Switch,
  Popconfirm,
  Checkbox,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  EyeOutlined,
  MailOutlined,
  PlusOutlined,
  DeleteOutlined,
  HomeOutlined,
  UserAddOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  callFetchUsers,
  callFetchRoles,
  callFetchBranches,
  callUpdateUser,
} from '@/services/apis';

import { useAppContext } from '@/contexts';
import Address from '@/services/address';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);
  const [addressValues, setAddressValues] = useState({});
  const addressDropdownRef = useRef(null);
  const [selectedWard, setSelectedWard] = useState({});
  const [selectedProvince, setSelectedProvince] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('Tỉnh/Thành phố');

  const places = ['Tỉnh/Thành phố', 'Quận/Huyện', 'Xã/Phường'];
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    userType: '',
    branch: '',
  });
  const { message } = useAppContext();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchBranches();
    fetchProvinces();
    fetchDistricts();
    fetchWards();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await callFetchUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Tải danh sách người dùng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await callFetchRoles();
      setRoles(response.data.data);
    } catch (error) {
      message.error('Tải danh sách quyền thất bại');
      console.error('Error fetching roles:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data);
    } catch (error) {
      message.error('Tải danh sách chi nhánh thất bại');
      console.error('Error fetching branches:', error);
    }
  };
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
  const handleProvinceSelect = async (province, event, key) => {
    const newAddress = event.target.textContent;

    // Cập nhật addressValues cho item cụ thể
    setAddressValues((prev) => ({
      ...prev,
      [key]: newAddress,
    }));

    setSelectedProvince(province);
    setSelectedPlace('Quận/Huyện');
    setSelectedDistrict({});
    setSelectedWard({});

    await fetchDistricts(province.code);
  };

  const handleDistrictSelect = async (district, event, key) => {
    const districtName = event.target.textContent;
    const currentAddress = addressValues[key] || '';

    const newAddress =
      selectedDistrict.name === district.name
        ? selectedProvince.name + ', ' + districtName
        : currentAddress + ', ' + districtName;

    // Cập nhật addressValues cho item cụ thể
    setAddressValues((prev) => ({
      ...prev,
      [key]: newAddress,
    }));

    setSelectedDistrict(district);
    setSelectedPlace('Xã/Phường');
    setSelectedWard({});

    await fetchWards(district.code);
  };

  const handleWardSelect = (ward, event, key) => {
    const wardName = event.target.textContent;
    const newAddress =
      selectedWard.name === ward.name
        ? selectedProvince.name + ', ' + selectedDistrict.name + ', ' + wardName
        : selectedProvince.name +
          ', ' +
          selectedDistrict.name +
          ', ' +
          wardName;

    setAddressValues((prev) => ({
      ...prev,
      [key]: newAddress,
    }));

    setSelectedWard(ward);

    setShowAddressDropdown((prev) => ({
      ...prev,
      [key]: false,
    }));
  };
  const reloadTable = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchRoles(), fetchBranches()]);
      message.success('Dữ liệu tải lại thành công!');
    } catch (error) {
      console.error('Failed to reload data:', error);
      message.error('Tải lại dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser && modalType === 'edit') {
      form.setFieldsValue({
        name: selectedUser.name,
        email: selectedUser.email,
        gender: selectedUser.gender,
        age: selectedUser.age,
        userType: selectedUser.userType,
        branch: selectedUser.branch?._id || selectedUser.branch,
        isActive: selectedUser.isActive,
        addresses: selectedUser.address.map((address) => {
          return {
            addressDetail: address.addressDetail,
            default: address.default,
          };
        }),
      });
    } else {
      form.resetFields();
    }
    console.log('selectedUser', form.getFieldValue());
  }, [selectedUser, modalType, form]);

  const filteredUsers = users.filter((user) => {
    const matchRole =
      !filters.role || filters.role === '' || user.role?._id === filters.role;
    const matchStatus =
      !filters.status ||
      filters.status === '' ||
      (filters.status === 'active' && user.isActive) ||
      (filters.status === 'inactive' && !user.isActive);
    const matchUserType =
      !filters.userType ||
      filters.userType === '' ||
      user.userType === filters.userType;
    const matchBranch =
      !filters.branch ||
      filters.branch === '' ||
      user.branch?._id === filters.branch ||
      user.branch === filters.branch;
    const search = searchText.toLowerCase();
    const matchSearch =
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.name?.toLowerCase().includes(search) ||
      user.userType?.toLowerCase().includes(search) ||
      user.branch?.name?.toLowerCase().includes(search);

    return (
      matchRole && matchStatus && matchUserType && matchBranch && matchSearch
    );
  });

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            size={40}
            src={record.avatar}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          >
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div>
              <Text strong style={{ color: '#1890ff' }}>
                {text}
              </Text>
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <MailOutlined style={{ marginRight: 4 }} />
              {record.email}
              {record.age && (
                <span style={{ marginLeft: 8 }}>• {record.age} tuổi</span>
              )}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      sorter: (a, b) => a.phone.localeCompare(b.phone),
    },

    {
      title: 'Thống kê',
      key: 'statistics',
      align: 'center',
      width: 150,
      render: (record) => (
        <div style={{ fontSize: '12px' }}>
          <div style={{ color: '#52c41a', fontWeight: 500 }}>
            {record.totalSpent
              ? `${Number(record.totalSpent).toLocaleString('vi-VN')}đ`
              : '0đ'}
          </div>
          <div style={{ color: '#666' }}>
            {record.totalOrders || 0} đơn hàng
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      align: 'center',
      render: (record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      render: (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN');
      },
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              size="small"
              style={{ padding: 0 }}
              onClick={() => {
                setPreviewUser(record);
                setPreviewVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setSelectedUser(record);
                setModalType('edit');
                setOpenModal(true);
              }}
            >
              Sửa
            </Button>
          </Tooltip>
          {/* <Popconfirm
            title="Xóa người dùng"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            onConfirm={() => handleDeleteUser(record._id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button danger icon={<DeleteOutlined />} size="small">
                Xóa
              </Button>
            </Tooltip>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalType('create');
    setOpenModal(true);
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      if (modalType === 'create') {
        const response = await callCreateUser(values);
        setUsers([...users, response.data.data]);
        message.success('Tạo người dùng thành công');
      } else {
        const response = await callUpdateUser(selectedUser._id, values);
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? response.data.data : user,
          ),
        );
        message.success('Cập nhật người dùng thành công');
      }
      handleCancel();
      fetchUsers(); // Refresh data to get updated relations
    } catch (error) {
      console.error('Failed to save user:', error);
      message.error(
        modalType === 'create'
          ? 'Tạo người dùng thất bại'
          : 'Cập nhật người dùng thất bại',
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // const handleBulkDelete = async () => {
  //   if (selectedRowKeys.length === 0) {
  //     message.warning('Vui lòng chọn ít nhất một người dùng');
  //     return;
  //   }

  //   Modal.confirm({
  //     title: 'Xóa nhiều người dùng',
  //     content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} người dùng được chọn?`,
  //     icon: <ExclamationCircleOutlined />,
  //     okText: 'Xóa',
  //     cancelText: 'Hủy',
  //     okButtonProps: { danger: true },
  //     onOk: async () => {
  //       setLoading(true);
  //       try {
  //         await Promise.all(
  //           selectedRowKeys.map((userId) => callDeleteUser(userId)),
  //         );
  //         setUsers(users.filter((user) => !selectedRowKeys.includes(user._id)));
  //         message.success(
  //           `Đã xóa ${selectedRowKeys.length} người dùng thành công`,
  //         );
  //         setSelectedRowKeys([]);
  //         setSelectedRows([]);
  //       } catch (error) {
  //         console.error('Failed to bulk delete users:', error);
  //         message.error('Xóa hàng loạt thất bại');
  //       } finally {
  //         setLoading(false);
  //       }
  //     },
  //   });
  // };

  const handleCancel = () => {
    form.resetFields();
    setOpenModal(false);
    setSelectedUser(null);
    setModalType('create');
  };

  return (
    <>
      <Card
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Quản lý người dùng
            </Title>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Quản lý thông tin và phân quyền người dùng trong hệ thống.
            </p>
          </Col>
        </Row>

        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} sm={12} md={5}>
            <Input
              placeholder="Tìm kiếm tên, email..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{
                borderRadius: 8,
                border: `1px solid #CBD5E1`,
              }}
            />
          </Col>

          <Col span={5}>
            <Select
              placeholder="Loại người dùng"
              style={{ width: '100%' }}
              value={filters.userType}
              onChange={(value) => setFilters({ ...filters, userType: value })}
              allowClear
            >
              <Option value="">Tất cả</Option>
              <Option value="GUEST">GUEST</Option>
              <Option value="NEW">NEW</Option>
              <Option value="MEMBER">MEMBER</Option>
              <Option value="VIP">VIP</Option>
            </Select>
          </Col>

          <Col span={5}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="">Tất cả</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngưng hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={7}>
            <Flex gap={8} wrap="wrap" justify="end">
              <Button
                icon={<ReloadOutlined />}
                onClick={reloadTable}
                loading={loading}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateUser}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                Thêm người dùng
              </Button>
            </Flex>
          </Col>
        </Row>

        <Table
          loading={loading}
          rowKey={(record) => record._id}
          dataSource={filteredUsers}
          columns={columns}
          bordered
          size="middle"
          pagination={{
            defaultPageSize: 10,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Không tìm thấy người dùng nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar
              icon={<UserOutlined />}
              style={{ backgroundColor: '#1890ff' }}
            >
              {previewUser?.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <span>Chi tiết người dùng</span>
          </div>
        }
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setSelectedUser(previewUser);
              setModalType('edit');
              setOpenModal(true);
              setPreviewVisible(false);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={600}
      >
        {previewUser && (
          <div style={{ padding: '16px 0' }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên người dùng">
                <Text strong>{previewUser.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text code>{previewUser.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại người dùng">
                <Tag
                  color={
                    previewUser.userType === 'VIP'
                      ? 'gold'
                      : previewUser.userType === 'MEMBER'
                        ? 'blue'
                        : previewUser.userType === 'NEW'
                          ? 'green'
                          : 'default'
                  }
                >
                  {previewUser.userType || 'GUEST'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Chi nhánh">
                {previewUser.branch ? (
                  <Tag color="cyan">{previewUser.branch.name}</Tag>
                ) : (
                  <Tag color="default">Chưa có chi nhánh</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi">
                <Text>{previewUser.age || 'Chưa cập nhật'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                <Tag
                  color={
                    previewUser.gender === 'male'
                      ? 'blue'
                      : previewUser.gender === 'female'
                        ? 'pink'
                        : 'default'
                  }
                >
                  {previewUser.gender === 'male'
                    ? 'Nam'
                    : previewUser.gender === 'female'
                      ? 'Nữ'
                      : 'Chưa xác định'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {previewUser.address && previewUser.address.length > 0 ? (
                  <div>
                    {previewUser.address.map((addr, index) => (
                      <div key={index} style={{ marginBottom: 4 }}>
                        <Tag color={addr.default ? 'blue' : 'default'}>
                          {addr.default ? 'Mặc định' : 'Phụ'}
                        </Tag>
                        <Text>{addr.addressDetail}</Text>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">Chưa có địa chỉ</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng chi tiêu">
                <Text strong style={{ color: '#52c41a' }}>
                  {previewUser.totalSpent
                    ? `${Number(previewUser.totalSpent).toLocaleString('vi-VN')}đ`
                    : '0đ'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng đơn hàng">
                <Text strong style={{ color: '#1890ff' }}>
                  {previewUser.totalOrders || 0} đơn hàng
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={previewUser.isActive ? 'green' : 'red'}>
                  {previewUser.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                <Text>
                  {previewUser.createdAt
                    ? new Date(previewUser.createdAt).toLocaleString('vi-VN')
                    : '-'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                <Text>
                  {previewUser.updatedAt
                    ? new Date(previewUser.updatedAt).toLocaleString('vi-VN')
                    : '-'}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserAddOutlined style={{ color: '#1890ff' }} />
            <span>
              {modalType === 'create'
                ? 'Thêm người dùng mới'
                : 'Chỉnh sửa người dùng'}
            </span>
          </div>
        }
        open={openModal}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={() => form.submit()}
          >
            {modalType === 'create' ? 'Tạo người dùng' : 'Cập nhật'}
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            isActive: true,
            userType: 'GUEST',
            addresses: [],
          }}
        >
          <Divider orientation="left">
            <span style={{ color: '#666', fontWeight: 500 }}>
              Thông tin cơ bản
            </span>
          </Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="name"
                label="Tên người dùng"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên người dùng!' },
                  { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập tên người dùng"
                  prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Nhập email"
                  prefix={<MailOutlined style={{ color: '#94A3B8' }} />}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="age"
                label="Tuổi"
                rules={[
                  {
                    type: 'number',
                    min: 1,
                    max: 120,
                    message: 'Tuổi phải từ 1-120!',
                  },
                ]}
              >
                <Input type="number" size="large" placeholder="Nhập tuổi" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select size="large" placeholder="Chọn giới tính" allowClear>
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="branch" label="Chi nhánh">
                <Select size="large" placeholder="Chọn chi nhánh" allowClear>
                  {branches.map((branch) => (
                    <Option key={branch._id} value={branch._id}>
                      {branch.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {modalType === 'create' && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                  ]}
                >
                  <Input.Password size="large" placeholder="Nhập mật khẩu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="Xác nhận mật khẩu"
                  dependencies={['password']}
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error('Mật khẩu không khớp!'),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Xác nhận mật khẩu"
                  />
                </Form.Item>
              </Col>
            </Row>
          )}

          <Divider orientation="left">
            <span style={{ color: '#1890ff', fontWeight: 600 }}>Địa chỉ</span>
          </Divider>

          <Form.List name="addresses">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key}>
                    <Col span={18}>
                      <Form.Item
                        {...restField}
                        name={[name, 'addressDetail']}
                        label="Địa chỉ"
                        rules={[
                          { required: true, message: 'Vui lòng chọn địa chỉ!' },
                        ]}
                      >
                        <div style={{ position: 'relative' }}>
                          <Input
                            readOnly
                            placeholder="Chọn địa chỉ"
                            onClick={() =>
                              setShowAddressDropdown((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                              }))
                            }
                            prefix={
                              <HomeOutlined style={{ color: '#8c8c8c' }} />
                            }
                            style={{
                              borderRadius: 8,
                              padding: '10px 12px',
                              cursor: 'pointer',
                              backgroundColor: '#fff',
                            }}
                          />

                          {showAddressDropdown[key] && (
                            <div
                              ref={addressDropdownRef}
                              style={{
                                backgroundColor: 'white',
                                position: 'absolute',
                                zIndex: 1000,
                                top: '100%',
                                marginTop: 8,
                                left: 0,
                                right: 0,
                                borderRadius: 8,
                                border: '1px solid #d9d9d9',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  borderBottom: '1px solid #f0f0f0',
                                }}
                              >
                                {places.map((place, index) => (
                                  <div
                                    key={index}
                                    onClick={() => setSelectedPlace(place)}
                                    style={{
                                      width: '33.33%',
                                      cursor: 'pointer',
                                      padding: '12px 8px',
                                      textAlign: 'center',
                                      fontSize: 14,
                                      borderBottom:
                                        selectedPlace === place
                                          ? '2px solid #667eea'
                                          : '2px solid transparent',
                                      color:
                                        selectedPlace === place
                                          ? '#667eea'
                                          : '#262626',
                                      fontWeight:
                                        selectedPlace === place ? 500 : 400,
                                    }}
                                  >
                                    {place}
                                  </div>
                                ))}
                              </div>

                              <div
                                style={{
                                  overflowY: 'auto',
                                  maxHeight: 200,
                                  padding: 8,
                                  cursor: 'pointer',
                                }}
                              >
                                {selectedPlace === 'Tỉnh/Thành phố' &&
                                  provinces.map((province, index) => (
                                    <div
                                      key={index}
                                      onClick={(event) =>
                                        handleProvinceSelect(
                                          province,
                                          event,
                                          key,
                                        )
                                      }
                                      style={{
                                        padding: '8px 12px',
                                        margin: '4px 0',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        backgroundColor:
                                          selectedProvince.name ===
                                          province.name
                                            ? '#f6f6f6'
                                            : 'transparent',
                                      }}
                                    >
                                      {province.name}
                                    </div>
                                  ))}

                                {selectedPlace === 'Quận/Huyện' &&
                                  districts.map((district, index) => (
                                    <div
                                      key={index}
                                      onClick={(event) =>
                                        handleDistrictSelect(
                                          district,
                                          event,
                                          key,
                                        )
                                      }
                                      style={{
                                        padding: '8px 12px',
                                        margin: '4px 0',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        backgroundColor:
                                          selectedDistrict.name ===
                                          district.name
                                            ? '#f6f6f6'
                                            : 'transparent',
                                      }}
                                    >
                                      {district.name}
                                    </div>
                                  ))}

                                {selectedPlace === 'Xã/Phường' &&
                                  wards.map((ward, index) => (
                                    <div
                                      key={index}
                                      onClick={(event) =>
                                        handleWardSelect(ward, event, key)
                                      }
                                      style={{
                                        padding: '8px 12px',
                                        margin: '4px 0',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        backgroundColor:
                                          selectedWard.name === ward.name
                                            ? '#f6f6f6'
                                            : 'transparent',
                                      }}
                                    >
                                      {ward.name}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        name={[name, 'default']}
                        valuePropName="checked"
                      >
                        <Checkbox>Địa chỉ mặc định</Checkbox>
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Form.Item>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          style={{ marginTop: '30px' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add({ addressDetail: '', default: false })}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm địa chỉ
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Divider orientation="left">
            <span style={{ color: '#1890ff', fontWeight: 600 }}>
              Phân loại & Trạng thái
            </span>
          </Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="userType" label="Loại người dùng">
                <Select
                  placeholder="Chọn loại người dùng"
                  size="large"
                  style={{ borderRadius: 8 }}
                  allowClear
                >
                  <Option value="GUEST">GUEST - Khách</Option>
                  <Option value="NEW">NEW - Khách hàng mới</Option>
                  <Option value="MEMBER">MEMBER - Thành viên</Option>
                  <Option value="VIP">VIP - Khách VIP</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Trạng thái hoạt động"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Hoạt động"
                  unCheckedChildren="Tạm khóa"
                  size="default"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default UserManagement;
