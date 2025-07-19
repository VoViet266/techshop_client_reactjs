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
  Select,
  DatePicker,
  Switch,
  Progress,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  GiftOutlined,
  PercentageOutlined,
  CalendarOutlined,
  EyeOutlined,
  DollarOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import Policy from '@/services/policy';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PromotionManagement = () => {
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [promotion, setPromotion] = useState(null);

  // Mock data theo schema
  const mockData = [
    {
      _id: '1',
      title: 'Khuyến mãi hè 2024',
      valueType: 'percent',
      value: 20,
      startDate: '2024-06-01T00:00:00Z',
      endDate: '2024-08-31T23:59:59Z',
      conditions: {
        minOrder: 500000,
        payment: 'MOMO',
      },
      isActive: true,
      createdAt: '2024-05-15T10:30:00Z',
      updatedAt: '2024-05-15T10:30:00Z',
    },
    {
      _id: '2',
      title: 'Giảm giá khách hàng mới',
      valueType: 'fixed',
      value: 50000,
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      conditions: {
        minOrder: 200000,
      },
      isActive: true,
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
    },
    {
      _id: '3',
      title: 'Black Friday Sale',
      valueType: 'percent',
      value: 50,
      startDate: '2023-11-24T00:00:00Z',
      endDate: '2023-11-24T23:59:59Z',
      conditions: {
        minOrder: 1000000,
        payment: 'BANK',
      },
      isActive: false,
      createdAt: '2023-11-01T09:00:00Z',
      updatedAt: '2023-11-01T09:00:00Z',
    },
    {
      _id: '4',
      title: 'Khuyến mãi COD',
      valueType: 'fixed',
      value: 30000,
      startDate: '2024-07-01T00:00:00Z',
      endDate: '2024-07-31T23:59:59Z',
      conditions: {
        minOrder: 300000,
        payment: 'COD',
      },
      isActive: true,
      createdAt: '2024-06-25T14:20:00Z',
      updatedAt: '2024-06-25T14:20:00Z',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await Policy.getAllPromotions();
      setPromotion(res.data.data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    form.setFieldsValue({
      title: record.title,
      valueType: record.valueType,
      value: record.value,
      dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
      minOrder: record.conditions?.minOrder || 0,
      payment: record.conditions?.payment || undefined,
      isActive: record.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await Policy.deletePromotions(id);
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
      const formData = {
        title: values.title,
        valueType: values.valueType,
        value: values.value,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        conditions: {
          minOrder: values.minOrder || 0,
          ...(values.payment && { payment: values.payment }),
        },
        isActive: values.isActive,
      };

      if (editingRecord) {
        await Policy.updatePromotions(editingRecord._id, formData);
        message.success('Cập nhật thành công');
      } else {
        await Policy.createPromotions(formData);
        message.success('Thêm mới thành công');
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

  const handleSearch = (values) => {
    setSearchText(values.search || '');
  };

  const getPromotionStatus = (promotion) => {
    if (!promotion.isActive) return 'inactive';
    const now = dayjs();
    const start = dayjs(promotion.startDate);
    const end = dayjs(promotion.endDate);

    if (now.isBefore(start)) return 'upcoming';
    if (now.isAfter(end)) return 'expired';
    return 'active';
  };

  const filteredData = promotion?.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const status = getPromotionStatus(item);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatValue = (valueType, value) => {
    if (valueType === 'percent') {
      return `${value}%`;
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      CASH: 'Tiền mặt',
      MOMO: 'MoMo',
      BANK: 'Chuyển khoản',
      COD: 'Thanh toán khi nhận hàng',
    };
    return methods[method] || method;
  };

  const reloadTable = async () => {
    setLoading(true);
    try {
      const res = await Policy.getAllPromotions();
      setPromotion(res.data.data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };
  const getStatusTag = (promotion) => {
    const status = getPromotionStatus(promotion);
    const configs = {
      active: { color: 'green', text: 'Đang áp dụng' },
      upcoming: { color: 'blue', text: 'Sắp diễn ra' },
      expired: { color: 'red', text: 'Đã hết hạn' },
      inactive: { color: 'gray', text: 'Vô hiệu hóa' },
    };
    const config = configs[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: '20%',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Giá trị',
      key: 'value',
      width: '12%',
      render: (_, record) => (
        <div className="flex items-center">
          <Text strong>{formatValue(record.valueType, record.value)}</Text>
        </div>
      ),
    },
    {
      title: 'Thời gian áp dụng',
      key: 'duration',
      width: '18%',
      render: (_, record) => (
        <div className="text-sm">
          <div>Từ: {dayjs(record.startDate).format('DD/MM/YYYY HH:mm')}</div>
          <div>Đến: {dayjs(record.endDate).format('DD/MM/YYYY HH:mm')}</div>
        </div>
      ),
    },
    {
      title: 'Điều kiện',
      key: 'conditions',
      width: '15%',
      render: (_, record) => (
        <div className="text-sm">
          {record.conditions?.minOrder > 0 && (
            <div>Đơn tối thiểu: {formatPrice(record.conditions.minOrder)}</div>
          )}
          {record.conditions?.payment && (
            <div className="flex items-center mt-1">
              <CreditCardOutlined className="mr-1" />
              {getPaymentMethodLabel(record.conditions.payment)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: '12%',
      render: (_, record) => getStatusTag(record),
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
            title="Xóa khuyến mãi"
            description="Bạn có chắc chắn muốn xóa khuyến mãi này?"
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
    total: promotion?.length,
    active: promotion?.filter((item) => getPromotionStatus(item) === 'active')
      .length,
    upcoming: promotion?.filter(
      (item) => getPromotionStatus(item) === 'upcoming',
    ).length,
    expired: promotion?.filter((item) => getPromotionStatus(item) === 'expired')
      .length,
  };

  return (
    <div className="p-6  min-h-screen">
      <div >
        <div className="mb-6">
          <Title level={2} className="!mb-2">
            <GiftOutlined className="mr-2" />
            Quản lý trường trình khuyến mãi
          </Title>
          <Text type="secondary">
            Quản lý các chương trình khuyến mãi và ưu đãi
          </Text>
        </div>

        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Tổng số khuyến mãi"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đang áp dụng"
                value={stats.active}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Sắp diễn ra"
                value={stats.upcoming}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Đã hết hạn"
                value={stats.expired}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col flex="auto">
              <Space>
                <Form form={searchForm} onFinish={handleSearch} layout="inline">
                  <Form.Item name="search" className="mb-0">
                    <Input
                      placeholder="Tìm kiếm theo tiêu đề..."
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
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-[150px]"
                >
                  <Option value="all">Tất cả</Option>
                  <Option value="active">Đang áp dụng</Option>
                  <Option value="upcoming">Sắp diễn ra</Option>
                  <Option value="expired">Đã hết hạn</Option>
                  <Option value="inactive">Vô hiệu hóa</Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    searchForm.resetFields();
                    setStatusFilter('');
                    setSearchText('');
                    reloadTable();
                  }}
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
          title={editingRecord ? 'Cập nhật khuyến mãi' : 'Thêm khuyến mãi'}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
          width={700}
        >
          <Divider />
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isActive: true,
              valueType: 'percent',
              minOrder: 0,
            }}
          >
            <Form.Item
              name="title"
              label="Tiêu đề khuyến mãi"
              rules={[
                { required: true, message: 'Vui lòng nhập tiêu đề!' },
                { min: 5, message: 'Tiêu đề phải có ít nhất 5 ký tự!' },
              ]}
            >
              <Input placeholder="Nhập tiêu đề khuyến mãi..." />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="valueType"
                  label="Loại giá trị"
                  rules={[
                    { required: true, message: 'Vui lòng chọn loại giá trị!' },
                  ]}
                >
                  <Select placeholder="Chọn loại giá trị">
                    <Option value="percent">Phần trăm (%)</Option>
                    <Option value="fixed">Số tiền cố định (VND)</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="value"
                  label="Giá trị"
                  rules={[
                    { required: true, message: 'Vui lòng nhập giá trị!' },
                    {
                      type: 'number',
                      min: 0,
                      message: 'Giá trị phải lớn hơn 0!',
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập giá trị..."
                    min={0}
                    className="w-full"
                    formatter={(value) =>
                      form.getFieldValue('valueType') === 'percent'
                        ? `${value}`
                        : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                    addonAfter={
                      <Form.Item name="valueType" noStyle>
                        {({ getFieldValue }) =>
                          getFieldValue('valueType') === 'percent' ? '%' : 'VND'
                        }
                      </Form.Item>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="dateRange"
              label="Thời gian áp dụng"
              rules={[
                { required: true, message: 'Vui lòng chọn thời gian áp dụng!' },
              ]}
            >
              <RangePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                className="w-full"
              />
            </Form.Item>

            <Divider orientation="left">Điều kiện áp dụng</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="minOrder"
                  label="Đơn hàng tối thiểu"
                  rules={[
                    {
                      type: 'number',
                      min: 0,
                      message: 'Giá trị phải lớn hơn hoặc bằng 0!',
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập giá trị đơn hàng tối thiểu..."
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
              <Col span={12}>
                <Form.Item name="payment" label="Phương thức thanh toán">
                  <Select
                    placeholder="Chọn phương thức thanh toán (tùy chọn)"
                    allowClear
                  >
                    <Option value="CASH">Tiền mặt</Option>
                    <Option value="MOMO">MoMo</Option>
                    <Option value="BANK">Chuyển khoản</Option>
                    <Option value="COD">Thanh toán khi nhận hàng</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch checkedChildren="Kích hoạt" unCheckedChildren="Tắt" />
            </Form.Item>

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

export default PromotionManagement;
