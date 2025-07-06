import React from 'react';
import { Descriptions, Typography } from 'antd';

const { Title } = Typography;

const renderDescriptions = (title, data) => (
  <div className="mb-6 ">
    <Title level={4}>{title}</Title>
    <Descriptions column={1} bordered size="small">
      {data.map((item) => (
        <Descriptions.Item
          label={item.label}
          key={item.label}
          labelStyle={{ width: 200, fontWeight: 'bold' }}
          className="text-base font-medium"
        >
          {item.value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  </div>
);

const ProductSpecification = ({ product }) => {
  if (
    !product ||
    !product.specifications ||
    !product.connectivity ||
    !product.camera
  ) {
    return <p>Không có thông tin kỹ thuật.</p>;
  }

  const specs = product.specifications || {};
  const connectivity = product.connectivity || {};
  const frontCam = product.camera?.front || {};
  const rearCam = product.camera?.rear || {};

  const technicalSpecs = [
    { label: 'Kích cỡ màn hình', value: specs.displaySize || 'Đang cập nhật' },
    { label: 'Loại màn hình', value: specs.displayType || 'Đang cập nhật' },
    { label: 'Vi xử lý', value: specs.processor || 'Đang cập nhật' },
    { label: 'Hệ điều hành', value: specs.operatingSystem || 'Đang cập nhật' },
    { label: 'Trọng lượng', value: specs.weight || 'Đang cập nhật' },
    { label: 'Pin', value: specs.battery || 'Đang cập nhật' },
  ];

  const connectivitySpecs = [
    { label: 'Wi-Fi', value: connectivity.wifi || 'Không rõ' },
    { label: 'Bluetooth', value: connectivity.bluetooth || 'Không rõ' },
    { label: 'Mạng di động', value: connectivity.cellular || 'Không rõ' },
    { label: 'GPS', value: connectivity.gps ? 'Có' : 'Không' },
    { label: 'NFC', value: connectivity.nfc ? 'Có' : 'Không' },
    {
      label: 'Cổng kết nối',
      value:
        connectivity.ports && connectivity.ports.length > 0
          ? connectivity.ports.join(', ')
          : 'Không rõ',
    },
  ];

  const frontCameraSpecs = [
    { label: 'Độ phân giải', value: frontCam.resolution || 'Không rõ' },
    {
      label: 'Tính năng',
      value:
        frontCam.features && frontCam.features.length > 0
          ? frontCam.features.join(', ')
          : 'Không rõ',
    },
    {
      label: 'Quay video',
      value:
        frontCam.videoRecording && frontCam.videoRecording.length > 0
          ? frontCam.videoRecording.join(', ')
          : 'Không rõ',
    },
  ];

  const rearCameraSpecs = [
    { label: 'Độ phân giải', value: rearCam.resolution || 'Không rõ' },
    {
      label: 'Tính năng',
      value:
        rearCam.features && rearCam.features.length > 0
          ? rearCam.features.join(', ')
          : 'Không rõ',
    },
    {
      label: 'Quay video',
      value:
        rearCam.videoRecording && rearCam.videoRecording.length > 0
          ? rearCam.videoRecording.join(', ')
          : 'Không rõ',
    },
    {
      label: 'Số lượng ống kính',
      value: rearCam.lensCount || 'Không rõ',
    },
  ];

  return (
    <div>
      {renderDescriptions('Thông số kỹ thuật', technicalSpecs)}
      {renderDescriptions('Kết nối', connectivitySpecs)}
      {renderDescriptions('Camera trước', frontCameraSpecs)}
      {renderDescriptions('Camera sau', rearCameraSpecs)}
    </div>
  );
};

export default ProductSpecification;
