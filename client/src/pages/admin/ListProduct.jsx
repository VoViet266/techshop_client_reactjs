import {
  Tag,
  Card,
  Spin,
  Space,
  Table,
  Badge,
  Avatar,
  Select,
  Tooltip,
  Divider,
  Descriptions,
} from "antd";

import {
  TagOutlined,
  WifiOutlined,
  CameraOutlined,
  FilterOutlined,
  MobileOutlined,
} from "@ant-design/icons";

import { Typography } from "antd";
import Products from "@services/products";
import { useState, useEffect } from "react";
import { callFetchBrands, callFetchCategories } from "@/services/apis";

const { Text } = Typography;

function ListProduct() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    category: null,
    brand: null,
  });
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await Products.getAll();
        setProducts(products);
      } catch (error) {
        console.error("Failed to fetch products:", error.message);
        setLoading(false);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await callFetchCategories();
        setCategories(response.data.data.result);
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    };

    const fetchBrands = async () => {
      try {
        const response = await callFetchBrands();
        setBrands(response.data.data.result);
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

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      sorter: true,
      render: (text, record) => (
        <Space>
          <Avatar
            size="large"
            icon={<MobileOutlined />}
            style={{ backgroundColor: "#87d068" }}
          />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: "Thương hiệu",
      dataIndex: ["brand", "name"],
      key: "brand",

      render: (text) => (
        <Tooltip title={text}>
          <Tag icon={<TagOutlined />} color="green">
            {text}
          </Tag>
        </Tooltip>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: ["category", "name"],
      key: "category",

      render: (text) => (
        <Tag icon={<TagOutlined />} color="blue">
          {text}
        </Tag>
      ),
    },
    {
      title: "Giảm giá",
      dataIndex: "discount",
      key: "discount",
      align: "center",
      render: (discount) =>
        discount ? (
          <Badge
            count={discount}
            style={{
              backgroundColor: "#f50",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          />
        ) : (
          <Text type="secondary">-</Text>
        ),
    },

    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Badge
          status={status === "active" ? "success" : "default"}
          text={status === "active" ? "Hoạt động" : "Ngừng bán"}
        />
      ),
    },
  ];
  const handleFilterChange = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ category: null, brand: null });
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
                <CameraOutlined /> {record.camera?.rear?.resolution}
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
      </Card>
    );
  };
  return (
    <>
      <div style={{ marginBottom: "24px" }}>
        <Typography.Title
          level={2}
          style={{
            margin: 0,
            fontSize: "28px",
            color: "#333",
            fontWeight: 700,
          }}
        >
          Danh sách sản phẩm
        </Typography.Title>
      </div>
      <div className="filter-section" style={{ marginBottom: "16px" }}>
        <Space wrap>
          <Select
            placeholder="Select Category"
            style={{ width: 200 }}
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
          <Select
            placeholder="Select Brand"
            style={{ width: 200 }}
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

          {(filters.category || filters.brand) && (
            <Button onClick={handleClearFilters} icon={<ReloadOutlined />}>
              Clear Filters
            </Button>
          )}
        </Space>
      </div>
      <Divider style={{ margin: "16px 0" }} />
      <Spin spinning={loading} size="large">
        <Table
          columns={columns}
          dataSource={products.length > 0 ? products : []}
          expandable={{
            expandedRowRender,
            rowExpandable: () => true,
          }}
          pagination={{
            pageSize: 10,
          }}
          scroll={{ x: 1200 }}
          size="middle"
          rowClassName={(_, index) =>
            index % 2 === 0 ? "row-even" : "row-odd"
          }
        />
      </Spin>
    </>
  );
}
export default ListProduct;
