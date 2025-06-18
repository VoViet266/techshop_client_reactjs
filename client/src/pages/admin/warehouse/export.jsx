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
  Drawer,
  Descriptions,
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
  SearchOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  callExportInventory,
  callFetchBranches,
  callFetchDetailInbound,
  callFetchDetailOutbound,
  callFetchInboundHistory,
  callFetchOutboundHistory,
  callFetchProducts,
  callImportInventory,
} from "@/services/apis";
import Search from "antd/es/transfer/search";
import ModalSearchProduct from "../../../components/admin/warehouse/modalSearchProduct";
import InboundConfirmModal from "@/components/admin/warehouse/InboundConfirmModal";
import InboundForm from "@/components/admin/warehouse/InboundForm";
import InboundSummary from "@/components/admin/warehouse/InboundSummary";
import InboundDetailDrawer from "@/components/admin/warehouse/InboundDetailDrawer";

const { Text } = Typography;

const WarehouseOutbound = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [outboundItems, setOutboundItems] = useState([]);
  const [outboundHistory, setOutboundHistory] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [productSearchVisible, setProductSearchVisible] = useState(false);
  const [selectedOutboundDetail, setSelectedOutboundDetail] = useState(null);
  const [productSearchText, setProductSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await callFetchProducts();
      const productsData = response.data.data.result;
      setProducts(productsData);
      setFilteredProducts(productsData);
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

  const fetchOutboundHistory = async () => {
    try {
      const response = await callFetchOutboundHistory();
      setOutboundHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching outbound history:", error);
      message.error("Không thể tải lịch sử xuất kho");
    }
  };

  const fetchOutboundDetail = async (OutboundId) => {
    setDetailLoading(true);
    try {
      const response = await callFetchDetailOutbound(OutboundId);
      setSelectedOutboundDetail(response.data.data);
      setDetailDrawerVisible(true);
    } catch (error) {
      console.error("Error fetching inbound detail:", error);
      message.error("Không thể tải chi tiết phiếu xuất");
    } finally {
      setDetailLoading(false);
    }
  };

  const loadAllData = async () => {
    setPageLoading(true);
    try {
      await Promise.all([
        fetchProducts(),
        fetchBranches(),
        fetchOutboundHistory(),
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

  //   const handleProductSearch = (value) => {
  //     setProductSearchText(value);
  //     if (!value.trim()) {
  //       setFilteredProducts(products);
  //       return;
  //     }

  //     const filtered = products.filter((product) =>
  //       product.name.toLowerCase().includes(value.toLowerCase())
  //     );
  //     setFilteredProducts(filtered);
  //   };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    console.log("Selected product:", product);
    form.setFieldsValue({
      productId: product._id,
      variantId: undefined,
    });
    setProductSearchVisible(false);
    message.success(`Đã chọn sản phẩm: ${product.name}`);
  };

  const handleAddItem = () => {
    form
      .validateFields(["productId", "variantId", "quantity", "cost"])
      .then((values) => {
        const product = products.find((p) => p._id === values.productId);
        const variant = product.variants.find(
          (v) => v._id === values.variantId
        );
        const existingItem = outboundItems.find(
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
          productCode: product.code,
          variantName: variant.name,
          variantId: values.variantId,
          variantSku: variant.sku,
          quantity: values.quantity,
          cost: values.cost || variant.cost,
          total: values.quantity * (values.cost || variant.cost),
        };

        setOutboundItems([...outboundItems, newItem]);
        form.setFieldsValue({
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
    setInboundItems(outboundItems.filter((item) => item.id !== id));
    message.success("Đã xóa sản phẩm khỏi danh sách");
  };

  const handleUpdateQuantity = (id, quantity) => {
    setOutboundItems(
      outboundItems.map((item) =>
        item.id === id
          ? { ...item, quantity, total: quantity * item.cost }
          : item
      )
    );
  };

  const handleUpdateCost = (id, cost) => {
    setOutboundItems(
      outboundItems.map((item) =>
        item.id === id ? { ...item, cost, total: item.quantity * cost } : item
      )
    );
  };

  const handleSubmitOutbound = () => {
    form
      .validateFields(["branchId"])
      .then((values) => {
        if (outboundItems.length === 0) {
          message.error("Vui lòng thêm ít nhất một sản phẩm");
          return;
        }

        const outboundData = {
          ...values,
          items: outboundItems,
          totalItems: outboundItems.reduce(
            (sum, item) => sum + item.quantity,
            0
          ),
          totalValue: outboundItems.reduce((sum, item) => sum + item.total, 0),
        };

        setPreviewData(outboundData);
        setIsModalVisible(true);
      })
      .catch(() => {
        message.error("Vui lòng chọn chi nhánh");
      });
  };

  const confirmOutbound = async () => {
    setLoading(true);
    try {
      const exportRequests = {};

      outboundItems.forEach((item) => {
        if (!exportRequests[item.productId]) {
          exportRequests[item.productId] = {
            branchId: previewData.branchId,
            productId: item.productId,
            variants: [],
          };
        }
        exportRequests[item.productId].variants.push({
          variantId: String(item.variantId),
          quantity: item.quantity,
          cost: item.cost,
        });
      });

      await Promise.all(
        Object.values(exportRequests).map((data) => callExportInventory(data))
      );

      message.success("Xuất kho thành công!");
      setOutboundItems([]);
      form.resetFields();
      setIsModalVisible(false);
      await fetchOutboundHistory();
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra khi xuất kho");
    } finally {
      setLoading(false);
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
      fixed: "left",
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
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => fetchOutboundDetail}
              loading={detailLoading}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const totalQuantity = outboundItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const totalValue = outboundItems.reduce((sum, item) => sum + item.total, 0);

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
        borderRadius: "8px",
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
            title="Tạo phiếu xuất kho"
            extra={
              <Space>
                <Upload
                  name="file"
                  maxCount={1}
                  accept=".xlsx"
                  showUploadList={false}
                  onChange={() => console.log("Export Excel")}
                  disabled={loading}
                >
                  <Button icon={<UploadOutlined />}>Export Excel</Button>
                </Upload>
              </Space>
            }
          >
            <InboundForm
              form={form}
              branches={branches}
              selectedProduct={selectedProduct}
              setProductSearchVisible={setProductSearchVisible}
              handleAddItem={handleAddItem}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <InboundSummary
            inboundItems={outboundItems}
            totalQuantity={totalQuantity}
            totalValue={totalValue}
            handleSubmitInbound={handleSubmitOutbound}
            loading={loading}
          />

          <Card title="Danh sách sản phẩm" style={{ marginTop: "16px" }}>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {outboundItems.map((item) => (
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
        </Col>
      </Row>

      {outboundItems.length > 0 && (
        <Card title="Chi tiết sản phẩm xuất kho" style={{ marginTop: "24px" }}>
          <Table
            columns={itemColumns}
            dataSource={outboundItems}
            bordered
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </Card>
      )}

      <Card title="Lịch sử xuất kho" style={{ marginTop: "24px" }}>
        <Table
          columns={historyColumns}
          dataSource={outboundHistory}
          rowKey="_id"
          pagination={{
            pageSize: 10,
          }}
        />
      </Card>

      <ModalSearchProduct
        setProductSearchVisible={setProductSearchVisible}
        productSearchVisible={productSearchVisible}
        handleSelectProduct={handleSelectProduct}
        filteredProducts={filteredProducts}
        setFilteredProducts={setFilteredProducts}
        products={products}
        setProducts={setProducts}
      />
      <InboundDetailDrawer
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        selectedInboundDetail={selectedOutboundDetail}
      />
      <InboundConfirmModal
        open={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={confirmOutbound}
        loading={loading}
        previewData={previewData}
        branches={branches}
      />
    </div>
  );
};

export default WarehouseOutbound;
