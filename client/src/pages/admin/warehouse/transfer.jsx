import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Divider,
  Popconfirm,
  message,
  DatePicker,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  callFetchBranches,
  callFetchInventories,
  callFetchTransferHistory,
} from '@/services/apis';

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const mockVariants = [
  { _id: '1', name: '128GB - Đen', productId: '1' },
  { _id: '2', name: '256GB - Trắng', productId: '1' },
  { _id: '3', name: '128GB - Xanh', productId: '2' },
];

const mockTransfers = [
  {
    _id: '1',
    fromBranchId: '1',
    toBranchId: '2',
    status: 'PENDING',
    items: [{ productId: '1', variants: '1', quantity: 10 }],
    note: 'Chuyển hàng định kỳ',
    createdBy: { email: 'admin@example.com', name: 'Admin' },
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    _id: '2',
    fromBranchId: '2',
    toBranchId: '3',
    status: 'COMPLETED',
    items: [{ productId: '2', variants: '3', quantity: 5 }],
    note: 'Bổ sung hàng tồn kho',
    createdBy: { email: 'manager@example.com', name: 'Manager' },
    createdAt: '2024-12-02T14:30:00Z',
  },
];

const TransactionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const TransferManagement = () => {
  const [transfers, setTransfers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [viewingTransfer, setViewingTransfer] = useState(null);
  const [branches, setBranches] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [selectedTransferDetail, setSelectedTransferDetail] = useState([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const statusColors = {
    PENDING: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'red',
  };

  const statusLabels = {
    PENDING: 'Đang chờ',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  const columns = [
    {
      title: 'Mã chuyển kho',
      dataIndex: '_id',
      key: '_id',
      width: 120,
      render: (text) => `TF${text.slice(-6).toUpperCase()}`,
    },
    {
      title: 'Từ chi nhánh',
      dataIndex: 'fromBranchId',
      key: 'fromBranchId',
      // render: (branchId) => {
      //   const branch = mockBranches.find((b) => b._id === branchId);
      //   return branch ? branch.name : 'N/A';
      // },
    },
    {
      title: 'Đến chi nhánh',
      dataIndex: 'toBranchId',
      key: 'toBranchId',
      // render: (branchId) => {
      //   const branch = mockBranches.find((b) => b._id === branchId);
      //   return branch ? branch.name : 'N/A';
      // },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>
      ),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      render: (createdBy) => createdBy?.name || 'N/A',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            disabled={record.status === 'COMPLETED'}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.status === 'COMPLETED'}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data);
    } catch (error) {
      console.error('Error fetching branches:', error);
      message.error('Không thể tải danh sách chi nhánh');
    }
  };
  const fetchInventories = async () => {
    try {
      const response = await callFetchInventories();
      setInventories(response.data.data);
    } catch (err) {
      console.error('Error fetching inventories:', err);
      message.error('Không thể tải danh sách tồn kho');
    }
  };
  const fetchTransferHistory = async () => {
    try {
      const response = await callFetchTransferHistory();
      setTransfers(response.data.data);
    } catch (error) {
      console.error('Error fetching transfer history:', error);
      message.error('Không thể tải lịch sử chuyển kho');
    }
  };
  const fetchTransferDetail = async (transferId) => {
    setDetailLoading(true);
    try {
      const response = await callFetchDetailTransfer(transferId);
      setSelectedTransferDetail(response.data.data);
      setDetailDrawerVisible(true);
    } catch (error) {
      console.error('Error fetching transfer detail:', error);
      message.error('Không thể tải chi tiết phiếu chuyển');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchInventories();
    fetchTransferHistory();
  }, []);
  const handleCreate = () => {
    setEditingTransfer(null);
    form.resetFields();
    form.setFieldsValue({
      items: [{ productId: undefined, variants: undefined, quantity: 1 }],
    });
    setIsModalVisible(true);
  };

  const handleEdit = (transfer) => {
    setEditingTransfer(transfer);
    form.setFieldsValue({
      fromBranchId: transfer.fromBranchId,
      toBranchId: transfer.toBranchId,
      status: transfer.status,
      note: transfer.note,
      items: transfer.items,
    });
    setIsModalVisible(true);
  };

  const handleView = (transfer) => {
    setViewingTransfer(transfer);
    setIsViewModalVisible(true);
  };

  const handleDelete = (id) => {
    setTransfers(transfers.filter((t) => t._id !== id));
    message.success('Xóa thành công!');
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      if (editingTransfer) {
        // Update existing transfer
        const updatedTransfers = transfers.map((t) =>
          t._id === editingTransfer._id
            ? {
                ...t,
                ...values,
                updatedBy: { email: 'current@user.com', name: 'Current User' },
              }
            : t,
        );
        setTransfers(updatedTransfers);
        message.success('Cập nhật thành công!');
      } else {
        // Create new transfer
        const newTransfer = {
          _id: Date.now().toString(),
          ...values,
          createdBy: { email: 'current@user.com', name: 'Current User' },
          createdAt: new Date().toISOString(),
        };
        setTransfers([newTransfer, ...transfers]);
        message.success('Tạo mới thành công!');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId) => {
    const product = mockProducts.find((p) => p._id === productId);
    return product ? product.name : 'N/A';
  };

  const getVariantName = (variantId) => {
    const variant = mockVariants.find((v) => v._id === variantId);
    return variant ? variant.name : 'N/A';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3}>Quản lý chuyển kho</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Tạo phiếu chuyển kho
            </Button>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={transfers}
          rowKey="_id"
          scroll={{ x: 1000 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={
          editingTransfer
            ? 'Chỉnh sửa phiếu chuyển kho'
            : 'Tạo phiếu chuyển kho mới'
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        OnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: TransactionStatus.PENDING,
            items: [{ productId: undefined, variants: undefined, quantity: 1 }],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fromBranchId"
                label="Từ chi nhánh"
                rules={[
                  { required: true, message: 'Vui lòng chọn chi nhánh gửi' },
                ]}
              >
                <Select placeholder="Chọn chi nhánh gửi">
                  {branches.map((branch) => (
                    <Option key={branch._id} value={branch._id}>
                      {branch.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="toBranchId"
                label="Đến chi nhánh"
                rules={[
                  { required: true, message: 'Vui lòng chọn chi nhánh nhận' },
                ]}
              >
                <Select placeholder="Chọn chi nhánh nhận">
                  {branches.map((branch) => (
                    <Option key={branch._id} value={branch._id}>
                      {branch.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value={TransactionStatus.PENDING}>Đang chờ</Option>
              <Option value={TransactionStatus.COMPLETED}>Hoàn thành</Option>
              <Option value={TransactionStatus.CANCELLED}>Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Title level={5}>Danh sách sản phẩm</Title>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                  >
                    Thêm sản phẩm
                  </Button>
                </div>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'productId']}
                          label="Sản phẩm"
                          rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                        >
                          <Select placeholder="Chọn sản phẩm">
                            {mockProducts.map((product) => (
                              <Option key={product._id} value={product._id}>
                                {product.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'variants']}
                          label="Biến thể"
                          rules={[{ required: true, message: 'Chọn biến thể' }]}
                        >
                          <Select placeholder="Chọn biến thể">
                            {mockVariants.map((variant) => (
                              <Option key={variant._id} value={variant._id}>
                                {variant.name}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'quantity']}
                          label="Số lượng"
                          rules={[{ required: true, message: 'Nhập số lượng' }]}
                        >
                          <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={2}>
                        <Form.Item label=" ">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item name="note" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú..." />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingTransfer ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Modal */}
      <Modal
        title={`Chi tiết phiếu chuyển kho - TF${viewingTransfer?._id?.slice(-6).toUpperCase()}`}
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {viewingTransfer && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Từ chi nhánh:</strong>
                <br />
                {getBranchName(viewingTransfer.fromBranchId)}
              </Col>
              <Col span={12}>
                <strong>Đến chi nhánh:</strong>
                <br />
                {getBranchName(viewingTransfer.toBranchId)}
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <strong>Trạng thái:</strong>
                <br />
                <Tag color={statusColors[viewingTransfer.status]}>
                  {statusLabels[viewingTransfer.status]}
                </Tag>
              </Col>
              <Col span={12}>
                <strong>Ngày tạo:</strong>
                <br />
                {new Date(viewingTransfer.createdAt).toLocaleString('vi-VN')}
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Danh sách sản phẩm</Title>
            <Table
              size="small"
              dataSource={viewingTransfer.items}
              pagination={false}
              columns={[
                {
                  title: 'Sản phẩm',
                  dataIndex: 'productId',
                  render: (productId) => getProductName(productId),
                },
                {
                  title: 'Biến thể',
                  dataIndex: 'variants',
                  render: (variantId) => getVariantName(variantId),
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                },
              ]}
            />

            {viewingTransfer.note && (
              <>
                <Divider />
                <div>
                  <strong>Ghi chú:</strong>
                  <br />
                  {viewingTransfer.note}
                </div>
              </>
            )}

            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <strong>Người tạo:</strong>
                <br />
                {viewingTransfer.createdBy?.name} (
                {viewingTransfer.createdBy?.email})
              </Col>
              {viewingTransfer.updatedBy && (
                <Col span={12}>
                  <strong>Người cập nhật:</strong>
                  <br />
                  {viewingTransfer.updatedBy.name} (
                  {viewingTransfer.updatedBy.email})
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TransferManagement;
