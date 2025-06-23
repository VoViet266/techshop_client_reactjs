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
  Select,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  callFetchPermission,
  callDeletePermission,
  callUpdatePermission,
  callCreatePermission,
} from '@/services/apis';
import useMessage from '@/hooks/useMessage';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const PermissionsManagement = () => {
  const [form] = Form.useForm();
  const [permissions, setPermissions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const { success, error, warning, contextHolder } = useMessage();

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await callFetchPermission();
      setPermissions(response.data.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => callDeletePermission(id)));
      message.success(`Đã xóa ${selectedRowKeys.length} permission thành công`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setOpenModalDelete(false);
      fetchPermissions();
    } catch (error) {
      console.error('Failed to delete permissions:', error);
      error('Xóa thất bại');
    }
  };

  const reloadTable = async () => {
    setLoading(true);
    try {
      const response = await callFetchPermission();
      setPermissions(response.data.data);
      message.success('Permissions refreshed successfully');
    } catch (error) {
      console.error('Failed to reload permissions:', error);
      error('Failed to refresh permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataInit?._id) {
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        action: dataInit.action,
        module: dataInit.module,
        description: dataInit.description,
      });
    } else {
      form.resetFields();
    }
  }, [dataInit]);

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      permission.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'Tên Permission',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <code
          style={{
            backgroundColor: '#f6f8fa',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {text}
        </code>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Thao tác',
      dataIndex: 'action',
      key: 'action',
      render: (text) => (
        <code
          style={{
            backgroundColor: '#f6f8fa',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {text}
        </code>
      ),
      sorter: (a, b) => a.action.localeCompare(b.action),
    },
    {
      title: 'mô-đun',
      dataIndex: 'module',
      key: 'module',
      render: (text) => (
        <code
          style={{
            backgroundColor: '#f6f8fa',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          {text}
        </code>
      ),
      sorter: (a, b) => a.module.localeCompare(b.module),
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
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) =>
        date
          ? new Date(date).toLocaleDateString('vi-VN')
          : new Date().toLocaleDateString('vi-VN'),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      align: 'center',
      render: (record) => <Tag color="green">Hoạt động</Tag>,
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
            setSelectedPermission(record);
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
    try {
      console.log(values);
      if (dataInit) {
        await callUpdatePermission({
          _id: dataInit._id,
          name: values.name,
          action: values.action,
          module: values.module,
          description: values.description,
        });
        success('Cập nhật permission thành công');
      } else {
        await callCreatePermission({
          name: values.name,
          description: values.description,
          action: values.action,
          module: values.module,
        });
        success('Tạo permission mới thành công');
      }

      handleCancel();
      reloadTable();
    } catch (error) {
      console.error('Failed to save permission:', error);
      error('Lưu permission thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setOpenModal(false);
    setDataInit(null);
  };

  const moduleOptions = [
    { label: 'Product', value: 'product' },
    { label: 'Category', value: 'category' },
    { label: 'Order', value: 'order' },
    { label: 'User', value: 'user' },
    { label: 'Role', value: 'role' },
    { label: 'Permission', value: 'permission' },
    { label: 'Inventory', value: 'inventory' },
    { label: 'Banner', value: 'banner' },
    { label: 'Cart', value: 'cart' },
    { label: 'Payment', value: 'payment' },
    { label: 'Promotion', value: 'promotion' },
    { label: 'Branch', value: 'branch' },
  ];

  const actionOptions = [
    { label: 'View', value: 'view' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' },
  ];
  return (
    <>
      {contextHolder}
      <Modal
        title="Xóa quyền"
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
            Xác nhận xóa quyền
          </span>
        </div>
        <div>
          <p>Bạn có chắc là muốn xóa {selectedRowKeys.length} quyền đã chọn?</p>
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
              <SafetyOutlined style={{ marginRight: 8 }} />
              Quản lý quyền hạn
            </Title>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              Quản lý các quyền hạn trong hệ thống. Tổng cộng:{' '}
              <strong>{permissions.length}</strong> quyền
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
              placeholder="Tìm kiếm quyền, mô tả..."
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
                Tạo quyền mới
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
          dataSource={filteredPermissions}
          columns={columns}
          bordered
          size="middle"
          pagination={{
            defaultPageSize: 10,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Không tìm thấy permission nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={selectedPermission?.name}
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
              setDataInit(selectedPermission);
              setOpenModal(true);
              setPreviewVisible(false);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={600}
      >
        {selectedPermission && (
          <div>
            <div style={{ width: '100%' }}>
              <Title level={5}>Tên Quyền</Title>
              <code
                style={{
                  backgroundColor: '#f6f8fa',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'block',
                  marginBottom: 16,
                }}
              >
                {selectedPermission.name}
              </code>
            </div>
            <div style={{ width: '100%' }}>
              <Title level={5}>Thao tác</Title>
              <code
                style={{
                  backgroundColor: '#f6f8fa',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'block',
                  marginBottom: 16,
                }}
              >
                {selectedPermission.action}
              </code>
            </div>
            <div style={{ width: '100%' }}>
              <Title level={5}>Module</Title>
              <code
                style={{
                  backgroundColor: '#f6f8fa',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'block',
                  marginBottom: 16,
                }}
              >
                {selectedPermission.module}
              </code>
            </div>
            <div style={{ width: '100%' }}>
              <Title level={5}>Mô tả</Title>
              <Paragraph>
                {selectedPermission.description || 'Không có mô tả.'}
              </Paragraph>
            </div>
            <div style={{ width: '100%' }}>
              <Title level={5}>Ngày tạo</Title>
              <Text>
                {selectedPermission.createdAt
                  ? new Date(selectedPermission.createdAt).toLocaleDateString(
                      'vi-VN',
                    )
                  : new Date().toLocaleDateString('vi-VN')}
              </Text>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title={dataInit ? 'Cập nhật quyền' : 'Tạo quyền mới'}
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
        width={600}
        destroyOnClose
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
                label="Tên Quyền"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên quyền!',
                  },
                  {
                    pattern: /^[a-z_]+$/,
                    message: 'Chỉ được sử dụng chữ thường và dấu gạch dưới!',
                  },
                ]}
              >
                <Input
                  placeholder="Ví dụ: view_user, edit_product"
                  style={{ fontFamily: 'monospace' }}
                />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Thao tác" name="action">
                <Select placeholder="Ví dụ: view, edit, delete">
                  {actionOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Mô-đun" name="module">
                <Select
                  placeholder="Mô-đun"
                  style={{ fontFamily: 'monospace' }}
                >
                  {moduleOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
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
                <TextArea
                  rows={4}
                  placeholder="Mô tả chức năng của permission"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default PermissionsManagement;
