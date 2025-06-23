import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Space,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Divider,
} from 'antd';
import {
  UserOutlined,
  SafetyOutlined,
  KeyOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Permission Management Page
// const PermissionPage = ({ permissions, setPermissions }) => {
//   const [permissionModalVisible, setPermissionModalVisible] = useState(false);
//   const [editingPermission, setEditingPermission] = useState(null);
//   const [permissionForm] = Form.useForm();

//   const handleAddPermission = () => {
//     setEditingPermission(null);
//     permissionForm.resetFields();
//     setPermissionModalVisible(true);
//   };

//   const handleEditPermission = (permission) => {
//     setEditingPermission(permission);
//     permissionForm.setFieldsValue(permission);
//     setPermissionModalVisible(true);
//   };

//   const handleSavePermission = async () => {
//     try {
//       const values = await permissionForm.validateFields();
//       if (editingPermission) {
//         setPermissions(
//           permissions.map((perm) =>
//             perm.id === editingPermission.id ? { ...perm, ...values } : perm,
//           ),
//         );
//         message.success('Cập nhật permission thành công!');
//       } else {
//         const newPermission = {
//           id: Math.max(...permissions.map((p) => p.id)) + 1,
//           ...values,
//         };
//         setPermissions([...permissions, newPermission]);
//         message.success('Tạo permission mới thành công!');
//       }
//       setPermissionModalVisible(false);
//     } catch (error) {
//       console.error('Validation failed:', error);
//     }
//   };

//   const handleDeletePermission = (permissionId) => {
//     setPermissions(permissions.filter((perm) => perm.id !== permissionId));
//     message.success('Xóa permission thành công!');
//   };

//   const permissionColumns = [
//     {
//       title: 'ID',
//       dataIndex: 'id',
//       key: 'id',
//       width: 80,
//       render: (id) => <Tag color="blue">#{id}</Tag>,
//     },
//     {
//       title: 'Tên Permission',
//       dataIndex: 'name',
//       key: 'name',
//       render: (text) => (
//         <code
//           style={{
//             backgroundColor: '#f6f8fa',
//             padding: '2px 6px',
//             borderRadius: '3px',
//           }}
//         >
//           {text}
//         </code>
//       ),
//     },
//     {
//       title: 'Mô tả',
//       dataIndex: 'description',
//       key: 'description',
//     },
//     {
//       title: 'Ngày tạo',
//       dataIndex: 'createdAt',
//       key: 'createdAt',
//       render: () => new Date().toLocaleDateString('vi-VN'),
//     },
//     {
//       title: 'Thao tác',
//       key: 'action',
//       width: 150,
//       render: (_, record) => (
//         <Space>
//           <Button
//             type="primary"
//             icon={<EditOutlined />}
//             size="small"
//             onClick={() => handleEditPermission(record)}
//           >
//             Sửa
//           </Button>
//           <Popconfirm
//             title="Bạn có chắc chắn muốn xóa permission này?"
//             description="Hành động này không thể hoàn tác!"
//             onConfirm={() => handleDeletePermission(record.id)}
//             okText="Có"
//             cancelText="Không"
//           >
//             <Button danger icon={<DeleteOutlined />} size="small">
//               Xóa
//             </Button>
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <>
//       <Card>
//         <div
//           style={{
//             marginBottom: 16,
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//           }}
//         >
//           <div>
//             <Title level={3} style={{ margin: 0 }}>
//               Quản lý Permission
//             </Title>
//             <p style={{ margin: '8px 0 0 0', color: '#666' }}>
//               Quản lý các quyền hạn trong hệ thống. Tổng cộng:{' '}
//               <strong>{permissions.length}</strong> permissions
//             </p>
//           </div>
//           <Button
//             type="primary"
//             icon={<PlusOutlined />}
//             onClick={handleAddPermission}
//             size="large"
//           >
//             Tạo Permission mới
//           </Button>
//         </div>

//         <Table
//           columns={permissionColumns}
//           dataSource={permissions}
//           rowKey="id"
//           pagination={{
//             pageSize: 10,
//             showSizeChanger: true,
//             showTotal: (total, range) =>
//               `${range[0]}-${range[1]} của ${total} permissions`,
//           }}
//           bordered
//         />
//       </Card>

//       {/* Permission Modal */}
//       <Modal
//         title={
//           editingPermission ? 'Chỉnh sửa Permission' : 'Tạo Permission mới'
//         }
//         open={permissionModalVisible}
//         onOk={handleSavePermission}
//         onCancel={() => setPermissionModalVisible(false)}
//         width={500}
//         okText={editingPermission ? 'Cập nhật' : 'Tạo mới'}
//         cancelText="Hủy"
//       >
//         <Form form={permissionForm} layout="vertical">
//           <Form.Item
//             name="name"
//             label="Tên Permission"
//             rules={[
//               { required: true, message: 'Vui lòng nhập tên permission!' },
//               {
//                 pattern: /^[a-z_]+$/,
//                 message: 'Chỉ được sử dụng chữ thường và dấu gạch dưới!',
//               },
//             ]}
//           >
//             <Input
//               placeholder="Ví dụ: view_user, edit_product"
//               style={{ fontFamily: 'monospace' }}
//             />
//           </Form.Item>

//           <Form.Item
//             name="description"
//             label="Mô tả"
//             rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
//           >
//             <Input placeholder="Mô tả chức năng của permission" />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </>
//   );
// };

// Role Management Page
const RolePage = ({ roles, setRoles, permissions, users, setUsers }) => {
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm] = Form.useForm();

  const handleAddRole = () => {
    setEditingRole(null);
    roleForm.resetFields();
    setRoleModalVisible(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    roleForm.setFieldsValue({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setRoleModalVisible(true);
  };

  const handleSaveRole = async () => {
    try {
      const values = await roleForm.validateFields();
      if (editingRole) {
        setRoles(
          roles.map((role) =>
            role.id === editingRole.id ? { ...role, ...values } : role,
          ),
        );
        message.success('Cập nhật role thành công!');
      } else {
        const newRole = {
          id: Math.max(...roles.map((r) => r.id)) + 1,
          ...values,
          userCount: 0,
        };
        setRoles([...roles, newRole]);
        message.success('Tạo role mới thành công!');
      }
      setRoleModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDeleteRole = (roleId) => {
    // Check if role is being used by users
    const usersWithRole = users.filter((user) => user.roleId === roleId);
    if (usersWithRole.length > 0) {
      message.error(
        `Không thể xóa role này vì đang có ${usersWithRole.length} user sử dụng!`,
      );
      return;
    }

    setRoles(roles.filter((role) => role.id !== roleId));
    message.success('Xóa role thành công!');
  };

  const getPermissionNames = (permissionIds) => {
    return permissions
      .filter((p) => permissionIds.includes(p.id))
      .map((p) => p.description);
  };

  const roleColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <Tag color="green">#{id}</Tag>,
    },
    {
      title: 'Tên Role',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong style={{ color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Số lượng User',
      dataIndex: 'userCount',
      key: 'userCount',
      render: (count) => {
        const actualCount = users.filter(
          (user) => user.roleId === parseInt(count),
        ).length;
        return (
          <Tag color={actualCount > 0 ? 'blue' : 'default'}>
            {actualCount} users
          </Tag>
        );
      },
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissionIds) => (
        <div>
          {permissionIds && permissionIds.length > 0 ? (
            getPermissionNames(permissionIds).map((perm, index) => (
              <Tag key={index} color="green" style={{ marginBottom: 4 }}>
                {perm}
              </Tag>
            ))
          ) : (
            <Tag color="red">Không có quyền</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditRole(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa role này?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDeleteRole(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div
          style={{
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0 }}>
              Quản lý Role
            </Title>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Quản lý các vai trò trong hệ thống. Tổng cộng:{' '}
              <strong>{roles.length}</strong> roles
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddRole}
            size="large"
          >
            Tạo Role mới
          </Button>
        </div>

        <Table
          columns={roleColumns}
          dataSource={roles}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} roles`,
          }}
          bordered
        />
      </Card>

      {/* Role Modal */}
      <Modal
        title={editingRole ? 'Chỉnh sửa Role' : 'Tạo Role mới'}
        open={roleModalVisible}
        onOk={handleSaveRole}
        onCancel={() => setRoleModalVisible(false)}
        width={700}
        okText={editingRole ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form form={roleForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên Role"
                rules={[{ required: true, message: 'Vui lòng nhập tên role!' }]}
              >
                <Input placeholder="Ví dụ: Quản trị viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
              >
                <Input placeholder="Mô tả vai trò" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="permissions"
            label="Gán Permissions"
            rules={[
              {
                required: true,
                message: 'Vui lòng chọn ít nhất một permission!',
              },
            ]}
          >
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                {permissions.map((permission) => (
                  <Col
                    span={24}
                    key={permission.id}
                    style={{ marginBottom: 12 }}
                  >
                    <Checkbox value={permission.id}>
                      <div>
                        <strong style={{ color: '#1890ff' }}>
                          {permission.name}
                        </strong>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {permission.description}
                        </div>
                      </div>
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

// User Role Assignment Page
const UserRolePage = ({ users, setUsers, roles }) => {
  const [userRoleModalVisible, setUserRoleModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userRoleForm] = Form.useForm();

  const handleEditUserRole = (user) => {
    setEditingUser(user);
    userRoleForm.setFieldsValue({
      userId: user.id,
      roleId: user.roleId,
    });
    setUserRoleModalVisible(true);
  };

  const handleSaveUserRole = async () => {
    try {
      const values = await userRoleForm.validateFields();
      setUsers(
        users.map((user) =>
          user.id === values.userId ? { ...user, roleId: values.roleId } : user,
        ),
      );

      message.success('Gán role cho user thành công!');
      setUserRoleModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <Tag color="purple">#{id}</Tag>,
    },
    {
      title: 'Tên User',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <code
          style={{
            backgroundColor: '#f6f8fa',
            padding: '2px 6px',
            borderRadius: '3px',
          }}
        >
          {email}
        </code>
      ),
    },
    {
      title: 'Role hiện tại',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return role ? (
          <Tag color="blue" style={{ fontSize: '13px' }}>
            {role.name}
          </Tag>
        ) : (
          <Tag color="red">Không có role</Tag>
        );
      },
    },
    {
      title: 'Permissions',
      dataIndex: 'roleId',
      key: 'permissions',
      render: (roleId) => {
        const role = roles.find((r) => r.id === roleId);
        return role && role.permissions ? (
          <div>{role.permissions.length} quyền</div>
        ) : (
          <span style={{ color: '#999' }}>Không có quyền</span>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<SettingOutlined />}
          size="small"
          onClick={() => handleEditUserRole(record)}
        >
          Gán Role
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Title level={3} style={{ margin: 0 }}>
            Gán Role cho User
          </Title>
          <p style={{ margin: '8px 0 0 0', color: '#666' }}>
            Quản lý phân quyền cho từng user. Tổng cộng:{' '}
            <strong>{users.length}</strong> users
          </p>
        </div>

        <Table
          columns={userColumns}
          dataSource={users}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} users`,
          }}
          bordered
        />
      </Card>

      {/* User Role Assignment Modal */}
      <Modal
        title="Gán Role cho User"
        open={userRoleModalVisible}
        onOk={handleSaveUserRole}
        onCancel={() => setUserRoleModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={userRoleForm} layout="vertical">
          <Form.Item name="userId" label="User">
            <Select disabled>
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="roleId"
            label="Role"
            rules={[{ required: true, message: 'Vui lòng chọn role!' }]}
          >
            <Select placeholder="Chọn role">
              {roles.map((role) => (
                <Option key={role.id} value={role.id}>
                  <div>
                    <div>
                      <strong>{role.name}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {role.description}
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

// Main App Component
const RolePermissionManagement = () => {
  const [activeTab, setActiveTab] = useState('permissions');
  const [collapsed, setCollapsed] = useState(false);

  // State cho Roles
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Quản trị viên',
      description: 'Quyền cao nhất trong hệ thống',
      permissions: [1, 2, 3, 4, 5, 6, 7, 8],
      userCount: 2,
    },
    {
      id: 2,
      name: 'Nhân viên kho',
      description: 'Quản lý kho hàng và đơn hàng',
      permissions: [3, 4, 5],
      userCount: 5,
    },
    {
      id: 3,
      name: 'Marketing',
      description: 'Quản lý marketing và nội dung',
      permissions: [6, 7],
      userCount: 3,
    },
    {
      id: 4,
      name: 'Khách hàng VIP',
      description: 'Khách hàng ưu tiên',
      permissions: [8],
      userCount: 15,
    },
  ]);

  // State cho Permissions
  const [permissions, setPermissions] = useState([
    { id: 1, name: 'view_user', description: 'Xem danh sách người dùng' },
    { id: 2, name: 'edit_user', description: 'Chỉnh sửa thông tin người dùng' },
    { id: 3, name: 'view_product', description: 'Xem danh sách sản phẩm' },
    { id: 4, name: 'edit_product', description: 'Chỉnh sửa sản phẩm' },
    { id: 5, name: 'delete_order', description: 'Xóa đơn hàng' },
    { id: 6, name: 'manage_banner', description: 'Quản lý banner quảng cáo' },
    { id: 7, name: 'manage_content', description: 'Quản lý nội dung' },
    { id: 8, name: 'view_vip_content', description: 'Xem nội dung VIP' },
  ]);

  // State cho Users
  const [users, setUsers] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'admin@example.com', roleId: 1 },
    { id: 2, name: 'Trần Thị B', email: 'warehouse@example.com', roleId: 2 },
    { id: 3, name: 'Lê Văn C', email: 'marketing@example.com', roleId: 3 },
    { id: 4, name: 'Phạm Thị D', email: 'vip1@example.com', roleId: 4 },
    { id: 5, name: 'Hoàng Văn E', email: 'vip2@example.com', roleId: 4 },
  ]);

  // Menu items
  const menuItems = [
    {
      key: 'permissions',
      icon: <KeyOutlined />,
      label: 'Quản lý Permission',
    },
    {
      key: 'roles',
      icon: <SafetyOutlined />,
      label: 'Quản lý Role',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Gán Role cho User',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'permissions':
        return (
          <PermissionPage
            permissions={permissions}
            setPermissions={setPermissions}
          />
        );

      case 'roles':
        return (
          <RolePage
            roles={roles}
            setRoles={setRoles}
            permissions={permissions}
            users={users}
            setUsers={setUsers}
          />
        );

      case 'users':
        return <UserRolePage users={users} setUsers={setUsers} roles={roles} />;

      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={250}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'RBP' : 'Role & Permission'}
          </Title>
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <Menu
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={({ key }) => setActiveTab(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <Title level={2} style={{ margin: 0, lineHeight: '64px' }}>
            Hệ thống quản lý phân quyền
          </Title>
        </Header>

        <Content style={{ margin: '24px', background: '#f0f2f5' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default RolePermissionManagement;
