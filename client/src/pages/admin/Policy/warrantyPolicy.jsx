import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Card,
  Typography,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Statistic,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import Policy from '@/services/policy';
import { formatCurrency } from '@/helpers';

const { Title, Text } = Typography;
const { TextArea } = Input;

const WarrantyPolicyManagement = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [warrantyPolicy, setWarrantyPolicy] = useState([]);

  const fetchWarrantyPolicies = async () => {
    try {
      const res = await Policy.getAllWarranties();
      setWarrantyPolicy(res.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('Lỗi khi tải dữ liệu');
    }
  };
  useEffect(() => {
    fetchWarrantyPolicies();
  }, []);

  useEffect(() => {
    document.title = 'Quản lý chính sách bảo hành';
  }, []);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      durationMonths: record.durationMonths,
      price: record.price,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await Policy.deleteWarranties(id);
      message.success('Xóa thành công');
      reloadTable();
    } catch (error) {
      message.error('Lỗi khi xóa');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      if (editingRecord) {
        await Policy.updateWarranties(editingRecord._id, values);
        message.success('Cập nhật thành công');
        setLoading(false);
      } else {
        await Policy.createWarranties(values);
        message.success('Thêm mới thành công');
        setLoading(false);
      }
      setIsModalOpen(false);
      form.resetFields();
      reloadTable();
    } catch (error) {
      message.error('Lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  const reloadTable = async () => {
    setLoading(true);
    try {
      const res = await Policy.getAllWarranties();
      setWarrantyPolicy(res.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error('Lỗi khi tải dữ liệu');
    }
  };
  const handleSearch = (values) => {
    setSearchText(values.search || '');
  };

  const filteredData = warrantyPolicy.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'Tên chính sách',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      render: (text) => (
        <div className="max-w-xs">
          <Text ellipsis={{ tooltip: text }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Thời gian bảo hành',
      dataIndex: 'durationMonths',
      key: 'durationMonths',
      width: '15%',
      render: (months) => <Tag color="blue">{months} tháng</Tag>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: '15%',
      render: (price) => (
        <Text strong color={price > 0 ? 'orange' : 'green'}>
          {price > 0 ? `${formatCurrency(price)} VNĐ` : 'Miễn phí'}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa chính sách bảo hành"
            description="Bạn có chắc chắn muốn xóa chính sách này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger size="small" icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: data.length,
    free: data.filter((item) => item.price === 0).length,
    paid: data.filter((item) => item.price > 0).length,
    avgDuration:
      data.length > 0
        ? Math.round(
            data.reduce((sum, item) => sum + item.durationMonths, 0) /
              data.length,
          )
        : 0,
  };

  return (
    <div className="p-6  min-h-screen">
      <div>
        <div className="mb-6">
          <Title level={2} className="!mb-2">
            <SettingOutlined className="mr-2" />
            Quản lý chính sách bảo hành
          </Title>
          <Text type="secondary">
            Quản lý các chính sách bảo hành cho sản phẩm
          </Text>
        </div>

        {/* <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số chính sách"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Miễn phí"
                value={stats.free}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Có phí"
                value={stats.paid}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Thời gian TB"
                value={stats.avgDuration}
                suffix="tháng"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row> */}

        <Card className="mb-10!">
          <Row gutter={[10, 10]} align="middle">
            <Col flex="auto">
              <Form form={searchForm} onFinish={handleSearch} layout="inline">
                <Form.Item name="search" className="mb-0">
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc mô tả..."
                    prefix={<SearchOutlined />}
                    className="w-80"
                    allowClear
                  />
                </Form.Item>
                <Form.Item className="mb-0">
                  <Button type="primary" htmlType="submit">
                    Tìm kiếm
                  </Button>
                </Form.Item>
              </Form>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={warrantyPolicy}
                  loading={loading}
                >
                  Làm mới
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  Thêm mới
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey="_id"
            pagination={{
              pageSize: 10,
            }}
          />
        </Card>

        {/* Modal */}
        <Modal
          title={
            editingRecord
              ? 'Cập nhật chính sách bảo hành'
              : 'Thêm chính sách bảo hành'
          }
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={600}
        >
          <Divider />
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Tên chính sách"
              rules={[
                { required: true, message: 'Vui lòng nhập tên chính sách!' },
                { min: 2, message: 'Tên chính sách phải có ít nhất 2 ký tự!' },
              ]}
            >
              <Input placeholder="Nhập tên chính sách..." />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập mô tả chính sách..."
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="durationMonths"
                  label="Thời gian bảo hành (tháng)"
                  rules={[
                    {
                      required: true,
                      message: 'Vui lòng nhập thời gian bảo hành!',
                    },
                    {
                      type: 'number',
                      min: 1,
                      max: 120,
                      message: 'Thời gian phải từ 1 đến 120 tháng!',
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập số tháng..."
                    min={1}
                    max={120}
                    className="w-full"
                    addonAfter="tháng"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Giá (VND)"
                  rules={[
                    {
                      type: 'number',
                      min: 0,
                      message: 'Giá phải lớn hơn hoặc bằng 0!',
                    },
                  ]}
                  initialValue={0}
                >
                  <InputNumber
                    placeholder="Nhập giá..."
                    min={0}
                    className="w-full"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    addonAfter="VND"
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="flex justify-end space-x-2 mt-6">
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingRecord ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default WarrantyPolicyManagement;
