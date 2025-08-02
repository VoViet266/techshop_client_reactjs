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
  
  const handlePrint = () => {
    if (!selectedInboundDetail) return;

    // Tính toán tổng cộng
    const totalQuantity =
      selectedInboundDetail.variants?.reduce(
        (sum, record) => sum + record.quantity,
        0,
      ) || 0;
    const totalValue =
      selectedInboundDetail.variants?.reduce(
        (sum, record) => sum + record.quantity * record.cost,
        0,
      ) || 0;

    // Tạo nội dung HTML để in
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${inbound ? 'Phiếu nhập kho' : 'Phiếu xuất kho'}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 13px;
            line-height: 1.4;
            color: #333;
            background: white;
            padding: 20px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1890ff;
            padding-bottom: 20px;
          }
          
          .header h1 {
            font-size: 24px;
            color: #1890ff;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-weight: bold;
          }
          
          .header .subtitle {
            font-size: 14px;
            color: #666;
          }
          
          .info-section {
            margin-bottom: 25px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .info-item {
            display: flex;
            margin-bottom: 8px;
          }
          
          .info-label {
            font-weight: 600;
            width: 120px;
            color: #555;
          }
          
          .info-value {
            flex: 1;
            color: #333;
          }
          
          .table-section {
            margin-top: 25px;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1890ff;
            margin-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
            padding-bottom: 5px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border: 1px solid #e8e8e8;
          }
          
          th, td {
            padding: 10px 8px;
            text-align: left;
            border-bottom: 1px solid #e8e8e8;
            vertical-align: middle;
          }
          
          th {
            background-color: #f5f5f5;
            font-weight: 600;
            color: #555;
            font-size: 12px;
            text-transform: uppercase;
          }
          
          td {
            font-size: 13px;
          }
          
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          
          .variant-tag {
            background-color: #1890ff;
            color: white;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            display: inline-block;
            margin-bottom: 4px;
          }
          
          .color-info {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-top: 4px;
          }
          
          .color-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid #ccc;
            display: inline-block;
          }
          
          .color-text {
            color: #888;
            font-size: 11px;
          }
          
          .quantity-badge {
            background-color: #52c41a;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 500;
          }
          
          .total-row {
            background-color: #f9f9f9;
            font-weight: 600;
            border-top: 2px solid #1890ff;
          }
          
          .total-value {
            color: #fa8c16;
            font-size: 15px;
            font-weight: 700;
          }
          
          .summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #1890ff;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            text-align: center;
          }
          
          .summary-item {
            padding: 10px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e8e8e8;
          }
          
          .summary-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          
          .summary-value {
            font-size: 18px;
            font-weight: 600;
            color: #1890ff;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e8e8e8;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 40px;
            text-align: center;
          }
          
          .signature-box {
            padding: 15px 0;
          }
          
          .signature-title {
            font-weight: 600;
            margin-bottom: 40px;
            color: #555;
          }
          
          .signature-line {
            border-bottom: 1px solid #333;
            margin-bottom: 5px;
            height: 1px;
          }
          
          .print-info {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #888;
            border-top: 1px solid #f0f0f0;
            padding-top: 15px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
          }
          
          .status-badge {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            text-transform: uppercase;
          }
          
          .status-completed {
            background-color: #f6ffed;
            color: #52c41a;
            border: 1px solid #b7eb8f;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${inbound ? 'PHIẾU NHẬP KHO' : 'PHIẾU XUẤT KHO'}</h1>
          <div class="subtitle">Mã phiếu: ${selectedInboundDetail._id}</div>
        </div>
        
        <div class="info-section">
          <div class="info-grid">
            <div class="left-info">
              <div class="info-item">
                <span class="info-label">Chi nhánh:</span>
                <span class="info-value">${selectedInboundDetail.branchId?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Sản phẩm:</span>
                <span class="info-value">${selectedInboundDetail.productId?.name || 'N/A'}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Người tạo:</span>
                <span class="info-value">${selectedInboundDetail.createdBy?.name || 'N/A'}</span>
              </div>
            </div>
            <div class="right-info">
              <div class="info-item">
                <span class="info-label">${inbound ? 'Ngày nhập:' : 'Ngày xuất:'}</span>
                <span class="info-value">${new Date(selectedInboundDetail.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Trạng thái:</span>
                <span class="info-value">
                  <span class="status-badge status-completed">Hoàn thành</span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Ghi chú:</span>
                <span class="info-value">${selectedInboundDetail.note || 'Không có ghi chú'}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="table-section">
          <div class="section-title">Chi tiết biến thể</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%">Biến thể</th>
                <th style="width: 15%" class="text-center">Số lượng</th>
                <th style="width: 20%" class="text-right">Giá vốn</th>
                <th style="width: 25%" class="text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${
                selectedInboundDetail.variants
                  ?.map(
                    (record) => `
                <tr>
                  <td>
                    <div class="variant-tag">${record.variantId?.name || 'N/A'}</div>
                    <div class="color-info">
                      <span class="color-dot" style="background-color: ${record.variantColorHex || '#ccc'};"></span>
                      <span class="color-text">${record.variantColor || 'N/A'}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <span class="quantity-badge">${record.quantity || 0}</span>
                  </td>
                  <td class="text-right">${(record.cost || 0).toLocaleString('vi-VN')} ₫</td>
                  <td class="text-right total-value">${((record.quantity || 0) * (record.cost || 0)).toLocaleString('vi-VN')} ₫</td>
                </tr>
              `,
                  )
                  .join('') || ''
              }
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td><strong>TỔNG CỘNG:</strong></td>
                <td class="text-center">
                  <span class="quantity-badge" style="background-color: #fa8c16;">${totalQuantity}</span>
                </td>
                <td></td>
                <td class="text-right total-value" style="font-size: 16px;">
                  ${totalValue.toLocaleString('vi-VN')} ₫
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="summary">
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-label">Tổng số lượng</div>
              <div class="summary-value">${totalQuantity}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Số loại sản phẩm</div>
              <div class="summary-value">${selectedInboundDetail.variants?.length || 0}</div>
            </div>
            <div class="summary-item">
              <div class="summary-label">Tổng giá trị</div>
              <div class="summary-value">${totalValue.toLocaleString('vi-VN')} ₫</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="signature-box">
            <div class="signature-title">Người lập phiếu</div>
            <div class="signature-line"></div>
            <div>${selectedInboundDetail.createdBy?.name || ''}</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Thủ kho</div>
            <div class="signature-line"></div>
            <div>(.....................)</div>
          </div>
          <div class="signature-box">
            <div class="signature-title">Giám đốc</div>
            <div class="signature-line"></div>
            <div>(.....................)</div>
          </div>
        </div>
        
        <div class="print-info">
          <div>In lúc: ${new Date().toLocaleString('vi-VN')}</div>
          <div>Hệ thống quản lý kho - Phiên bản 1.0</div>
        </div>
      </body>
      </html>
    `;

    // Tạo cửa sổ mới để in
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();

      // Đợi nội dung load xong rồi in
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Tự động đóng cửa sổ sau khi in (tùy chọn)
          // printWindow.close();
        }, 250);
      };
    } else {
      // Fallback nếu không thể mở cửa sổ mới
      alert('Vui lòng cho phép popup để in phiếu');
    }
  };

  return (
    <Drawer
      title={inbound ? 'Chi tiết phiếu nhập' : 'Chi tiết phiếu xuất'}
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      extra={
        <Space>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            disabled={!selectedInboundDetail}
          >
            In phiếu
          </Button>
        </Space>
      }
    >
      {selectedInboundDetail && (
        <div>
          <Descriptions
            title={inbound ? 'Chi tiết phiếu nhập' : 'Chi tiết phiếu xuất'}
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
                    <Tag color="blue">{record.variantId?.name || 'N/A'}</Tag>
                    <br />
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: record.variantColorHex || '#ccc',
                          border: '1px solid #ccc',
                          borderRadius: '50%',
                        }}
                      />
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {record.variantColor || 'N/A'}
                      </Text>
                    </div>
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
            rowKey={(record, index) =>
              `${record.variantId?._id || record.variantId}-${record.variantColor}-${index}`
            }
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
