import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Tag,
  Typography,
  Divider,
  Select,
  Flex,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ShopOutlined,
  SearchOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  callDeleteBranch,
  callFetchBranches,
  callUpdateBranch,
} from '@/services/apis';
import ModalBranch from '@/components/admin/branch';

const { Title } = Typography;
const { TextArea } = Input;

const BranchManagement = () => {
  const [branches, setBranches] = useState([{}]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [dataInit, setDataInit] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const FetchBranchs = async () => {
    setLoading(true);
    try {
      const res = await callFetchBranches();
      setBranches(res.data.data);
      setLoading(false);
      message.success('Lấy danh sách chi nhánh thành công!');
    } catch (error) {
      console.log(error);
      setLoading(false);
      message.error('Lấy danh sách chi nhánh thất bại!');
    }
  };
  useEffect(() => {
    FetchBranchs();
  }, []);

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedRowKeys.map((id) => callDeleteBranch(id)));
      setLoading(false);
      message.success(`Đã xóa ${selectedRowKeys.length} chi nhánh thành công`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setOpenModalDelete(false);
      reloadTable();
    } catch (error) {
      console.error('Failed to delete :', error);
      message.error('Xóa thất bại');
    }
  };

  const reloadTable = async () => {
    setLoading(true);
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data);
      message.success('refreshed successfully');
    } catch (error) {
      console.error('Failed to reload :', error);
      message.error('Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  const filteredBranch = branches.filter(
    (branch) =>
      branch.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      branch.address?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'Tên chi nhánh',
      dataIndex: 'name',
      key: 'name',
      render: (name) => (
        <Tooltip title={name}>
          <div
            style={{
              maxWidth: 150,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {name}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      render: (address) => (
        <Tooltip title={address}>
          <div
            style={{
              maxWidth: 150,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {address}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <Tooltip title={phone}>
          <div
            style={{
              maxWidth: 150,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {phone}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => (
        <Tooltip title={email}>
          <div
            style={{
              maxWidth: 150,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {email}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Quản lý',
      dataIndex: 'manager',
      key: 'manager',
      render: (manager) => (
        <Tooltip title={manager?.name || 'Không có'}>
          <div
            style={{
              maxWidth: 150,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {manager?.name || 'Không có'}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 150,
      align: 'center',
      render: (isActive) => (
        <Tooltip title={isActive ? 'Hoạt động' : 'Ngưng hoạt động'}>
          <Badge
            status={isActive ? 'success' : 'default'}
            text={isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
          />
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
    <div style={{}}>
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
            Xác nhận xóa chi nhánh này
          </span>
        </div>
        <div>
          <p>
            Bạn có chắc là muốn xóa {selectedRowKeys.length} chi nhánh đã chọn?
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
              Danh sách các chi nhánh
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
                Thêm chi nhánh
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

        <Divider />

        <Table
          columns={columns}
          dataSource={filteredBranch}
          bordered
          rowKey={(record) => record._id}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            total: branches.length,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} chi nhánh`,
          }}
          scroll={{ x: 800 }}
        />
        <ModalBranch
          openModal={openModal}
          setOpenModal={setOpenModal}
          reloadTable={reloadTable}
          dataInit={dataInit}
          setDataInit={setDataInit}
          visible={openModal}
        />
      </Card>
    </div>
  );
};

export default BranchManagement;
