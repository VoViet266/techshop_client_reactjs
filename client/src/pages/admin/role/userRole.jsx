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
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [openModal, setOpenModal] = useState(false);
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
      await Promise.all([fetchUsers(), fetchRoles()]);
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
        branch: selectedUser.branch._id,
      });
    } else {
      form.resetFields();
    }
  }, [selectedUser, form]);

  const filteredUsers = users.filter((user) => {
    // Chỉ lấy user có role là nhân viên cửa hàng
    const staff = user.role?.permissions.length > 0;

    const matchRole =
      !filters.role || filters.role === '' || user.role?._id === filters.role;
    const search = searchText.toLowerCase();
    const matchSearch =
      user.name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.name?.toLowerCase().includes(search);

    return matchRole && matchSearch;
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
      render: (role) => (
        <Tag icon={<TeamOutlined />}>{role?.name || 'chưa có role'}</Tag>
      ),
    },
    {
      title: 'Cửa hàng',
      dataIndex: 'branch',
      key: 'branch',
      align: 'center',
      render: (branch) => (
        <Tag icon={<TeamOutlined />}>{branch?.name || 'chưa có role'}</Tag>
      ),
    },
    {
      title: 'Số quyền',
      dataIndex: 'role',
      key: 'permissions',
      align: 'center',
      render: (permission) => {
        return (
          <Tag icon={<SafetyOutlined />}>
            {permission?.permissions
              ? permission?.permissions.length
              : 'Không có quyền nào'}
          </Tag>
        );
      },
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      align: 'center',
      render: (record) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'Hoa­t động' : 'Ngưng hoạt động'}
        </Tag>
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
            Gán Role
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
      setUsers(
        users.map((user) =>
          user?._id === values?.userId
            ? { ...user, roleId: values.roleId }
            : user,
        ),
      );

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

  const handleCancel = () => {
    form.resetFields();
    setOpenModal(false);
    setSelectedUser(null);
  };

  const handleBulkAssignRole = async (roleId) => {
    if (selectedRowKeys.length === 0) {
      warning('Vui lòng chọn ít nhất một user');
      return;
    }
    setLoading(true);
    try {
      await Promise.all(
        selectedRowKeys.map((userId) => callUpdateRoleUser({ userId, roleId })),
      );

      setUsers(
        users.map((user) =>
          selectedRowKeys.includes(user._id) ? { ...user, roleId } : user,
        ),
      );

      success(`Đã gán role cho ${selectedRowKeys.length} user thành công`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
    } catch (error) {
      console.error('Failed to bulk assign roles:', error);
      error('Gán role hàng loạt thất bại');
    } finally {
      setLoading(false);
    }
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
              Gán vai trò cho người dùng
            </Title>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Quản lý phân quyền cho từng người dùng. Tổng cộng:{' '}
              <strong>{users.length}</strong> Người dùng
            </p>
          </Col>
        </Row>

        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
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
                border: `1px solid #CBD5E1`,
              }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Vai trò"
              style={{ width: '100%' }}
              value={filters.role}
              onChange={(value) => setFilters({ ...filters, role: value })}
              allowClear
            >
              <Option value="" key="all">
                All
              </Option>
              {roles.map((role) => (
                <Option key={role._id} value={role._id}>
                  {role.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={12}>
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
                    <Tag color="blue" style={{ marginBottom: 4 }}>
                      {previewUser.role.name
                        ? previewUser.role.name
                        : 'Chưa có vai trò'}
                    </Tag>
                  </div>
                ) : (
                  <Tag color="red">Không có role</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Số quyền">
                <Tag
                  color={
                    previewUser?.role?.permissions?.length > 0
                      ? 'green'
                      : 'default'
                  }
                >
                  {previewUser?.role?.permissions?.length
                    ? previewUser.role.permissions.length
                    : 'Không có quyền'}{' '}
                  quyền
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color="green">Hoạt động</Tag>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
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
        OnClose
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
          <Form.Item name="branch">
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

          <Form.Item name="roleId" label="Vai trò">
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
    </>
  );
};

export default UserRoleManagement;
