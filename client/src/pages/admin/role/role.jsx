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
  Space,
  Popconfirm,
  Checkbox,
  Collapse,
  Divider,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  TeamOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  UserOutlined,
  CaretRightOutlined,
  CloseOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import {
  callFetchRoles,
  callDeleteRole,
  callUpdateRole,
  callCreateRole,
  callFetchPermission,
  callFetchUsers,
} from '@/services/apis';
import useMessage from '@/hooks/useMessage';
import { Label } from 'recharts';
import { Group } from 'antd/es/radio';
import { useAppContext } from '@/contexts';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const RoleManagement = () => {
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const { message } = useAppContext();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await callFetchRoles();
      setRoles(response.data.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await callFetchPermission();
      setPermissions(response.data.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const groupPermissionsByModule = () => {
    const grouped = {};

    permissions.forEach((permission) => {
      let module = permission.module;
      if (!module && permission.name) {
        const parts = permission.name.split('.');
        module = parts.length > 1 ? parts[0] : 'Other';
      }
      if (!module) {
        module = 'Other';
      }
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(permission);
    });

    return grouped;
  };

  const handleBulkDelete = async () => {
    try {
      const rolesWithUsers = selectedRowKeys.filter((roleId) => {
        const usersWithRole = users.filter((user) => user.roleId === roleId);
        return usersWithRole.length > 0;
      });

      if (rolesWithUsers.length > 0) {
        message.error('Không thể xóa role đang được sử dụng bởi user!');
        return;
      }

      await Promise.all(selectedRowKeys.map((id) => callDeleteRole(id)));
      message.success(`Đã xóa ${selectedRowKeys.length} role thành công`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setOpenModalDelete(false);
      fetchRoles();
    } catch (error) {
      console.error('Failed to delete roles:', error);
      message.error('Xóa thất bại');
    }
  };

  const reloadTable = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchRoles(), fetchPermissions(), fetchUsers()]);
      message.success('Data refreshed successfully');
    } catch (error) {
      console.error('Failed to reload data:', error);
      message.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataInit?._id) {
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        description: dataInit.description,
        permissions: permissions,
      });
    } else {
      form.resetFields();
    }
  }, [dataInit, permissions, form]);

  const filteredRoles = roles.filter(
    (role) =>
      role.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const getPermissionNames = (permissionIds) => {
    if (!permissionIds || permissionIds.length === 0) return [];
    return permissions
      .filter((p) => permissionIds.includes(p._id))
      .map((p) => p.name);
  };

  const columns = [
    {
      title: 'Tên Role',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) =>
        text ? (
          text.length > 100 ? (
            <Tooltip title={text}>{text.substring(0, 100)}...</Tooltip>
          ) : (
            text
          )
        ) : (
          <Text type="secondary" italic>
            No description
          </Text>
        ),
    },
    {
      title: 'Số lượng quyền',
      dataIndex: 'permissions',
      key: 'permissionCount',
      align: 'center',
      render: (permissionIds) => (
        <Tooltip
          placement="topLeft"
          title={getPermissionNames(permissionIds).join(', ')}
        >
          {permissionIds?.length || 0}
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckOutlined />}>Còn hoạt động</Tag>
        ) : (
          <Tag icon={<CloseOutlined />}>Ngưng hoạt động</Tag>
        ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          style={{ padding: 0 }}
          onClick={() => {
            setSelectedRole(record);
            setPreviewVisible(true);
          }}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedRows(selectedRows);
    },
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    console.log('Form values:', values);
    try {
      if (dataInit) {
        console.log('Updating role:', dataInit._id);
        await callUpdateRole({
          _id: dataInit._id,
          name: values.name,
          description: values.description,
          permissions: values.permissions || [],
        });
        message.success('Cập nhật role thành công');
      } else {
        await callCreateRole({
          name: values.name,
          description: values.description,
          permissions: values.permissions || [],
        });
        message.success('Tạo role mới thành công');
      }

      handleCancel();
      reloadTable();
    } catch (error) {
      console.error('Failed to save role:', error);
      message.error('Lưu role thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpenModal(false);
    setDataInit(null);
  };

  const groupedPermissions = groupPermissionsByModule();
  const moduleKeys = Object.keys(groupedPermissions).sort();

  const getItems = () =>
    moduleKeys.map((module) => ({
      key: module,
      label: (
        <div
          style={{
            padding: '12px 16px',
            cursor: 'pointer',
            borderRadius: 8,
            border: '2px solid  #E2E8F0',
          }}
        >
          <Text strong>
            {module.charAt(0).toUpperCase() + module.slice(1).toLowerCase()}
          </Text>
        </div>
      ),
      children: (
        <div style={{ padding: '16px' }}>
          <Row gutter={[16, 16]}>
            {groupedPermissions[module].map((permission) => (
              <Col span={12} key={permission._id}>
                <Checkbox
                  value={permission._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    border: '1px dashed rgb(178, 180, 184)',
                    borderRadius: 6,
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ marginLeft: 8 }}>{permission.name}</span>
                </Checkbox>
              </Col>
            ))}
          </Row>
        </div>
      ),
    }));

  return (
    <>
      <Modal
        title="Xóa role"
        open={openModalDelete}
        onCancel={() => setOpenModalDelete(false)}
        onOk={handleBulkDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        style={{ top: 20, zIndex: 9999 }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
        >
          <ExclamationCircleOutlined
            style={{ color: '#ff4d4f', fontSize: 22, marginRight: 8 }}
          />
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            Xác nhận xóa role
          </span>
        </div>
        <div>
          <p>Bạn có chắc là muốn xóa {selectedRowKeys.length} role đã chọn?</p>
          <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
            Lưu ý: Không thể xóa role đang được sử dụng bởi user
          </p>
        </div>
      </Modal>

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
              <TeamOutlined style={{ marginRight: 8 }} />
              Quản lý Role
            </Title>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Quản lý các vai trò trong hệ thống. Tổng cộng:{' '}
              <strong>{roles.length}</strong> roles
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
              placeholder="Tìm kiếm role, mô tả..."
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

          <Col xs={24} sm={12} md={12}>
            <Flex gap={8} wrap="wrap" justify="end">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  backgroundColor: 'rgb(11, 162, 36)',
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                }}
                onClick={() => {
                  setDataInit(null);
                  setOpenModal(true);
                }}
              >
                Tạo Role mới
              </Button>

              <Button
                type="primary"
                disabled={selectedRowKeys.length !== 1}
                icon={<EditOutlined />}
                onClick={() => {
                  setDataInit(selectedRows[0]);
                  setOpenModal(true);
                }}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow:
                    selectedRowKeys.length === 1
                      ? '0 2px 8px rgba(79, 70, 229, 0.2)'
                      : 'none',
                }}
              >
                Sửa ({selectedRowKeys.length})
              </Button>

              <Button
                danger
                onClick={() => setOpenModalDelete(true)}
                disabled={selectedRowKeys.length === 0}
                icon={<DeleteOutlined />}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  borderColor:
                    selectedRowKeys.length > 0 ? '#EF4444' : undefined,
                  boxShadow:
                    selectedRowKeys.length > 0
                      ? '0 2px 8px rgba(239, 68, 68, 0.2)'
                      : 'none',
                }}
              >
                Xóa ({selectedRowKeys.length})
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
          rowSelection={rowSelection}
          dataSource={filteredRoles}
          columns={columns}
          bordered
          size="middle"
          pagination={{
            defaultPageSize: 10,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Không tìm thấy role nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={selectedRole?.name}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setDataInit(selectedRole);
              setOpenModal(true);
              setPreviewVisible(false);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={700}
      >
        {selectedRole && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <div style={{ width: '100%' }}>
              <Title level={5}>Tên vai trò</Title>
              <Text strong style={{ fontSize: '16px' }}>
                {selectedRole.name}
              </Text>
            </div>
            <div style={{ width: '100%' }}>
              <Title level={5}>Mô tả</Title>
              <Paragraph>
                {selectedRole.description || 'Không có mô tả.'}
              </Paragraph>
            </div>

            <div style={{ width: '100%' }}>
              <Title level={5}>
                Permissions ({selectedRole.permissions?.length || 0})
              </Title>
              <div>
                {selectedRole.permissions &&
                selectedRole.permissions.length > 0 ? (
                  <Row gutter={[0, 40]}>
                    {selectedRole.permissions.map((permission) => (
                      <Col key={permission._id}>
                        <Tag
                          color="default"
                          style={{ fontSize: '14px', padding: '8px 12px' }}
                        >
                          {permission.name}
                        </Tag>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Tag color="red">Không có quyền</Tag>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={dataInit ? 'Cập nhật Role' : 'Tạo Role mới'}
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
            {dataInit ? 'Cập nhật' : 'Tạo mới'}
          </Button>,
        ]}
        width={900}
        OnClose
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên Role"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên role!',
                  },
                ]}
              >
                <Input
                  style={{ padding: '8px 12px' }}
                  placeholder="Ví dụ: Quản trị viên"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Mô tả"
                name="description"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mô tả!',
                  },
                ]}
              >
                <Input
                  style={{ padding: '8px 12px' }}
                  placeholder="Mô tả vai trò"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="center">
            <span style={{ fontWeight: 600, size: '16px' }}>Gán quyền </span>
          </Divider>

          <Form.Item name="permissions">
            <div>
              <Text strong style={{ fontSize: '16px' }}>
                Quyền hạn{' '}
              </Text>{' '}
              <span style={{ fontSize: '12px', color: '#666' }}>
                {' '}
                các quyền hạn được phép cho vai trò này
              </span>
            </div>

            <Checkbox.Group
              style={{ width: '100%' }}
              onChange={(checkedValues) => {
                form.setFieldValue('permissions', checkedValues);
                console.log('Form values:', form.getFieldsValue());
              }}
            >
              <div style={{ width: '100%' }}>
                <Collapse
                  bordered={false}
                  defaultActiveKey={moduleKeys}
                  expandIcon={({ isActive }) => (
                    <CaretRightOutlined rotate={isActive ? 90 : 0} />
                  )}
                  items={getItems()}
                  style={{
                    background: 'transparent',
                  }}
                />
              </div>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default RoleManagement;
