import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
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
  Checkbox,
  Badge,
  Spin,
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
  PhoneOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  callFetchUsers,
  callFetchRoles,
  callFetchBranches,
} from '@/services/apis';

import { useAppContext } from '@/contexts';
import Address from '@/services/address';
import UserService from '@/services/users';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [form] = Form.useForm();
  const { message: contextMessage } = useAppContext();

  // State management
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Modal states
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    branch: '',
  });

  const addressDropdownRef = useRef(null);
  const [addressStates, setAddressStates] = useState({
    selectedWard: {},
    selectedProvince: {},
    selectedDistrict: {},
    provinces: [],
    districts: [],
    wards: [],
    showAddressDropdown: {},
    activeAddressKey: null,
    selectedPlace: 'Tỉnh/Thành phố',
  });

  const places = ['Tỉnh/Thành phố', 'Quận/Huyện', 'Xã/Phường'];

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchRole = !filters.role || user.role?._id === filters.role;
      const matchStatus =
        !filters.status ||
        (filters.status === 'active' && user.isActive) ||
        (filters.status === 'inactive' && !user.isActive);
      const matchUserType =
        !filters.userType || user.userType === filters.userType;

      const search = searchText.toLowerCase();
      const matchSearch =
        !search ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.name?.toLowerCase().includes(search) ||
        user.phone?.toLowerCase().includes(search) ||
        user.branch?.name?.toLowerCase().includes(search);

      return matchRole && matchStatus && matchUserType && matchSearch;
    });
  }, [users, filters, searchText]);

  useEffect(() => {
    document.title = 'Quản lý  người dùng';
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await callFetchUsers();
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      contextMessage?.error('Không thể tải danh sách người dùng');
    }
  }, [contextMessage]);

  const fetchRoles = useCallback(async () => {
    try {
      const response = await callFetchRoles();
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      contextMessage?.error('Không thể tải danh sách vai trò');
    }
  }, [contextMessage]);

  const fetchBranches = useCallback(async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      contextMessage?.error('Không thể tải danh sách chi nhánh');
    }
  }, [contextMessage]);

  const fetchProvinces = useCallback(async () => {
    try {
      const provincesData = await Address.getAllProvinces();
      setAddressStates((prev) => ({ ...prev, provinces: provincesData }));
    } catch (error) {
      contextMessage?.error('Không thể tải danh sách tỉnh/thành phố');
    }
  }, [contextMessage]);

  const fetchDistricts = useCallback(
    async (provinceCode) => {
      try {
        const districtsData = await Address.getDistricts(provinceCode);
        setAddressStates((prev) => ({ ...prev, districts: districtsData }));
      } catch (error) {
        contextMessage?.error('Không thể tải danh sách quận/huyện');
      }
    },
    [contextMessage],
  );

  const fetchWards = useCallback(
    async (districtCode) => {
      try {
        const wardsData = await Address.getWards(districtCode);
        setAddressStates((prev) => ({ ...prev, wards: wardsData }));
      } catch (error) {
        contextMessage?.error('Không thể tải danh sách xã/phường');
      }
    },
    [contextMessage],
  );

  const handleProvinceSelect = useCallback(
    async (provinceData, fieldKey) => {
      const currentAddresses = form.getFieldValue('addresses') || [];
      const newAddressDetail = provinceData.name;

      const updatedAddresses = [...currentAddresses];
      if (updatedAddresses[fieldKey]) {
        updatedAddresses[fieldKey] = {
          ...updatedAddresses[fieldKey],
          addressDetail: newAddressDetail,
        };
        form.setFieldsValue({ addresses: updatedAddresses });
      }

      setAddressStates((prev) => ({
        ...prev,
        selectedProvince: provinceData,
        selectedPlace: 'Quận/Huyện',
        selectedDistrict: {},
        selectedWard: {},
        wards: [],
      }));

      await fetchDistricts(provinceData.code);
    },
    [form, fetchDistricts],
  );

  const handleDistrictSelect = useCallback(
    async (districtData, fieldKey) => {
      const currentAddressDetail =
        form.getFieldValue(['addresses', fieldKey, 'addressDetail']) || '';
      const newAddressDetail = currentAddressDetail + ', ' + districtData.name;

      const currentAddresses = form.getFieldValue('addresses') || [];
      const updatedAddresses = [...currentAddresses];
      if (updatedAddresses[fieldKey]) {
        updatedAddresses[fieldKey] = {
          ...updatedAddresses[fieldKey],
          addressDetail: newAddressDetail,
        };
        form.setFieldsValue({ addresses: updatedAddresses });
      }

      setAddressStates((prev) => ({
        ...prev,
        selectedDistrict: districtData,
        selectedPlace: 'Xã/Phường',
        selectedWard: {},
      }));

      await fetchWards(districtData.code);
    },
    [form, fetchWards],
  );

  const handleWardSelect = useCallback(
    (wardData, fieldKey) => {
      const currentAddressDetail =
        form.getFieldValue(['addresses', fieldKey, 'addressDetail']) || '';
      const newAddressDetail = currentAddressDetail + ', ' + wardData.name;

      const currentAddresses = form.getFieldValue('addresses') || [];
      const updatedAddresses = [...currentAddresses];
      if (updatedAddresses[fieldKey]) {
        updatedAddresses[fieldKey] = {
          ...updatedAddresses[fieldKey],
          addressDetail: newAddressDetail,
        };
        form.setFieldsValue({ addresses: updatedAddresses });
      }

      setAddressStates((prev) => ({
        ...prev,
        selectedWard: wardData,
        showAddressDropdown: { ...prev.showAddressDropdown, [fieldKey]: false },
        activeAddressKey: null,
      }));
    },
    [form],
  );

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUsers(),
          fetchRoles(),
          fetchBranches(),
          fetchProvinces(),
        ]);
      } catch (error) {
        console.error('Failed to initialize data:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [fetchUsers, fetchRoles, fetchBranches, fetchProvinces]);

  // Form initialization
  useEffect(() => {
    if (selectedUser) {
      form.setFieldsValue({
        _id: selectedUser._id,
        name: selectedUser.name,
        email: selectedUser.email,
        gender: selectedUser.gender,
        age: selectedUser.age,
        userType: selectedUser.userType,
        phone: selectedUser.phone,
        isActive: selectedUser.isActive,
        addresses:
          selectedUser.addresses?.map((address) => ({
            specificAddress: address.specificAddress,
            addressDetail: address.addressDetail,
            default: address.default,
          })) || [],
      });
    } else {
      form.resetFields();
    }

    // Reset address states
    setAddressStates((prev) => ({
      ...prev,
      showAddressDropdown: {},
      activeAddressKey: null,
      selectedPlace: 'Tỉnh/Thành phố',
      selectedProvince: {},
      selectedDistrict: {},
      selectedWard: {},
      districts: [],
      wards: [],
    }));
  }, [selectedUser, form]);

  // Event handlers
  const reloadTable = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchRoles(), fetchBranches()]);
      contextMessage?.success('Dữ liệu tải lại thành công!');
    } catch (error) {
      console.error('Failed to reload data:', error);
      contextMessage?.error('Không thể tải lại dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [fetchUsers, fetchRoles, fetchBranches, contextMessage]);

  const handleCreateUser = useCallback(() => {
    setSelectedUser(null);
    setOpenModal(true);
  }, []);

  const handleSubmit = useCallback(
    async (values) => {
      setSubmitLoading(true);
      try {
        let response;
        if (!selectedUser) {
          response = await UserService.create(values);
          setUsers((prev) => [...prev, response.data.data]);
          contextMessage?.success('Tạo người dùng thành công');
        } else {
          response = await UserService.update(selectedUser._id, values);
          setUsers((prev) =>
            prev.map((user) =>
              user._id === selectedUser._id ? response.data.data : user,
            ),
          );
          contextMessage?.success('Cập nhật người dùng thành công');
        }
        handleCancel();
        await fetchUsers();
      } catch (error) {
        console.error('Failed to save user:', error);
        contextMessage?.error(
          selectedUser
            ? 'Cập nhật người dùng thất bại'
            : 'Tạo người dùng thất bại',
        );
      } finally {
        setSubmitLoading(false);
      }
    },
    [selectedUser, contextMessage, fetchUsers],
  );

  const handleCancel = useCallback(() => {
    form.resetFields();
    setOpenModal(false);
    setSelectedUser(null);
    setAddressStates((prev) => ({
      ...prev,
      showAddressDropdown: {},
      activeAddressKey: null,
      selectedPlace: 'Tỉnh/Thành phố',
      selectedProvince: {},
      selectedDistrict: {},
      selectedWard: {},
      districts: [],
      wards: [],
    }));
  }, [form]);

  // Table columns configuration
  const columns = useMemo(
    () => [
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
        sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      },
      {
        title: 'Số điện thoại',
        dataIndex: 'phone',
        key: 'phone',
        render: (phone) => phone || '-',
        sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
      },

      {
        title: 'Trạng thái',
        key: 'isActive',
        align: 'center',
        render: (_, record) => (
          <Tooltip title={record.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}>
            <Badge
              status={record.isActive ? 'success' : 'default'}
              text={record.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
            />
          </Tooltip>
        ),
        filters: [
          { text: 'Hoạt động', value: true },
          { text: 'Ngưng hoạt động', value: false },
        ],
        onFilter: (value, record) => record.isActive === value,
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
        sorter: (a, b) =>
          new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
      },
      {
        title: 'Hành động',
        key: 'action',
        align: 'center',
        width: 150,
        render: (_, record) => (
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="link"
                icon={<EyeOutlined />}
                size="small"
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
                  setOpenModal(true);
                }}
              >
                Sửa
              </Button>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [],
  );

  // Loading spinner
  if (loading && users.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" indicator={<LoadingOutlined spin />} />
        <div style={{ marginTop: 16 }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <>
      <Card
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: '20px' }}
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
          gutter={[16, 16]}
        >
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tìm kiếm tên, email..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 8, height: 40 }}
            />
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filters.status}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, status: value }))
              }
              allowClear
            >
              <Option value="">Tất cả</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Ngưng hoạt động</Option>
            </Select>
          </Col>

          <Col xs={24} sm={12} md={4}></Col>

          <Col xs={24} sm={12} md={6}>
            <Flex gap={8} wrap="wrap" justify="end">
              <Button
                icon={<ReloadOutlined />}
                onClick={reloadTable}
                loading={loading}
                style={{ borderRadius: 8, fontWeight: 500 }}
              >
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreateUser}
                style={{ borderRadius: 8, fontWeight: 500 }}
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
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} người dùng`,
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

      {/* User Detail Preview Modal */}
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
                <Text
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
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {previewUser.phone ? (
                  <Text>{previewUser.phone}</Text>
                ) : (
                  <Text type="secondary">Chưa cập nhật</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi">
                <Text>{previewUser.age || 'Chưa cập nhật'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                <Text
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
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {previewUser.addresses?.length > 0 ? (
                  <div>
                    {previewUser.addresses.map((addr, index) => (
                      <div key={index} style={{ marginBottom: 4 }}>
                        <Text
                          className={`font-semibold ${addr.default ? 'text-red-500!' : ''}`}
                        >
                          {addr.default ? 'Mặc định: ' : 'Phụ: '}
                        </Text>
                        <Text>
                          {addr.specificAddress}, {addr.addressDetail}
                        </Text>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">Chưa có địa chỉ</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge
                  color={previewUser.isActive  ? 'green' : 'red'}
                  text={previewUser.isActive  ? 'Hoạt động' : 'Khóa'}
                />
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Create/Edit User Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserAddOutlined style={{ color: '#1890ff' }} />
            <span>
              {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
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
            {selectedUser ? 'Cập nhật người dùng' : 'Thêm người dùng'}
          </Button>,
        ]}
        width={800}
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
            <Form.Item name="_id" hidden>
              <Input />
            </Form.Item>
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
              <Form.Item name="age" label="Tuổi">
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
              <Form.Item name="phone" label="Số điện thoại">
                <Input
                  size="large"
                  placeholder="Nhập số điện thoại"
                  prefix={<PhoneOutlined style={{ color: '#94A3B8' }} />}
                />
              </Form.Item>
            </Col>
          </Row>

          {!selectedUser && (
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
                  <div
                    key={key}
                    style={{
                      border: '1px solid #f0f0f0',
                      borderRadius: 8,
                      padding: 16,
                      marginBottom: 16,
                      backgroundColor: '#fafafa',
                    }}
                  >
                    <Row gutter={16} align="middle">
                      <Col span={22}>
                        <Text strong>Địa chỉ #{key + 1}</Text>
                      </Col>
                      <Col span={2} style={{ textAlign: 'right' }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          size="small"
                        />
                      </Col>
                    </Row>

                    <Row gutter={16} style={{ marginTop: 12 }}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'specificAddress']}
                          label="Địa chỉ cụ thể (số nhà, tên đường, thôn, xóm)"
                          rules={[
                            {
                              required: true,
                              message: 'Vui lòng nhập địa chỉ cụ thể!',
                            },
                          ]}
                        >
                          <Input.TextArea
                            placeholder="Ví dụ: số nhà, tên đường, thôn, xóm, ..."
                            autoSize={{ minRows: 1, maxRows: 3 }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'addressDetail']}
                          label="Địa chỉ hành chính"
                          rules={[
                            {
                              required: true,
                              message: 'Vui lòng chọn địa chỉ!',
                            },
                          ]}
                        >
                          <div style={{ position: 'relative' }}>
                            <Input
                              readOnly
                              placeholder="Chọn địa chỉ"
                              value={
                                form.getFieldValue('addresses')?.[key]
                                  ?.addressDetail || ''
                              }
                              onClick={() => {
                                const newShowAddressDropdown = {};
                                newShowAddressDropdown[key] =
                                  !addressStates.showAddressDropdown[key];

                                setAddressStates((prev) => ({
                                  ...prev,
                                  showAddressDropdown: newShowAddressDropdown,
                                  activeAddressKey: newShowAddressDropdown[key]
                                    ? key
                                    : null,
                                  selectedPlace: 'Tỉnh/Thành phố',
                                  selectedProvince: {},
                                  selectedDistrict: {},
                                  selectedWard: {},
                                  districts: [],
                                  wards: [],
                                }));
                              }}
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

                            {addressStates.showAddressDropdown[key] && (
                              <div
                                ref={(element) => {
                                  if (key === addressStates.activeAddressKey) {
                                    addressDropdownRef.current = element;
                                  }
                                }}
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
                                  maxHeight: 300,
                                  overflow: 'hidden',
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
                                      onClick={() =>
                                        setAddressStates((prev) => ({
                                          ...prev,
                                          selectedPlace: place,
                                        }))
                                      }
                                      style={{
                                        width: '33.33%',
                                        cursor: 'pointer',
                                        padding: '12px 8px',
                                        textAlign: 'center',
                                        fontSize: 14,
                                        borderBottom:
                                          addressStates.selectedPlace === place
                                            ? '2px solid #667eea'
                                            : '2px solid transparent',
                                        color:
                                          addressStates.selectedPlace === place
                                            ? '#667eea'
                                            : '#262626',
                                        fontWeight:
                                          addressStates.selectedPlace === place
                                            ? 500
                                            : 400,
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
                                  {addressStates.selectedPlace ===
                                    'Tỉnh/Thành phố' &&
                                    addressStates.provinces.map(
                                      (province, index) => (
                                        <div
                                          key={index}
                                          onClick={() =>
                                            handleProvinceSelect(province, key)
                                          }
                                          style={{
                                            padding: '8px 12px',
                                            margin: '4px 0',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            backgroundColor:
                                              addressStates.selectedProvince
                                                .name === province.name
                                                ? '#f6f6f6'
                                                : 'transparent',
                                            transition: 'background-color 0.2s',
                                          }}
                                          onMouseEnter={(e) => {
                                            if (
                                              addressStates.selectedProvince
                                                .name !== province.name
                                            ) {
                                              e.target.style.backgroundColor =
                                                '#f9f9f9';
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (
                                              addressStates.selectedProvince
                                                .name !== province.name
                                            ) {
                                              e.target.style.backgroundColor =
                                                'transparent';
                                            }
                                          }}
                                        >
                                          {province.name}
                                        </div>
                                      ),
                                    )}

                                  {addressStates.selectedPlace ===
                                    'Quận/Huyện' &&
                                    addressStates.districts.map(
                                      (district, index) => (
                                        <div
                                          key={index}
                                          onClick={() =>
                                            handleDistrictSelect(district, key)
                                          }
                                          style={{
                                            padding: '8px 12px',
                                            margin: '4px 0',
                                            borderRadius: 6,
                                            fontSize: 14,
                                            backgroundColor:
                                              addressStates.selectedDistrict
                                                .name === district.name
                                                ? '#f6f6f6'
                                                : 'transparent',
                                            transition: 'background-color 0.2s',
                                          }}
                                          onMouseEnter={(e) => {
                                            if (
                                              addressStates.selectedDistrict
                                                .name !== district.name
                                            ) {
                                              e.target.style.backgroundColor =
                                                '#f9f9f9';
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (
                                              addressStates.selectedDistrict
                                                .name !== district.name
                                            ) {
                                              e.target.style.backgroundColor =
                                                'transparent';
                                            }
                                          }}
                                        >
                                          {district.name}
                                        </div>
                                      ),
                                    )}

                                  {addressStates.selectedPlace ===
                                    'Xã/Phường' &&
                                    addressStates.wards.map((ward, index) => (
                                      <div
                                        key={index}
                                        onClick={() =>
                                          handleWardSelect(ward, key)
                                        }
                                        style={{
                                          padding: '8px 12px',
                                          margin: '4px 0',
                                          borderRadius: 6,
                                          fontSize: 14,
                                          backgroundColor:
                                            addressStates.selectedWard.name ===
                                            ward.name
                                              ? '#f6f6f6'
                                              : 'transparent',
                                          transition: 'background-color 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                          if (
                                            addressStates.selectedWard.name !==
                                            ward.name
                                          ) {
                                            e.target.style.backgroundColor =
                                              '#f9f9f9';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (
                                            addressStates.selectedWard.name !==
                                            ward.name
                                          ) {
                                            e.target.style.backgroundColor =
                                              'transparent';
                                          }
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
                    </Row>

                    <Row gutter={16}>
                      <Col span={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'default']}
                          valuePropName="checked"
                          style={{ marginBottom: 0 }}
                        >
                          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add({ addressDetail: '', default: false })}
                    block
                    icon={<PlusOutlined />}
                    style={{
                      borderRadius: 8,
                      height: 40,
                      borderStyle: 'dashed',
                      borderColor: '#1890ff',
                      color: '#1890ff',
                    }}
                  >
                    Thêm địa chỉ mới
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
                  <Option value="GUEST">
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Text color="default">GUEST</Text>
                      <span>Khách</span>
                    </div>
                  </Option>
                  <Option value="NEW">
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Text color="green">NEW</Text>
                      <span>Khách hàng mới</span>
                    </div>
                  </Option>
                  <Option value="MEMBER">
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Text color="blue">MEMBER</Text>
                      <span>Thành viên</span>
                    </div>
                  </Option>
                  <Option value="VIP">
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Text color="gold">VIP</Text>
                      <span>Khách VIP</span>
                    </div>
                  </Option>
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
                  style={{ backgroundColor: '#52c41a' }}
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
