import React from 'react';
import { Descriptions, Typography } from 'antd';

const { Title } = Typography;

const renderDescriptions = (title, data) => (
  <div className="mb-20">
    <Title level={4}>{title}</Title>
    <Descriptions column={1} bordered size="small">
      {data.map((item) => (
        <Descriptions.Item label={item.label} key={item.label}>
          {item.value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  </div>
);

const ProductSpecification = ({ className }) => {
  const technicalSpecs = [
    { label: 'Kích cỡ màn hình', value: '6.5 inch' },
    { label: 'Loại màn hình', value: 'AMOLED, 120Hz' },
    { label: 'Vi xử lý', value: 'Snapdragon 8 Gen 2' },
    { label: 'Hệ điều hành', value: 'Android 14' },
    { label: 'Trọng lượng', value: '190g' },
    { label: 'Pin', value: '5000mAh, sạc nhanh 67W' },
  ];

  const connectivity = [
    { label: 'Wi-Fi', value: 'Wi-Fi 6' },
    { label: 'Bluetooth', value: 'v5.3' },
    { label: 'Mạng di động', value: '5G' },
    { label: 'GPS', value: 'Có, hỗ trợ A-GPS, GLONASS' },
    { label: 'Cổng kết nối', value: 'USB-C' },
  ];

  const frontCamera = [
    { label: 'Độ phân giải', value: '32MP' },
    { label: 'Tính năng', value: 'Làm đẹp AI, HDR' },
    { label: 'Quay video', value: '1080p@30fps' },
  ];

  const rearCamera = [
    { label: 'Độ phân giải', value: '50MP (chính) + 12MP (góc rộng)' },
    { label: 'Tính năng', value: 'Chống rung OIS, HDR, Night Mode' },
    { label: 'Quay video', value: '4K@60fps' },
    { label: 'Số lượng ống kính', value: '3' },
  ];

  return (
    <div className={className}>
      {renderDescriptions('Thông số kỹ thuật', technicalSpecs)}
      {renderDescriptions('Kết nối', connectivity)}
      {renderDescriptions('Camera trước', frontCamera)}
      {renderDescriptions('Camera sau', rearCamera)}
    </div>
  );
};

export default ProductSpecification;
