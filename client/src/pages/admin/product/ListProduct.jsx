import { useState, useEffect } from "react";
import Products from "@services/products";
import {
  Tag,
  Select,
  Button,
  Image,
  Row,
  Col,
  Modal,
  Statistic,
  Input,
  Typography,
  Flex,
  Empty,
  Card,
  Descriptions,
  Space,
  Spin,
  Table,
  Badge,
  Avatar,
} from "antd";
import {
  TagOutlined,
  WifiOutlined,
  CameraOutlined,
  FilterOutlined,
  MobileOutlined,
  ReloadOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import {
  callDeleteProduct,
  callFetchBrands,
  callFetchCategories,
} from "@/services/apis";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;

function ListProduct() {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState("Bạn có chắc chắn muốn xóa?");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    category: null,
    brand: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await Products.getAll();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch products:", error.message);
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await callFetchCategories();
        setCategories(response.data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    };

    const fetchBrands = async () => {
      try {
        const response = await callFetchBrands();
        setBrands(response.data.data);
      } catch (error) {
        console.error("Error fetching brands:", error);
        throw error;
      }
    };

    fetchProducts();
    fetchCategories();
    fetchBrands();
    setLoading(false);
  }, []);

  const handleDeleteProducts = async () => {
    setModalText("The modal will be closed after two seconds");
    setConfirmLoading(true);
    try {
      await Promise.all(selectedRowKeys.map((id) => callDeleteProduct(id)));
      setProducts((prev) =>
        prev.filter((p) => !selectedRowKeys.includes(p._id))
      );
      setSelectedRowKeys([]);
      setOpen(false);
      setConfirmLoading(false);
    } catch (error) {
      console.error("Xóa sản phẩm thất bại", error);
    }
  };

  const handleEditProduct = () => {
    const productToEdit = selectedRows[0];
    console.log("Sửa sản phẩm:", productToEdit._id);

    navigate(`/product/edit/${productToEdit._id}`);
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ category: null, brand: null });
    setSearchText("");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesCategory =
      !filters.category || product.category?.name === filters.category;
    const matchesBrand =
      !filters.brand || product.brand?.name === filters.brand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    inactive: products.filter((p) => p.status !== "active").length,
    discounted: products.filter((p) => p.discount > 0).length,
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 280,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <Space size={12}>
          <Image
            src={record.variants?.[0]?.images?.[0]}
            height={60}
            width={60}
            style={{
              objectFit: "cover",
              borderRadius: 12,
              border: `2px solid #E2E8F0"`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            fallback="/fallback.jpg"
            preview={false}
          />
          <div>
            <Text
              strong
              style={{
                fontSize: 14,
                display: "block",
                marginBottom: 4,
                color: "#0F172A",
              }}
            >
              {text}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Thương hiệu",
      dataIndex: ["brand", "name"],
      key: "brand",
      width: 140,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
      width: 140,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      width: 100,
      align: "center",
      sorter: (a, b) => (a.discount || 0) - (b.discount || 0),
      render: (discount) =>
        discount ? (
          <Tag
            style={{
              margin: 0,
              fontWeight: 600,
              backgroundColor: "#EF4444",
              color: "#FEFEFE",
              border: "none",
              borderRadius: 6,
            }}
          >
            -{discount}%
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: 12, color: "#94A3B8" }}>
            —
          </Text>
        ),
    },
    {
      title: "Phiên bản",
      key: "variants",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Badge
          count={record.variants?.length || 0}
          style={{ backgroundColor: "#8B5CF6" }}
        />
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status) => (
        <Badge
          status={status === "active" ? "success" : "default"}
          text={status === "active" ? "Hoạt động" : "Ngừng bán"}
          style={{
            color: status === "active" ? "#8B5CF6" : "#94A3B8",
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

  const expandedRowRender = (record) => {
    return (
      <Card
        size="small"
        style={{
          margin: "16px 0",
          backgroundColor: "#F8FAFC",
          border: `1px solid #E2E8F0"`,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <Descriptions title="Mô tả sản phẩm" size="small" column={1} bordered>
          <Descriptions.Item label="Mô tả">
            <Text style={{ fontSize: "14px", color: "#475569" }}>
              {record.description || "Chưa có mô tả cho sản phẩm này."}
            </Text>
          </Descriptions.Item>
        </Descriptions>
        <Descriptions title="Chi tiết kỹ thuật" size="small" bordered>
          <Descriptions.Item label="Màn hình" span={1}>
            <Space>
              {record.specifications?.displaySize}{" "}
              {record.specifications?.displayStyle}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Chip xử lý" span={1}>
            <Space>{record.specifications?.processor}</Space>
          </Descriptions.Item>

          <Descriptions.Item label="Hệ điều hành" span={1}>
            {record.specifications?.operatingSystem}
          </Descriptions.Item>

          <Descriptions.Item label="Pin" span={1}>
            <Space>{record.specifications?.battery}</Space>
          </Descriptions.Item>

          <Descriptions.Item label="Trọng lượng" span={1}>
            {record.specifications?.weight}
          </Descriptions.Item>

          <Descriptions.Item label="Kết nối" span={3}>
            <Space wrap>
              <Tag icon={<WifiOutlined />} color="blue">
                {record.connectivity?.wifi}
              </Tag>
              <Tag color="green">
                Bluetooth {record.connectivity?.bluetooth}
              </Tag>
              <Tag color="red">{record.connectivity?.cellular}</Tag>
              {record.connectivity?.nfc === "Yes" && (
                <Tag color="orange">NFC</Tag>
              )}
              {record.connectivity?.gps === "Yes" && (
                <Tag color="purple">GPS</Tag>
              )}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Camera trước" span={2}>
            <Space direction="vertical" size="small">
              <Text strong>
                <CameraOutlined /> {record.camera?.front?.resolution}
              </Text>
              <div>
                <Text type="secondary">Tính năng: </Text>
                {record.camera?.front?.features?.map((feature, index) => (
                  <Tag key={index} size="small">
                    {feature}
                  </Tag>
                ))}
              </div>
              <div>
                <Text type="secondary">Video: </Text>
                {record.camera?.front?.videoRecording?.map((video, index) => (
                  <Tag key={index} size="small" color="volcano">
                    {video}
                  </Tag>
                ))}
              </div>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Camera sau" span={2}>
            <Space direction="vertical" size="small">
              <Text strong>
                <CameraOutlined />
                {record.camera?.rear?.resolution}
              </Text>
              <div>
                <Text type="secondary">Tính năng: </Text>
                {record.camera?.rear?.features?.map((feature, index) => (
                  <Tag key={index} size="small">
                    {feature}
                  </Tag>
                ))}
              </div>

              <div>
                <Text type="secondary">Video: </Text>
                {record.camera?.rear?.videoRecording?.map((video, index) => (
                  <Tag key={index} size="small" color="volcano">
                    {video}
                  </Tag>
                ))}
              </div>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Cổng kết nối" span={1}>
            <Space wrap>
              {record.connectivity?.ports?.map((port, index) => (
                <Tag key={index} color="geekblue">
                  {port}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
        {record.variants?.length > 0 && (
          <Descriptions title="Các phiên bản" size="small" bordered column={1}>
            {record.variants.map((variant, index) => (
              <Descriptions.Item
                key={index}
                label={
                  <Avatar
                    shape="square"
                    size={160}
                    src={variant.images?.[0]}
                    alt={`Variant ${index + 1}`}
                    style={{
                      borderRadius: 12,
                      border: `2px solid #E2E8F0"`,
                    }}
                  />
                }
                labelStyle={{
                  width: 100,
                  padding: 20,
                  textAlign: "center",
                }}
              >
                <Space size="large" align="start">
                  <div>
                    <Space direction="vertical" size="small">
                      <Text strong style={{ fontSize: 16, color: "#0F172A" }}>
                        {variant.name}
                      </Text>
                      <Tag
                        style={{
                          fontSize: 14,
                          padding: "4px 12px",
                          backgroundColor: "#EF4444",
                          color: "#FEFEFE",
                          border: "none",
                          borderRadius: 6,
                          fontWeight: 600,
                        }}
                      >
                        {`${variant.price?.toLocaleString()} VND`}
                      </Tag>

                      {variant.color && (
                        <Space>
                          <Text>Màu:</Text>
                          <Tag
                            style={{
                              backgroundColor: variant.color.hex,
                              color: "#FEFEFE",
                              border: "none",
                              borderRadius: 6,
                            }}
                          >
                            {variant.color.name}
                          </Tag>
                          <Tag
                            style={{
                              backgroundColor: "#F1F5F9",
                              color: "#0F172A",
                              border: `1px solid "#CBD5E1"`,
                              borderRadius: 6,
                            }}
                          >
                            {variant.color.hex}
                          </Tag>
                        </Space>
                      )}

                      {variant.memory && (
                        <Space direction="vertical" size={1}>
                          <Text style={{ color: "#475569" }}>
                            RAM: {variant.memory.ram}
                          </Text>
                          <Text style={{ color: "#475569" }}>
                            Storage: {variant.memory.storage}
                          </Text>
                        </Space>
                      )}
                    </Space>
                  </div>
                </Space>
              </Descriptions.Item>
            ))}
          </Descriptions>
        )}
      </Card>
    );
  };

  return (
    <div>
      <div
        style={{
          padding: "24px",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          borderRadius: "8px",
        }}
      >
        <Modal
          title="Xác nhận"
          open={open}
          onOk={handleDeleteProducts}
          okText="Xóa"
          confirmLoading={confirmLoading}
          onCancel={() => setOpen(false)}
          okButtonProps={{
            style: {
              backgroundColor: "#EF4444",
              borderColor: "#EF4444",
            },
          }}
        >
          <p>{modalText}</p>
        </Modal>

        <Row gutter={16} style={{ marginBottom: "24px" }}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title={<span style={{ color: "#475569" }}>Tổng sản phẩm</span>}
                value={stats.total}
                prefix={<AppstoreOutlined style={{ color: "#4F46E5" }} />}
                valueStyle={{ color: "#4F46E5", fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title={<span style={{ color: "#475569" }}>Đang bán</span>}
                value={stats.active}
                prefix={<CheckCircleOutlined style={{ color: "#8B5CF6" }} />}
                valueStyle={{ color: "#8B5CF6", fontWeight: 600 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title={<span style={{ color: "#475569" }}>Ngừng bán</span>}
                value={stats.inactive}
                prefix={<StopOutlined style={{ color: "#94A3B8" }} />}
                valueStyle={{
                  color: "#94A3B8",
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic
                title={<span style={{ color: "#475569" }}>Có giảm giá</span>}
                value={stats.discounted}
                prefix={<TagOutlined style={{ color: "#EF4444" }} />}
                valueStyle={{ color: "#EF4444", fontWeight: 600 }}
              />
            </Card>
          </Col>
        </Row>

        <Card
          style={{
            marginBottom: 24,
            borderRadius: 16,
            border: `1px solid #E2E8F0"`,
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Row gutter={[10, 16]} align="middle">
            <Col xs={24} sm={8} md={4}>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{
                  borderRadius: 8,
                  border: `1px solid "#CBD5E1"`,
                }}
              />
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Danh mục"
                style={{ width: "100%" }}
                allowClear
                value={filters.category}
                onChange={(value) => handleFilterChange("category", value)}
                suffixIcon={<FilterOutlined style={{ color: "#94A3B8" }} />}
              >
                {categories?.map((category) => (
                  <Option key={category._id} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Thương hiệu"
                style={{ width: "100%" }}
                allowClear
                value={filters.brand}
                onChange={(value) => handleFilterChange("brand", value)}
                suffixIcon={<FilterOutlined style={{ color: "#94A3B8" }} />}
              >
                {brands?.map((brand) => (
                  <Option key={brand._id} value={brand.name}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
              {(filters.category || filters.brand || searchText) && (
                <Button
                  onClick={handleClearFilters}
                  icon={<ReloadOutlined />}
                  style={{
                    borderColor: "#94A3B8",
                    color: "#475569",
                    borderRadius: 8,
                  }}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </Col>

            <Col xs={24} md={8}>
              <Flex gap={8} wrap="nowrap" justify="end">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/product/add")}
                  style={{
                    backgroundColor: "rgb(11, 162, 36)",
                    borderRadius: 8,
                    fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
                  }}
                >
                  Thêm sản phẩm
                </Button>

                <Button
                  type="primary"
                  onClick={handleEditProduct}
                  disabled={selectedRowKeys.length !== 1}
                  icon={<EditOutlined />}
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,
                    boxShadow:
                      selectedRowKeys.length === 1
                        ? "0 2px 8px rgba(79, 70, 229, 0.2)"
                        : "none",
                  }}
                >
                  Sửa ({selectedRowKeys.length})
                </Button>

                <Button
                  danger
                  onClick={() => setOpen(true)}
                  disabled={selectedRowKeys.length === 0}
                  icon={<DeleteOutlined />}
                  style={{
                    borderRadius: 8,
                    fontWeight: 500,

                    borderColor:
                      selectedRowKeys.length > 0 ? "#EF4444" : undefined,
                    boxShadow:
                      selectedRowKeys.length > 0
                        ? "0 2px 8px rgba(239, 68, 68, 0.2)"
                        : "none",
                  }}
                >
                  Xóa ({selectedRowKeys.length})
                </Button>
              </Flex>
            </Col>
          </Row>
        </Card>
        <Card
          style={{
            borderRadius: 16,
            border: `1px solid #E2E8F0"`,
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
          }}
        >
          <Spin spinning={loading} size="large">
            {filteredProducts.length === 0 ? (
              <Empty
                description={
                  <span style={{ color: "#475569" }}>
                    Không tìm thấy sản phẩm nào
                  </span>
                }
                style={{ padding: "48px 0" }}
              />
            ) : (
              <Table
                rowKey="_id"
                rowSelection={rowSelection}
                columns={columns}
                bordered
                dataSource={filteredProducts}
                expandable={{
                  expandedRowRender,
                  expandIcon: ({ expanded, onExpand, record }) => (
                    <Button
                      type="text"
                      size="small"
                      icon={
                        expanded ? <EyeInvisibleOutlined /> : <EyeOutlined />
                      }
                      onClick={(e) => onExpand(record, e)}
                    />
                  ),
                  rowExpandable: (record) => record._id,
                }}
                pagination={{
                  pageSize: 10,
                }}
                scroll={{ x: 1000 }}
                size="middle"
                style={{
                  backgroundColor: "#FEFEFE",
                }}
              />
            )}
          </Spin>
        </Card>
      </div>
    </div>
  );
}

export default ListProduct;
