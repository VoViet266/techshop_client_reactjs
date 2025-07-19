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
  PhoneOutlined,
} from '@ant-design/icons';
import {
  callFetchUsers,
  callFetchRoles,
  callFetchBranches,
  callUpdateUser,
} from '@/services/apis';

import { useAppContext } from '@/contexts';
import Address from '@/services/address';
import UserService from '@/services/users';

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

  const [searchText, setSearchText] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);
  const addressDropdownRef = useRef(null);
  const [selectedWard, setSelectedWard] = useState({});
  const [selectedProvince, setSelectedProvince] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState({});
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [activeAddressKey, setActiveAddressKey] = useState(null);
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

  const handleProvinceSelect = async (provinceData, fieldKey) => {
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

    setSelectedProvince(provinceData);
    setSelectedPlace('Quận/Huyện');
    setSelectedDistrict({});
    setSelectedWard({});
    setWards([]);

    await fetchDistricts(provinceData.code);
  };

  const handleDistrictSelect = async (districtData, fieldKey) => {
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

    setSelectedDistrict(districtData);
    setSelectedPlace('Xã/Phường');
    setSelectedWard({});

    await fetchWards(districtData.code);
  };

  const handleWardSelect = (wardData, fieldKey) => {
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

    setSelectedWard(wardData);

    setShowAddressDropdown((prev) => ({
      ...prev,
      [fieldKey]: false,
    }));
    setActiveAddressKey(null);
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
        addresses: selectedUser.addresses.map((address) => ({
          specificAddress: address.specificAddress,
          addressDetail: address.addressDetail,
          default: address.default,
        })),
      });

      setShowAddressDropdown({});
      setActiveAddressKey(null);
      setSelectedPlace('Tỉnh/Thành phố');
      setSelectedProvince({});
      setSelectedDistrict({});
      setSelectedWard({});
      setDistricts([]);
      setWards([]);
    } else {
      form.resetFields();
      setShowAddressDropdown({});
      setActiveAddressKey(null);
      setSelectedPlace('Tỉnh/Thành phố');
      setSelectedProvince({});
      setSelectedDistrict({});
      setSelectedWard({});
      setDistricts([]);
      setWards([]);
    }
  }, [selectedUser, form]);

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

    const search = searchText.toLowerCase();
    const matchSearch =
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.name?.toLowerCase().includes(search) ||
      user.userType?.toLowerCase().includes(search) ||
      user.branch?.name?.toLowerCase().includes(search);

    return matchRole && matchStatus && matchUserType && matchSearch;
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
      title: 'Trạng thái',
      key: 'isActive',
      align: 'center',
      render: (record) => (
        <Tag color={record.isActive ? 'green' : 'red'} className="p-5! w-full">
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

                setOpenModal(true);
              }}
            >
              Sửa
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleCreateUser = () => {
    setSelectedUser(null);
    setOpenModal(true);
  };

  const handleSubmit = async (values) => {
    setSubmitLoading(true);
    try {
      if (!selectedUser) {
        const response = await UserService.create(values);
        setUsers([...users, response.data.data]);
        message.success('Tạo người dùng thành công');
      } else {
        console.log(selectedUser);
        const response = await UserService.update(selectedUser._id, values);
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? response.data.data : user,
          ),
        );
        message.success('Cập nhật người dùng thành công');
      }
      handleCancel();
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
      message.error(
        selectedUser
          ? 'Cập nhật người dùng thất bại'
          : ' Tạo người dùng thất bại',
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpenModal(false);
    setSelectedUser(null);
    setModalType('create');
    setShowAddressDropdown({});
    setActiveAddressKey(null);
    setSelectedPlace('Tỉnh/Thành phố');
    setSelectedProvince({});
    setSelectedDistrict({});
    setSelectedWard({});
    setDistricts([]);
    setWards([]);
  };

  return (
    <>
      <Card
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: '10px' }}
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
              <Descriptions.Item label="Số điện thoại">
                {previewUser.phone ? (
                  <Text>{previewUser.phone}</Text>
                ) : (
                  <Text>Chưa cập nhật</Text>
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
                {previewUser.addresses && previewUser.addresses.length > 0 ? (
                  <div>
                    {previewUser.addresses.map((addr, index) => (
                      <div key={index} style={{ marginBottom: 4 }}>
                        <Tag color={addr.default ? 'blue' : 'default'}>
                          {addr.default ? 'Mặc định' : 'Phụ'}
                        </Tag>
                        <Text>
                          {' '}
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
                <Tag color={previewUser.isActive ? 'green' : 'red'}>
                  {previewUser.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                </Tag>
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
        width={700}
        OnClose
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
                  <Row gutter={16} key={key} align="middle">
                    <Col span={24}>
                      <Form.Item style={{ marginBottom: 0 }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Form.Item>
                    </Col>
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
                          autoSize={{ minRows: 1, maxRows: 4 }}
                        />
                      </Form.Item>
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
                            readOnly={true}
                            placeholder="Chọn địa chỉ"
                            value={
                              form.getFieldValue('addresses')?.[key]
                                ?.addressDetail || ''
                            }
                            onClick={() => {
                              const newShowAddressDropdown = {};

                              newShowAddressDropdown[key] =
                                !showAddressDropdown[key];
                              setShowAddressDropdown(newShowAddressDropdown);
                              setActiveAddressKey(
                                newShowAddressDropdown[key] ? key : null,
                              );

                              setSelectedPlace('Tỉnh/Thành phố');
                              setSelectedProvince({});
                              setSelectedDistrict({});
                              setSelectedWard({});
                              setDistricts([]);
                              setWards([]);
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

                          {showAddressDropdown[key] && (
                            <div
                              ref={(element) => {
                                if (key === activeAddressKey) {
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
                                      onClick={() =>
                                        handleProvinceSelect(province, key)
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
                                      onClick={() =>
                                        handleDistrictSelect(district, key)
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
                                      onClick={() =>
                                        handleWardSelect(ward, key)
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
                    <Col span={24}>
                      <Form.Item
                        {...restField}
                        name={[name, 'default']}
                        valuePropName="checked"
                        style={{ marginBottom: 10 }}
                      >
                        <Checkbox>Địa chỉ mặc định</Checkbox>
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
