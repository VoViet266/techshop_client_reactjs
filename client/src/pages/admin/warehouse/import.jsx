import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Modal,
  Tag,
  Avatar,
  Input,
  DatePicker,
  Upload,
  Tooltip,
  Statistic,
  Badge,
  Popconfirm,
  Alert,
  Spin,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  FileExcelOutlined,
  InboxOutlined,
  ProductOutlined,
  ShopOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  EditOutlined,
  EyeOutlined,
  PrinterOutlined,
  UploadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  callFetchBranches,
  callFetchInboundHistory,
  callFetchProducts,
  callImportInventory,
} from "@/services/apis";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const WarehouseInbound = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [inboundItems, setInboundItems] = useState([]);
  const [inboundHistory, setInboundHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await callFetchProducts();
      setProducts(response.data.data.result);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Không thể tải danh sách sản phẩm");
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      message.error("Không thể tải danh sách chi nhánh");
    }
  };

  const fetchInboundHistory = async () => {
    try {
      const response = await callFetchInboundHistory();
      setInboundHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching inbound history:", error);
      message.error("Không thể tải lịch sử nhập kho");
    }
  };

  const loadAllData = async () => {
    setPageLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchBranches(),
        fetchInboundHistory(),
      ]);
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleProductChange = (productId) => {
    const product = products.find((p) => p._id === productId);
    setSelectedProduct(product);
    form.setFieldsValue({ variantId: undefined });
  };

  const handleAddItem = () => {
    form
      .validateFields(["productId", "variantId", "quantity", "cost"])
      .then((values) => {
        const product = products.find((p) => p._id === values.productId);
        const variant = product.variants.find(
          (v) => v._id === values.variantId
        );
        const existingItem = inboundItems.find(
          (item) =>
            item.productId === values.productId &&
            item.variantId === values.variantId
        );

        if (existingItem) {
          message.warning(
            "Sản phẩm này đã có trong danh sách. Vui lòng chỉnh sửa số lượng."
          );
          return;
        }

        const newItem = {
          id: Date.now(),
          productId: values.productId,
          branchId: values.branchId,
          productName: product.name,
          variantName: variant.name,
          variantId: values.variantId,
          quantity: values.quantity,
          cost: values.cost || variant.cost,
          total: values.quantity * variant.cost,
        };

        setInboundItems([...inboundItems, newItem]);
        form.setFieldsValue({
          branchId: undefined,
          productId: undefined,
          variantId: undefined,
          quantity: undefined,
          cost: undefined,
        });
        setSelectedProduct(null);
        message.success("Đã thêm sản phẩm vào danh sách nhập kho");
      })
      .catch((errorInfo) => {
        message.error("Vui lòng điền đầy đủ thông tin");
      });
  };

  const handleRemoveItem = (id) => {
    setInboundItems(inboundItems.filter((item) => item.id !== id));
    message.success("Đã xóa sản phẩm khỏi danh sách");
  };

  const handleUpdateQuantity = (id, quantity) => {
    setInboundItems(
      inboundItems.map((item) =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.cost }
          : item
      )
    );
  };

  const handleUpdateCost = (id, cost) => {
    setInboundItems(
      inboundItems.map((item) =>
        item.id === id ? { ...item, cost, total: item.quantity * cost } : item
      )
    );
  };

  const handleSubmitInbound = () => {
    form
      .validateFields(["branchId"])
      .then((values) => {
        const inboundData = {
          ...values,
          items: inboundItems,
          totalItems: inboundItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          totalValue: inboundItems.reduce((sum, item) => sum + item.total, 0),
        };

        setPreviewData(inboundData);
        setIsModalVisible(true);
      })
      .catch(() => {
        message.error("Vui lòng chọn chi nhánh");
      });
  };

  const confirmInbound = async () => {
    try {
      const importRequests = {};

      inboundItems.forEach((item) => {
        if (!importRequests[item.productId]) {
          importRequests[item.productId] = {
            branchId: previewData.branchId,
            productId: item.productId,
            variants: [],
          };
        }
        importRequests[item.productId].variants.push({
          variantId: String(item.variantId),
          quantity: item.quantity,
          cost: item.cost,
        });
      });
      await Promise.all(
        Object.values(importRequests).map((data) => callImportInventory(data))
      );
      message.success("Nhập kho thành công!");
      setInboundItems([]);
      form.resetFields();
      setIsModalVisible(false);
      await fetchInboundHistory();
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi nhập kho");
    }
  };

  const itemColumns = [
    {
      title: "Sản phẩm",
      key: "product",
      width: 300,
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<ProductOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          />
          <div>
            <Text strong>{record.productName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.productCode}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Biến thể",
      key: "variant",
      width: 200,
      render: (_, record) => (
        <div>
          <Tag color="blue">{record.variantName}</Tag>
          <br />
          <Text type="secondary" style={{ fontSize: "11px" }}>
            SKU: {record.variantSku}
          </Text>
        </div>
      ),
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleUpdateQuantity(record.id, value)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Giá vốn",
      key: "cost",
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.cost}
          onChange={(value) => handleUpdateCost(record.id, value)}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
          addonAfter="₫"
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      width: 150,
      render: (_, record) => (
        <Text strong style={{ color: "#fa8c16" }}>
          {record.total.toLocaleString("vi-VN")} ₫
        </Text>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa sản phẩm này?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const historyColumns = [
    {
      title: "Mã phiếu nhập",
      dataIndex: "_id",
      key: "code",
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <Text strong copyable={{ text: text }}>
            {text.slice(-8)}
          </Text>
        </Tooltip>
      ),
    },

    {
      title: "Sản phẩm",
      key: "product",
      width: 200,
      render: (_, record) => (
        <Space>
          <ProductOutlined style={{ color: "#1890ff" }} />
          <Text ellipsis>{record.productId?.name}</Text>
        </Space>
      ),
    },
    {
      title: "Chi nhánh",
      key: "branch",
      width: 200,
      render: (_, record) => (
        <Space>
          <ShopOutlined style={{ color: "#52c41a" }} />
          <Text ellipsis>{record.branchId?.name}</Text>
        </Space>
      ),
    },

    {
      title: "Số lượng",
      key: "totalItems",
      width: 100,
      align: "center",
      render: (_, record) => {
        const total =
          record.variants?.reduce((sum, v) => sum + v.quantity, 0) || 0;
        return <Badge count={total} style={{ backgroundColor: "#52c41a" }} />;
      },
    },
    {
      title: "Ngày nhập",
      dataIndex: "createdAt",
      key: "date",
      width: 150,
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text ellipsis>{new Date(date).toLocaleDateString("vi-VN")}</Text>
        </Space>
      ),
    },
    {
      title: "Người tạo",
      key: "createdBy",
      width: 150,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <Text ellipsis>{record.createdBy?.name}</Text>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="text" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="In phiếu">
            <Button type="text" icon={<PrinterOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const totalQuantity = inboundItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = inboundItems.reduce((sum, item) => sum + item.total, 0);

  if (pageLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <Row justify="space-between" align="middle">
          <div></div>
          <Col>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadAllData}
              loading={pageLoading}
            >
              Làm mới
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          <Card
            title="Tạo phiếu nhập kho"
            extra={
              <Space>
                <Upload
                  name="file"
                  maxCount={1}
                  accept=".xlsx"
                  showUploadList={false}
                  // beforeUpload={handleImportExcel}
                  onChange={() => console.log("Đếu có dì hết")}
                  disabled={loading}
                >
                  <Button icon={<UploadOutlined />}>Import Excel</Button>
                </Upload>
              </Space>
            }
          >
            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="branchId"
                    label="Chi nhánh"
                    rules={[
                      { required: true, message: "Vui lòng chọn chi nhánh" },
                    ]}
                  >
                    <Select placeholder="Chọn chi nhánh">
                      {branches.map((branch) => (
                        <Option key={branch._id} value={branch._id}>
                          {branch.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="productId"
                    label="Sản phẩm"
                    rules={[
                      { required: true, message: "Vui lòng chọn sản phẩm" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn sản phẩm"
                      onChange={handleProductChange}
                      showSearch
                      filterOption={(input, option) =>
                        option.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {products.map((product) => (
                        <Option key={product._id} value={product._id}>
                          {product.name} ({product.code})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="variantId"
                    label="Biến thể"
                    rules={[
                      { required: true, message: "Vui lòng chọn biến thể" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn biến thể"
                      disabled={!selectedProduct}
                    >
                      {selectedProduct?.variants.map((variant) => (
                        <Option key={variant._id} value={variant._id}>
                          {variant.name} (Tồn: {variant.stock})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={7}>
                  <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={[
                      { required: true, message: "Vui lòng nhập số lượng" },
                      {
                        type: "number",
                        min: 1,
                        message: "Số lượng phải lớn hơn 0",
                      },
                    ]}
                  >
                    <InputNumber
                      placeholder="Nhập số lượng"
                      style={{ width: "100%" }}
                      min={1}
                    />
                  </Form.Item>
                </Col>
                <Col span={9}>
                  <Form.Item name="cost" label="Giá vốn (tùy chọn)">
                    <InputNumber
                      placeholder="Để trống sẽ dùng giá mặc định"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      addonAfter="₫"
                      style={{ width: "100%" }}
                      min={0}
                    />
                  </Form.Item>
                </Col>
                <Col span={8} style={{ display: "flex", alignItems: "end" }}>
                  <Form.Item>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddItem}
                      style={{ width: "100%" }}
                    >
                      Thêm
                    </Button>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="note" label="Ghi chú">
                <TextArea placeholder="Ghi chú về phiếu nhập kho..." rows={3} />
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="Tóm tắt phiếu nhập">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Row justify="space-between">
                <Text>Tổng sản phẩm:</Text>
                <Text strong>{inboundItems.length}</Text>
              </Row>
              <Row justify="space-between">
                <Text>Tổng số lượng:</Text>
                <Badge
                  count={totalQuantity}
                  style={{ backgroundColor: "#52c41a" }}
                />
              </Row>
              <Row justify="space-between">
                <Text>Tổng giá trị:</Text>
                <Text strong style={{ color: "#fa8c16" }}>
                  {totalValue.toLocaleString("vi-VN")} ₫
                </Text>
              </Row>
              <Divider />
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={handleSubmitInbound}
                disabled={inboundItems.length === 0}
                style={{ width: "100%" }}
                loading={loading}
              >
                Xác nhận nhập kho
              </Button>
            </Space>
          </Card>

          {inboundItems.length > 0 && (
            <Card title="Danh sách sản phẩm" style={{ marginTop: "16px" }}>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {inboundItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "8px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "4px",
                      marginBottom: "8px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <Row justify="space-between" align="middle">
                      <Col span={18}>
                        <Text strong style={{ fontSize: "12px" }}>
                          {item.productName}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          {item.variantName} × {item.quantity}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: "10px" }}>
                          SKU: {item.variantSku}
                        </Text>
                      </Col>
                      <Col span={6} style={{ textAlign: "right" }}>
                        <Text style={{ fontSize: "11px", color: "#fa8c16" }}>
                          {item.total.toLocaleString("vi-VN")}₫
                        </Text>
                        <br />
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveItem(item.id)}
                        />
                      </Col>
                    </Row>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {inboundItems.length > 0 && (
        <Card title="Chi tiết sản phẩm nhập kho" style={{ marginTop: "24px" }}>
          <Table
            columns={itemColumns}
            dataSource={inboundItems}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      )}

      <Card title="Lịch sử nhập kho" style={{ marginTop: "24px" }}>
        <Table
          columns={historyColumns}
          dataSource={inboundHistory}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="Xác nhận phiếu nhập kho"
        open={isModalVisible}
        onOk={confirmInbound}
        onCancel={() => setIsModalVisible(false)}
        okText="Xác nhận nhập kho"
        cancelText="Hủy"
        confirmLoading={loading}
        width={600}
      >
        {previewData && (
          <div>
            <Alert
              message="Vui lòng kiểm tra thông tin trước khi xác nhận"
              type="info"
              style={{ marginBottom: "16px" }}
            />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Chi nhánh:</Text>
                <br />
                <Text>
                  {branches.find((b) => b.id === previewData.branchId)?.name}
                </Text>
              </Col>
              {/* <Col span={12}>
                <Text strong>Nhà cung cấp:</Text>
                <br />
                <Text>
                  {suppliers.find((s) => s.id === previewData.supplierId)?.name}
                </Text>
              </Col> */}
              <Col span={12}>
                <Text strong>Tổng sản phẩm:</Text>
                <br />
                <Text>{previewData.items.length}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Tổng số lượng:</Text>
                <br />
                <Text>{previewData.totalItems}</Text>
              </Col>
              <Col span={24}>
                <Text strong>Tổng giá trị:</Text>
                <br />
                <Text style={{ fontSize: "18px", color: "#fa8c16" }}>
                  {previewData.totalValue.toLocaleString("vi-VN")} ₫
                </Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WarehouseInbound;
