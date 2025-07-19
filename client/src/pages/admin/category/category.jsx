import React, { useEffect, useState } from 'react';

import {
  Table,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Input,
  message,
  Tooltip,
  Tag,
  Flex,
  Modal,
  Image,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { callDeleteCategory, callFetchCategories } from '@/services/apis';
import ModalCategory from '@/components/admin/category';

const { Title, Text } = Typography;
const { Search } = Input;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openModalDelete, setOpenModalDelete] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await callFetchCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => callDeleteCategory(id)));
      message.success(`Đã xóa ${selectedRowKeys.length} danh mục thành công`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setOpenModalDelete(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete categories:', error);
      message.error('Xóa thất bại');
    }
  };

  const reloadTable = async () => {
    setLoading(true);
    try {
      const response = await callFetchCategories();
      setCategories(response.data.data);
      message.success('Categories refreshed successfully');
    } catch (error) {
      console.error('Failed to reload categories:', error);
      message.error('Failed to refresh categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      render: (text) => (
        <Image src={text} alt="Category Logo" style={{ width: 80 }} />
      ),
      key: 'logo',
      width: 90,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
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
      title: 'Trạng thái',
      key: 'status',
      render: (s) =>
        s.isActive ? (
          <Tooltip title="Đang hoạt động">
            <Tag color="green">Đang hoạt động</Tag>
          </Tooltip>
        ) : (
          <Tooltip title="Ngưng hoạt động">
            <Tag color="red">Ngưng hoạt động</Tag>
          </Tooltip>
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
    <>
      <Modal
        title="Xóa danh mục"
        open={openModalDelete}
        onCancel={() => setOpenModalDelete(false)}
        onOk={handleBulkDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        style={{ top: 20, zIndex: 9999 }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
        >
          <ExclamationCircleOutlined
            style={{ color: '#ff4d4f', fontSize: 22, marginRight: 8 }}
          />
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            Xác nhận xóa danh mục
          </span>
        </div>
        <div>
          <p>
            Bạn có chắc là muốn xóa {selectedRowKeys.length} danh mục đã chọn?
          </p>
        </div>
      </Modal>

      <Card
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: '10px' }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              Danh sách các danh mục
            </Title>
          </Col>
        </Row>

        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm danh mục..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
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
                  backgroundColor: 'rgb(11, 162, 36)',
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                }}
                onClick={() => {
                  setOpenModal(true);
                }}
              >
                Thêm danh mục
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
                      ? '0 2px 8px rgba(79, 70, 229, 0.2)'
                      : 'none',
                }}
              >
                Sửa ({selectedRowKeys.length})
              </Button>

              <Button
                danger
                onClick={() => {
                  setOpenModalDelete(true);
                }}
                disabled={selectedRowKeys.length === 0}
                icon={<DeleteOutlined />}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  borderColor:
                    selectedRowKeys.length > 0 ? '#EF4444' : undefined,
                  boxShadow:
                    selectedRowKeys.length > 0
                      ? '0 2px 8px rgba(239, 68, 68, 0.2)'
                      : 'none',
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
            pageSizeOptions: ['10', '20', '50'],
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
    </>
  );
};

export default CategoryManagement;
