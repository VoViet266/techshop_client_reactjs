import React, { useEffect, useState } from 'react';
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
  Badge,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  ReloadOutlined,
  TeamOutlined,
  SearchOutlined,
  EyeOutlined,
  MailOutlined,
  SafetyOutlined,
  SettingOutlined,
  PlusOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  callFetchUsers,
  callFetchRoles,
  callUpdateUser,
  callUpdateRoleUser,
  callFetchBranches,
} from '@/services/apis';
import useMessage from '@/hooks/useMessage';
import { useAppContext } from '@/contexts';
import Branchs from '@/services/branches';
import UserService from '@/services/users';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const UserRoleManagement = () => {
  const [form] = Form.useForm();
  const [addUserForm] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Tất cả người dùng
  const [roles, setRoles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openAddUserModal, setOpenAddUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [branches, setBranches] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUser, setPreviewUser] = useState(null);

  const [filters, setFilters] = useState({
    role: '',
  });
  const { message, permission } = useAppContext();

  useEffect(() => {
    fetchUsers();
    fetchAllUsers();
    fetchRoles();
    fetchBranches();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserService.getUserHasPermission();
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch tất cả người dùng (bao gồm cả những người chưa có quyền)
  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await callFetchUsers(); // API để lấy tất cả user
      setAllUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching all users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const response = await Branchs.getAll();
      setBranches(response.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await callFetchRoles();
      setRoles(response.data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const reloadTable = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchUsers(), fetchAllUsers(), fetchRoles()]);
    } catch (error) {
      console.error('Failed to reload data:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log(selectedUser);

  useEffect(() => {
    if (selectedUser) {
      form.setFieldsValue({
        userId: selectedUser._id,
        roleId: selectedUser.role?._id,
        branch: selectedUser.branch?._id,
      });
    } else {
      form.resetFields();
    }
  }, [selectedUser, form]);

  // Lọc người dùng dựa trên toggle và filter
  const getFilteredUsers = () => {
    const sourceUsers = users;

    return sourceUsers.filter((user) => {
      const matchRole =
        !filters.role || filters.role === '' || user.role?._id === filters.role;
      const search = searchText.toLowerCase();
      const matchSearch =
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.name?.toLowerCase().includes(search);

      return matchRole && matchSearch;
    });
  };

  const filteredUsers = getFilteredUsers();

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={record?.avatar}
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
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Vai trò hiện tại',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      render: (role) => <Text>{role?.name || 'Chưa có vai trò'}</Text>,
    },
    {
      title: 'Cửa hàng',
      dataIndex: 'branch',
      key: 'branch',
      align: 'center',
      render: (branch) => <Text>{branch?.name || 'Chưa có cửa hàng'}</Text>,
    },
    {
      title: 'Số quyền',
      dataIndex: 'role',
      key: 'permissions',
      align: 'center',
      render: (permission) => {
        const permissionCount = permission?.permissions?.length || 0;
        return (
          <Text>
            {permissionCount > 0
              ? `${permissionCount} quyền`
              : 'Không có quyền'}
          </Text>
        );
      },
      sorter: (a, b) => a.role.permissions.length - b.role.permissions.length,
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      align: 'center',
      render: (record) => (
        <Badge
          color={record?.isActive ? 'green' : 'red'}
          text={record?.isActive ? 'Hoạt động' : 'Khóa'}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
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
          <Button
            type="primary"
            icon={<SettingOutlined />}
            size="small"
            onClick={() => {
              setSelectedUser(record);
              setOpenModal(true);
            }}
          >
            {record.role?.permissions?.length > 0 ? 'Sửa Role' : 'Cấp quyền'}
          </Button>
        </Space>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await callUpdateRoleUser({
        userId: values.userId,
        roleId: values.roleId,
        branchId: values.branch,
      });

      message.success('Gán vai trò cho người dùng thành công');
      reloadTable();
      handleCancel();
    } catch (error) {
      console.error('Failed to update user role:', error);
      message.error('Gán vai trò thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Quản lý vai trò người dùng';
  }, []);

  const handleAddUser = async (values) => {
    setLoading(true);
    try {
      await callUpdateRoleUser({
        userId: values.userId,
        roleId: values.roleId,
        branchId: values.branch,
      });

      message.success('Thêm người dùng và gán vai trò thành công');
      reloadTable();
      handleCancelAddUser();
    } catch (error) {
      console.error('Failed to add user:', error);
      message.error('Thêm người dùng thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleCancelAddUser = () => {
    addUserForm.resetFields();
    setOpenAddUserModal(false);
  };

  // Lấy danh sách user chưa có trong hệ thống quyền
  const getUsersWithoutPermissions = () => {
    const usersWithPermissions = users.map((u) => u._id);
    return allUsers.filter((user) => !usersWithPermissions.includes(user._id));
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
              <TeamOutlined style={{ marginRight: 8 }} />
              Quản lý vai trò người dùng
            </Title>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Quản lý phân quyền cho từng người dùng.
            </p>
          </Col>
        </Row>

        <Row
          gutter={10}
          justify="space-between"
          align="middle"
          style={{ marginBottom: 14 }}
        >
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm user, email..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{
                borderRadius: 8,
                height: '40px',
                border: `1px solid #CBD5E1`,
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="Vai trò"
              style={{ width: '100%' }}
              value={filters.role}
              onChange={(value) => setFilters({ ...filters, role: value })}
              allowClear
            >
              <Option value="" key="all">
                Tất cả
              </Option>
              {roles.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={14}>
            <Flex gap={8} wrap="wrap" justify="end">
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => setOpenAddUserModal(true)}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                Thêm từ người dùng
              </Button>
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
                description="Không tìm thấy user nào"
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
            <span>{previewUser?.name}</span>
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
            Gán Vai trò
          </Button>,
        ]}
        width={600}
      >
        {previewUser && (
          <div style={{ padding: '16px 0' }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên Người dùng">
                <Text strong>{previewUser.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Text code>{previewUser.email}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò hiện tại">
                {previewUser.role ? (
                  <div>
                    <Text>{previewUser.role.name || 'Chưa có vai trò'}</Text>
                  </div>
                ) : (
                  <Text>Không có role</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Cửa hàng">
                {previewUser.branch ? (
                  <Text color="green">{previewUser.branch.name}</Text>
                ) : (
                  <Text color="default">Chưa có cửa hàng</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số quyền">
                <Text>{previewUser?.role?.permissions?.length || 0} quyền</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={previewUser.isActive ? 'success' : 'default'}
                  text={previewUser.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                />
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Modal gán role cho user hiện có */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SafetyOutlined style={{ color: '#1890ff' }} />
            <span>Gán vai trò cho người dùng</span>
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
            loading={loading}
            onClick={() => form.submit()}
          >
            Cập nhật vai trò
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Divider orientation="left">
            <span style={{ color: '#666', fontWeight: 500 }}>
              Thông tin người dùng
            </span>
          </Divider>

          <Form.Item name="userId" style={{ display: 'none' }}>
            <Input type="hidden" />
          </Form.Item>

          {selectedUser && (
            <div
              style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <Avatar
                  size={48}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff' }}
                >
                  {selectedUser.name?.charAt(0)?.toUpperCase()}
                </Avatar>
                <div>
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>
                      {selectedUser.name}
                    </Text>
                  </div>
                  <div style={{ color: '#666', fontSize: '14px' }}>
                    <MailOutlined style={{ marginRight: 4 }} />
                    {selectedUser.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          <Form.Item name="branch" label="Cửa hàng">
            <Select placeholder="Chọn cửa hàng">
              {branches?.map((branch, index) => (
                <Select.Option key={index} value={branch._id}>
                  {branch?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">
            <span style={{ color: '#1890ff', fontWeight: 600 }}>
              Chọn Vai trò
            </span>
          </Divider>

          <Form.Item name="roleId" label="Vai trò">
            <Select
              placeholder="Chọn role cho user"
              size="large"
              style={{ borderRadius: 8 }}
              allowClear
            >
              {roles.map((role) => (
                <Option key={role._id} value={role._id}>
                  <div style={{ padding: '8px 0' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <SafetyOutlined style={{ color: '#1890ff' }} />
                      <Text strong>{role.name}</Text>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                    >
                      {role.description}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: '2px',
                      }}
                    >
                      {role.permissions?.length || 0} quyền
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm user từ danh sách tất cả user */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserAddOutlined style={{ color: '#52c41a' }} />
            <span>Thêm người dùng từ hệ thống</span>
          </div>
        }
        open={openAddUserModal}
        onCancel={handleCancelAddUser}
        footer={[
          <Button key="cancel" onClick={handleCancelAddUser}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => addUserForm.submit()}
          >
            Thêm và gán vai trò
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={addUserForm}
          layout="vertical"
          onFinish={handleAddUser}
          autoComplete="off"
        >
          <Divider orientation="left">
            <span style={{ color: '#666', fontWeight: 500 }}>
              Chọn người dùng
            </span>
          </Divider>

          <Form.Item
            name="userId"
            label="Người dùng"
            rules={[{ required: true, message: 'Vui lòng chọn người dùng' }]}
          >
            <Select
              placeholder="Chọn người dùng để thêm vào hệ thống"
              size="large"
              style={{ borderRadius: 8 }}
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.props.children[1].props.children[0].props.children
                  .toLowerCase()
                  .includes(input.toLowerCase()) ||
                option.children.props.children[1].props.children[1].props.children[1]
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {getUsersWithoutPermissions().map((user) => (
                <Option key={user._id} value={user._id}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <Avatar
                      size={32}
                      icon={<UserOutlined />}
                      src={user?.avatar}
                      style={{ backgroundColor: '#1890ff' }}
                    >
                      {user.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <div>
                      <div>
                        <Text strong>{user.name}</Text>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="branch"
            label="Cửa hàng"
            rules={[{ required: true, message: 'Vui lòng chọn cửa hàng' }]}
          >
            <Select placeholder="Chọn cửa hàng">
              {branches?.map((branch, index) => (
                <Select.Option key={index} value={branch._id}>
                  {branch?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">
            <span style={{ color: '#52c41a', fontWeight: 600 }}>
              Gán vai trò
            </span>
          </Divider>

          <Form.Item
            name="roleId"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select
              placeholder="Chọn role cho user"
              size="large"
              style={{ borderRadius: 8 }}
            >
              {roles.map((role) => (
                <Option key={role._id} value={role._id}>
                  <div style={{ padding: '8px 0' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <SafetyOutlined style={{ color: '#52c41a' }} />
                      <Text strong>{role.name}</Text>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                    >
                      {role.description}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#999',
                        marginTop: '2px',
                      }}
                    >
                      {role.permissions?.length || 0} quyền
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserRoleManagement;
