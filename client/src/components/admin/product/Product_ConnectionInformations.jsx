import { Form, Input, Switch, Row, Col, Select } from 'antd';
import { useEffect } from 'react';

const { Option } = Select;

function ConnectionInformation({ product, form }) {
  useEffect(() => {
    if (product) {
      form?.setFieldsValue({
        connectivity: {
          ...product.connectivity,
          ports: Array.isArray(product.connectivity?.ports)
            ? product.connectivity.ports.join(', ')
            : '',
          nfc: product.connectivity?.nfc?.toString(),
          gps: product.connectivity?.gps?.toString(),
        },
      });
    }
  }, [product, form]);

  return (
    <>
      <div className="flex gap-4 items-center mb-10 relative">
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary font-semibold tracking-wide uppercase letter-spacing-0.5 relative">
            Thông tin kết nối
          </span>
        </div>
        <div className="flex-1 relative">
          <div className="border-t border-r-300 opacity-60 text-primary"></div>
        </div>
      </div>

      <Row gutter={[10, 0]}>
        <Col span={8}>
          <Form.Item name={['connectivity', 'wifi']} label="Wifi">
            <Input placeholder="Nhập thông tin Wifi" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name={['connectivity', 'bluetooth']} label="Bluetooth">
            <Input placeholder="Nhập thông tin Bluetooth" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name={['connectivity', 'nfc']} label="NFC">
            <Select placeholder="Chọn NFC">
              <Option value="true">Có</Option>
              <Option value="false">Không</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name={['connectivity', 'cellular']}
            label="Công nghệ di động"
          >
            <Input placeholder="Nhập công nghệ di động" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name={['connectivity', 'ports']} label="Cổng kết nối">
            <Input placeholder="VD: HDMI, USB-C, Jack 3.5mm..." />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name={['connectivity', 'gps']} label="GPS">
            <Select placeholder="Chọn GPS">
              <Option value="true">Có</Option>
              <Option value="false">Không</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

export default ConnectionInformation;
