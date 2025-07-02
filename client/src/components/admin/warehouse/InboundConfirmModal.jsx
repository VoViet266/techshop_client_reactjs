import React from 'react';
import { Modal, Row, Col, Divider, Alert, Typography } from 'antd';

const { Text, Title } = Typography;

const InboundConfirmModal = ({
  inbound,
  open,
  onClose,
  onConfirm,
  loading,
  previewData,
  branches = [],
}) => {
  return (
    <Modal
      title={inbound ? 'Xác nhận nhập kho' : 'Xác nhận xuất kho'}
      open={open}
      onOk={onConfirm}
      onCancel={onClose}
      okText={inbound ? 'Xác nhận nhập' : 'Xác nhận xuất'}
      cancelText="Hủy"
      confirmLoading={loading}
      width={600}
    >
      {previewData && (
        <div>
          <Alert
            message="Vui lòng kiểm tra thông tin trước khi xác nhận"
            type="info"
            style={{ marginBottom: '16px' }}
          />
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Text strong>Chi nhánh:</Text>
              <br />
              <Text>
                {branches.find((b) => b._id === previewData.branchId)?.name}
              </Text>
            </Col>
            <Col span={12}>
              <Text strong>Tổng sản phẩm:</Text>
              <br />
              <Text>{previewData.items.length}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Tổng số lượng:</Text>
              <br />
              <Text>{previewData.totalItems}</Text>
            </Col>
            <Col span={12}>
              <Text strong>{inbound ? 'Ngày nhập:' : 'Ngày xuất:'}</Text>
              <br />
              <Text>{new Date().toLocaleDateString('vi-VN')}</Text>
            </Col>

            <Col span={24}>
              <Text strong>Tổng giá trị:</Text>
              <br />
              <Text style={{ fontSize: '18px', color: '#fa8c16' }}>
                {previewData.totalValue.toLocaleString('vi-VN')} ₫
              </Text>
            </Col>
            {previewData.note && (
              <Col span={24}>
                <Text strong>Ghi chú:</Text>
                <br />
                <Text>{previewData.note}</Text>
              </Col>
            )}
          </Row>

          <Divider />

          <Title level={5}>Danh sách sản phẩm:</Title>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {previewData.items.map((item, index) => (
              <div
                key={index}
                style={{
                  padding: '8px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  backgroundColor: '#fafafa',
                }}
              >
                <Row justify="space-between">
                  <Col span={16}>
                    <Text strong style={{ fontSize: '12px' }}>
                      {item.productName}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {item.variantName} × {item.quantity}
                    </Text>
                  </Col>
                  <Col span={8} style={{ textAlign: 'right' }}>
                    <Text style={{ fontSize: '12px', color: '#fa8c16' }}>
                      {item.total.toLocaleString('vi-VN')}₫
                    </Text>
                  </Col>
                </Row>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default InboundConfirmModal;
