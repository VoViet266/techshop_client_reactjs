import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
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
  Flex,
  Image,
  Tooltip,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  AppstoreOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import ModalBanner from '@/components/admin/banner/modalBanner';
import { callDeleteBanners, callFetchBanners } from '@/services/apis';
import dayjs from 'dayjs';

const { Title } = Typography;
export const BannerPosition = {
  HOME_MAIN: 'HOME_MAIN',
  HOME_PROMO: 'HOME_PROMO',
  HOME_FEATURE: 'HOME_FEATURE',
  HORIZONTAL_BANNER: 'HORIZONTAL_BANNER',
  CATEGORY_TOP: 'CATEGORY_TOP',
  CATEGORY_SIDEBAR: 'CATEGORY_SIDEBAR',
  PRODUCT_DETAIL_TOP: 'PRODUCT_DETAIL_TOP',
  PRODUCT_DETAIL_BOTTOM: 'PRODUCT_DETAIL_BOTTOM',
  CART_PAGE: 'CART_PAGE',
  CHECKOUT_PAGE: 'CHECKOUT_PAGE',
  FOOTER_BANNER: 'FOOTER_BANNER',
  SIDEBAR_BANNER: 'SIDEBAR_BANNER',
};

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState(null);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await callFetchBanners();
      setBanners(res.data.data);
    } catch (err) {
      message.error('Lỗi khi tải banner');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Quản lý banner';
  }, []);

  useEffect(() => {
    fetchBanners();
  }, []);

  const filteredData = banners.filter((item) =>
    item.title?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedRowKeys.map((id) => callDeleteBanners(id)));
      setLoading(false);
      message.success(`Đã xóa ${selectedRowKeys.length} banner thành công`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setOpenModalDelete(false);
      reloadTable();
    } catch (error) {
      console.error('Failed to delete :', error);
      message.error('Xóa thất bại');
    }
  };

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'imageUrl',
      key: 'image',
      width: 120,
      render: (imageUrl) => (
        <Image
          width={80}
          height={40}
          src={imageUrl}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          preview={{ mask: <EyeOutlined /> }}
        />
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.description}
          </div>
        </div>
      ),
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      render: (position) => {
        switch (position) {
          case 'HOME_MAIN':
            return 'Trang chủ - chính';
          case 'HOME_PROMO':
            return 'Trang chủ - khuyến mãi';
          case 'HOME_FEATURE':
            return 'Trang chủ - nổi bật';
          case 'HORIZONTAL_BANNER':
            return 'Trang chủ - banner ngang';
          default:
            return position;
        }
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tooltip title={isActive ? 'Hoạt động' : 'Ngưng hoạt động'}>
          <Badge
            status={isActive ? 'success' : 'default'}
            text={isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      render: (priority) => priority || 1,
    },
    {
      title: 'Thời gian',
      key: 'duration',
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          <div>
            Từ:{' '}
            {record.startDate
              ? dayjs(record.startDate).format('DD/MM/YYYY')
              : '--'}
          </div>
          <div>
            Đến:{' '}
            {record.endDate ? dayjs(record.endDate).format('DD/MM/YYYY') : '--'}
          </div>
        </div>
      ),
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (_, record) => {
        const clicks = record.clicks || 0;
        const impressions = record.impressions || 0;

        return (
          <div style={{ fontSize: '12px' }}>
            <div>
              Clicks: <strong>{clicks}</strong>
            </div>
            <div>
              Views: <strong>{impressions}</strong>
            </div>
          </div>
        );
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys, rows) => {
      setSelectedRowKeys(keys);
      setSelectedRows(rows);
    },
  };

  return (
    <div>
      <Modal
        title="Xác nhận xóa"
        open={openModalDelete}
        onOk={handleBulkDelete}
        onCancel={() => setOpenModalDelete(false)}
        okButtonProps={{ danger: true }}
        okText="Xóa"
        cancelText="Hủy"
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ExclamationCircleOutlined style={{ color: 'red', marginRight: 8 }} />
          <span>Bạn có chắc muốn xóa {selectedRowKeys.length} banner?</span>
        </div>
      </Modal>

      <Card
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: '10px' }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              Quản lý Banner
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
              placeholder="Tìm kiếm banner..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ borderRadius: 8 }}
            />
          </Col>

          <Col>
            <Flex gap={8} wrap="wrap" justify="end">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setOpenModal(true);
                  setDataInit(null);
                }}
              >
                Thêm banner
              </Button>

              <Button
                icon={<EditOutlined />}
                disabled={selectedRowKeys.length !== 1}
                onClick={() => {
                  setDataInit(selectedRows[0]);
                  setOpenModal(true);
                }}
              >
                Sửa ({selectedRowKeys.length})
              </Button>

              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={() => setOpenModalDelete(true)}
              >
                Xóa ({selectedRowKeys.length})
              </Button>
            </Flex>
          </Col>
        </Row>

        <Divider />

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="_id"
          rowSelection={rowSelection}
          loading={loading}
          pagination={{
            pageSize: 10,
            showQuickJumper: true,
            total: filteredData.length,
            showTotal: (total) => `Tổng cộng ${total} banner`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      <ModalBanner
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={fetchBanners}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
    </div>
  );
};

export default BannerManagement;
