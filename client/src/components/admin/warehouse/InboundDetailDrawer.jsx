import React from 'react';
import {
  Drawer,
  Button,
  Space,
  Descriptions,
  Divider,
  Typography,
  Table,
  Badge,
  Tag,
} from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const InboundDetailDrawer = ({
  inbound,
  open,
  onClose,
  selectedInboundDetail,
}) => {
  return (
    <Drawer
      title={inbound ? 'Chi tiết phiếu nhập' : 'Chi tiết phiêu xuất'}
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      extra={
        <Space>
          <Button icon={<PrinterOutlined />}>In phiếu</Button>
          {/* <Button icon={<CloseOutlined />} onClick={onClose} /> */}
        </Space>
      }
    >
      {selectedInboundDetail && (
        <div>
          <Descriptions
            title={inbound ? 'Chi tiết phiếu nhập' : 'Chi tiết phiêu xuất'}
            bordered
            column={1}
          >
            <Descriptions.Item label="Mã phiếu">
              <Text copyable>{selectedInboundDetail._id}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Chi nhánh">
              {selectedInboundDetail.branchId?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm">
              {selectedInboundDetail.productId?.name}
            </Descriptions.Item>
            <Descriptions.Item label={inbound ? 'Ngày nhập' : 'Ngày xuất'}>
              {new Date(selectedInboundDetail.createdAt).toLocaleString(
                'vi-VN',
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {selectedInboundDetail.createdBy?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedInboundDetail.note || 'Không có ghi chú'}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          <Title level={5}>Chi tiết biến thể</Title>
          <Table
            columns={[
              {
                title: 'Biến thể',
                key: 'variant',
                render: (_, record) => (
                  <div>
                    <Tag color="blue">{record.variantId?.name}</Tag>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      SKU: {record.variantId?.sku}
                    </Text>
                  </div>
                ),
              },
              {
                title: 'Số lượng',
                dataIndex: 'quantity',
                key: 'quantity',
                align: 'center',
                render: (quantity) => (
                  <Badge
                    count={quantity}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                ),
              },
              {
                title: 'Giá vốn',
                dataIndex: 'cost',
                key: 'cost',
                align: 'right',
                render: (cost) => (
                  <Text>{cost?.toLocaleString('vi-VN')} ₫</Text>
                ),
              },
              {
                title: 'Thành tiền',
                key: 'total',
                align: 'right',
                render: (_, record) => (
                  <Text strong style={{ color: '#fa8c16' }}>
                    {(record.quantity * record.cost).toLocaleString('vi-VN')} ₫
                  </Text>
                ),
              },
            ]}
            dataSource={selectedInboundDetail.variants || []}
            rowKey={(record) => record.variantId?._id || record.variantId}
            pagination={false}
            size="small"
            summary={(pageData) => {
              const totalQuantity = pageData.reduce(
                (sum, record) => sum + record.quantity,
                0,
              );
              const totalValue = pageData.reduce(
                (sum, record) => sum + record.quantity * record.cost,
                0,
              );

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell>
                    <Text strong>Tổng cộng:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell align="center">
                    <Badge
                      count={totalQuantity}
                      style={{ backgroundColor: '#fa8c16' }}
                    />
                  </Table.Summary.Cell>
                  <Table.Summary.Cell />
                  <Table.Summary.Cell align="right">
                    <Text strong style={{ color: '#fa8c16', fontSize: '16px' }}>
                      {totalValue.toLocaleString('vi-VN')} ₫
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </div>
      )}
    </Drawer>
  );
};

export default InboundDetailDrawer;
