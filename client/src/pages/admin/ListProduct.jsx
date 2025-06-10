import { useState, useEffect } from "react";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
import Products from "@services/products";
import {
  Card,
  Descriptions,
  Space,
  Spin,
  Table,
  Tag,
  // ADDED MISSING IMPORTS HERE
  Avatar,
  Tooltip,
  Badge,
  Select,
  Divider,
} from "antd";
import { Typography } from "antd";
import {
  CameraOutlined,
  FilterOutlined,
  MobileOutlined,
  TagOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { callFetchBrands, callFetchCategories } from "@/services/apis";

const { Text } = Typography; // Destructure Text from Typography

// Example data row (replace with real data as needed)
const data = [
  {
    key: "1", // Added unique key for stable rendering
    name: "Product 1",
    description:
      "A great product that offers excellent performance and features for its price range. It's designed for everyday use with a focus on user experience and durability.",
    discount: "10%",
    category: { name: "Electronics" }, // Changed to object to match dataIndex ["category", "name"]
    brand: { name: "BrandX" }, // Changed to object to match dataIndex ["brand", "name"]
    specifications: {
      // Grouped specifications
      displaySize: '6.5"',
      displayStyle: "AMOLED",
      processor: "Snapdragon 888",
      operatingSystem: "Android 12",
      battery: "4500mAh",
      weight: "180g",
    },
    connectivity: {
      // Grouped connectivity
      wifi: "802.11ac",
      bluetooth: "5.2",
      cellular: "5G",
      nfc: "Yes",
      gps: "Yes",
      ports: ["USB-C", "3.5mm Jack"],
    },
    camera: {
      // Grouped camera details
      front: {
        resolution: ["32MP"],
        features: ["HDR", "Portrait Mode"],
        videoRecording: ["4K@30fps"],
      },
      rear: {
        resolution: ["64MP", "12MP"],
        features: ["OIS", "Night Mode", "Ultrawide"],
        videoRecording: ["8K@30fps", "4K@60fps"],
      },
    },
    status: "active",
  },
  {
    key: "2",
    name: "Product 2",
    description:
      "Another excellent product with advanced features and a sleek design, perfect for tech enthusiasts looking for top-tier performance.",
    discount: "15%",
    category: { name: "Electronics" },
    brand: { name: "BrandY" },
    specifications: {
      displaySize: '6.1"',
      displayStyle: "OLED",
      processor: "A15 Bionic",
      operatingSystem: "iOS 16",
      battery: "3200mAh",
      weight: "170g",
    },
    connectivity: {
      wifi: "802.11ax",
      bluetooth: "5.3",
      cellular: "5G",
      nfc: "Yes",
      gps: "Yes",
      ports: ["Lightning"],
    },
    camera: {
      front: {
        resolution: ["12MP"],
        features: ["Face ID", "Cinematic Mode"],
        videoRecording: ["4K@60fps"],
      },
      rear: {
        resolution: ["48MP", "12MP", "12MP"],
        features: ["ProRes Video", "Photonic Engine"],
        videoRecording: ["4K@60fps", "1080p@240fps"],
      },
    },
    status: "active",
  },
  {
    key: "3",
    name: "Product 3",
    description:
      "A budget-friendly option that doesn't compromise on essential features, offering great value for money.",
    discount: null, // No discount
    category: { name: "Electronics" },
    brand: { name: "BrandZ" },
    specifications: {
      displaySize: '6.7"',
      displayStyle: "IPS LCD",
      processor: "MediaTek Helio G99",
      operatingSystem: "Android 13",
      battery: "5000mAh",
      weight: "200g",
    },
    connectivity: {
      wifi: "802.11n",
      bluetooth: "5.0",
      cellular: "4G LTE",
      nfc: "No",
      gps: "Yes",
      ports: ["USB-C"],
    },
    camera: {
      front: {
        resolution: ["8MP"],
        features: ["Beauty Mode"],
        videoRecording: ["1080p@30fps"],
      },
      rear: {
        resolution: ["50MP", "2MP"],
        features: ["Macro", "Depth Sensor"],
        videoRecording: ["1080p@30fps"],
      },
    },
    status: "inactive",
  },
  {
    key: "4",
    name: "Product 4",
    description:
      "High-end product designed for professionals, with superior build quality and cutting-edge technology.",
    discount: "5%",
    category: { name: "Electronics" },
    brand: { name: "BrandA" },
    specifications: {
      displaySize: '6.8"',
      displayStyle: "Dynamic AMOLED 2X",
      processor: "Snapdragon 8 Gen 2",
      operatingSystem: "Android 14",
      battery: "5000mAh",
      weight: "230g",
    },
    connectivity: {
      wifi: "802.11be",
      bluetooth: "5.4",
      cellular: "5G",
      nfc: "Yes",
      gps: "Yes",
      ports: ["USB-C (Thunderbolt)"],
    },
    camera: {
      front: {
        resolution: ["40MP"],
        features: ["Autofocus", "Dual Pixel AF"],
        videoRecording: ["4K@60fps"],
      },
      rear: {
        resolution: ["200MP", "12MP", "10MP", "10MP"],
        features: ["Space Zoom", "Expert RAW"],
        videoRecording: ["8K@30fps", "4K@120fps"],
      },
    },
    status: "active",
  },
  {
    key: "5",
    name: "Product 5",
    description:
      "Compact and powerful, ideal for users who prefer a smaller form factor without sacrificing performance.",
    discount: "8%",
    category: { name: "Electronics" },
    brand: { name: "BrandB" },
    specifications: {
      displaySize: '5.9"',
      displayStyle: "AMOLED",
      processor: "Snapdragon 8 Gen 2",
      operatingSystem: "Android 14",
      battery: "4300mAh",
      weight: "172g",
    },
    connectivity: {
      wifi: "802.11ax",
      bluetooth: "5.3",
      cellular: "5G",
      nfc: "Yes",
      gps: "Yes",
      ports: ["USB-C", "3.5mm Jack"],
    },
    camera: {
      front: {
        resolution: ["32MP"],
        features: ["EIS"],
        videoRecording: ["4K@30fps"],
      },
      rear: {
        resolution: ["50MP", "13MP"],
        features: ["Gimbal Stabilization"],
        videoRecording: ["8K@24fps", "4K@60fps"],
      },
    },
    status: "active",
  },
];

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
      setLoading(true);
      try {
        // const fetchedProducts = await Products.getAll();
        // setProducts(fetchedProducts);
        setTimeout(() => {
          setProducts(data);
          setLoading(false);
        }, 1000);
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
                <CameraOutlined />{" "}
                {record.camera?.front?.resolution?.join(", ")}
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
                <CameraOutlined />{" "}
                {record.camera?.rear?.resolution?.join(" + ")}
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
          dataSource={products.length > 0 ? products : data}
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
