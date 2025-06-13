import { useState, useEffect } from "react";
import Products from "@services/products";
import {
  Tag,
  Avatar,
  Tooltip,
  Badge,
  Avatar,
  Select,
  Tooltip,
  Divider,
  Button,
  Image,
  Row,
  Col,
  Statistic,
  Input,
  Typography,
  Flex,
  Empty,
} from "antd";
import {
  TagOutlined,
  WifiOutlined,
  CameraOutlined,
  FilterOutlined,
  MobileOutlined,
  ReloadOutlined,
  TagOutlined,
  WifiOutlined,
  SearchOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import {
  callCreateProduct,
  callDeleteProduct,
  callFetchBrands,
  callFetchCategories,
} from "@/services/apis";
import { useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Option } = Select;

function ListProduct() {
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
    try {
      await Promise.all(selectedRowKeys.map((id) => callDeleteProduct(id)));
      setProducts((prev) =>
        prev.filter((p) => !selectedRowKeys.includes(p._id))
      );
      setSelectedRowKeys([]);
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
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            }}
            fallback="/fallback.jpg"
            preview={false}
          />
          <div>
            <Text
              strong
              style={{ fontSize: 14, display: "block", marginBottom: 4 }}
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
      render: (text) => (
        <Tag
          icon={<BarcodeOutlined />}
          color="processing"
          style={{ margin: 0 }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",
      width: 140,
      render: (text) => (
        <Tag icon={<AppstoreOutlined />} color="default" style={{ margin: 0 }}>
          {text}
        </Tag>
      ),
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
          <Tag color="error" style={{ margin: 0, fontWeight: 500 }}>
            -{discount}%
          </Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
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
          style={{ backgroundColor: "#52c41a" }}
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
        style={{ margin: "16px 0", backgroundColor: "#fafafa" }}
      >
        <Descriptions title="Mô tả sản phẩm" size="small" column={1} bordered>
          <Descriptions.Item label="Mô tả">
            <Text style={{ fontSize: "14px" }}>
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

          <Descriptions.Item label="Kết nối" span={2}>
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
                    size={150}
                    src={variant.images?.[0]}
                    alt={`Variant ${index + 1}`}
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
                      <Text strong style={{ fontSize: 16 }}>
                        {variant.name}
                      </Text>
                      <Tag
                        color="red"
                        style={{ fontSize: 14, padding: "4px 12px" }}
                      >
                        {`${variant.price?.toLocaleString()} VND`}
                      </Tag>

                      {variant.color && (
                        <Space>
                          <Text>Màu:</Text>
                          <Tag color={variant.color.hex}>
                            {variant.color.name}
                          </Tag>
                          <Tag color={variant.color.hex}>
                            {variant.color.hex}
                          </Tag>
                        </Space>
                      )}

                      {variant.memory && (
                        <Space direction="vertical" size={1}>
                          <Text>RAM: {variant.memory.ram}</Text>
                          <Text>Storage: {variant.memory.storage}</Text>
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
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 16,
            padding: "32px",
            marginTop: 24,
            marginBottom: 24,
            color: "white",
          }}
        >
          <Title level={1} style={{ color: "white", margin: 0, fontSize: 32 }}>
            Quản lý sản phẩm
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>
            Quản lý toàn bộ sản phẩm trong hệ thống
          </Text>
        </div>
        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <Statistic
                title="Tổng sản phẩm"
                value={stats.total}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Đang bán"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Ngừng bán"
                value={stats.inactive}
                prefix={<StopOutlined />}
                valueStyle={{ color: "#8c8c8c" }}
              />
            </Col>
            <Col xs={12} sm={6}>
              <Statistic
                title="Có giảm giá"
                value={stats.discounted}
                prefix={<TagOutlined />}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Col>
          </Row>
        </Card>

        <Card style={{ marginBottom: 24, borderRadius: 12 }}>
          <Row gutter={[10, 16]} align="middle">
            <Col xs={24} sm={8} md={4}>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>

            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Danh mục"
                style={{ width: "100%" }}
                allowClear
                value={filters.category}
                onChange={(value) => handleFilterChange("category", value)}
                suffixIcon={<FilterOutlined />}
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
                suffixIcon={<FilterOutlined />}
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
                <Button onClick={handleClearFilters} icon={<ReloadOutlined />}>
                  Xóa bộ lọc
                </Button>
              )}
            </Col>

            <Col xs={24} md={8}>
              <Flex gap={8} wrap="wrap" justify="end">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/product/add")}
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Thêm sản phẩm
                </Button>

                <Button
                  type="primary"
                  onClick={handleEditProduct}
                  disabled={selectedRowKeys.length !== 1}
                  icon={<EditOutlined />}
                >
                  Sửa ({selectedRowKeys.length})
                </Button>

                <Button
                  danger
                  onClick={handleDeleteProducts}
                  disabled={selectedRowKeys.length === 0}
                  icon={<DeleteOutlined />}
                >
                  Xóa ({selectedRowKeys.length})
                </Button>
              </Flex>
            </Col>
          </Row>
        </Card>

        <Card style={{ borderRadius: 12 }}>
          <Spin spinning={loading} size="large">
            {filteredProducts.length === 0 ? (
              <Empty
                description="Không tìm thấy sản phẩm nào"
                style={{ padding: "48px 0" }}
              />
            ) : (
              <Table
                rowKey="_id"
                rowSelection={rowSelection}
                columns={columns}
                dataSource={filteredProducts}
                expandable={{
                  expandedRowRender,
                  rowExpandable: (record) => record._id,
                }}
                pagination={{
                  pageSize: 10,
                }}
                scroll={{ x: 1000 }}
                size="middle"
                style={{
                  backgroundColor: "white",
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
