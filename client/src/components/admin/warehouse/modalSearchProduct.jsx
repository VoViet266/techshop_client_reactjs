import React, { use, useEffect, useState } from 'react';
import { Modal, Input, Table, Tag, Button, Badge, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const ModalSearchProduct = ({
  inbound,
  productSearchVisible,
  setProductSearchVisible,
  handleSelectProduct,
  products,
  filteredProducts,
  setFilteredProducts,
}) => {
  const [productSearchText, setProductSearchText] = useState('');

  const handleProductSearch = (value) => {
    setProductSearchText(value);
    if (!value.trim()) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredProducts(filtered);
  };

  const productSearchColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <div>
          <Typography.Text strong>{record.name}</Typography.Text>
          <br />

          <br />
          <Tag color="blue" style={{ fontSize: '10px' }}>
            {record.category?.name}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Số biến thể',
      key: 'variants',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Badge count={record.variants?.length || 0} style={{ backgroundColor: '#52c41a' }} />
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Tag color={record.status === 'active' ? 'green' : 'red'}>
          {record.status === 'active' ? 'Hoạt động' : 'Ngừng bán'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            handleSelectProduct(record);
          }}
        >
          Chọn
        </Button>
      ),
    },
  ];
  return (
    <>
      <Modal
        title="Tìm kiếm sản phẩm"
        open={productSearchVisible}
        onCancel={() => setProductSearchVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="Tìm kiếm theo tên sản phẩm, mã sản phẩm hoặc danh mục..."
            prefix={<SearchOutlined />}
            value={productSearchText}
            onChange={(e) => handleProductSearch(e.target.value)}
            size="large"
            allowClear
          />
        </div>
        <Table
          columns={productSearchColumns}
          dataSource={filteredProducts}
          rowKey="_id"
          pagination={{
            pageSize: 10,
          }}
          scroll={{ y: 400 }}
          size="small"
        />
      </Modal>
    </>
  );
};

export default ModalSearchProduct;
