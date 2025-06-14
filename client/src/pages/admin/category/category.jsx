import React, { useEffect, useState } from "react";

import {
  Table,
  Space,
  Button,
  Modal,
  Typography,
  Card,
  Row,
  Col,
  Input,
  Breadcrumb,
  message,
  Tooltip,
  Tag,
  Flex,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { callDeleteCategory, callFetchCategories } from "@/services/apis";
import ModalCategory from "@/components/admin/category";

const { Title, Text } = Typography;
const { Search } = Input;

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await callFetchCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xoa danh muc",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: (
        <div>
          <p>Bạn có chắc là muốn xóa danh mục này?</p>
          <p style={{ marginTop: 8 }}>
            {" "}
            Xóa dang mục này sẽ không thể khôi phụca
          </p>
        </div>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await callDeleteCategory(id);
          message.success(`Danh mục ${name} xóa thành công`);
          fetchCategories();
        } catch (error) {
          console.error("Failed to delete category:", error);
          message.error("Xóa thất bại");
        }
      },
    });
  };

  const reloadTable = async () => {
    setLoading(true);
    try {
      const response = await callFetchCategories();

      setCategories(response.data.data);
      message.success("Categories refreshed successfully");
    } catch (error) {
      console.error("Failed to reload categories:", error);
      message.error("Failed to refresh categories");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
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
      title: "Trạng thái",
      key: "status",
      render: (s) =>
        s.isActive ? (
          <Tag color="green">Đang hoạt động</Tag>
        ) : (
          <Tag color="red">Ngừng bán</Tag>
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
  return (
    <Card
      bordered={false}
      style={{ borderRadius: 8, boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)" }}
    >
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <AppstoreOutlined style={{ marginRight: 8 }} />
            Danh sách các danh mục
          </Title>
        </Col>
      </Row>

      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            prefix={<SearchOutlined style={{ color: "#94A3B8" }} />}
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
                    ? "0 2px 8px rgba(79, 70, 229, 0.2)"
                    : "none",
              }}
            >
              Sửa ({selectedRowKeys.length})
            </Button>

            <Button
              danger
              onClick={() => {
                handleDelete(selectedRowKeys[0]);
              }}
              disabled={selectedRowKeys.length === 0}
              icon={<DeleteOutlined />}
              style={{
                borderRadius: 8,
                fontWeight: 500,
                borderColor: selectedRowKeys.length > 0 ? "#EF4444" : undefined,
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

      <Table
        loading={loading}
        rowKey={(record) => record._id}
        rowSelection={rowSelection}
        dataSource={filteredCategories}
        columns={columns}
        bordered
        size="middle"
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `Total ${total} categories`,
        }}
      />

      <ModalCategory
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
        visible={openModal}
      />
    </Card>
  );
};

export default CategoryPage;
