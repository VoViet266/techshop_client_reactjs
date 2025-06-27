import { Form, Input, Switch, Row, Col } from 'antd';
import { useEffect } from 'react';

function ConnectionInformation({ product, form }) {
  useEffect(() => {
    if (product) {
      form?.setFieldsValue({
        connectivity: {
          ...product.connectivity,
          ports: Array.isArray(product.connectivity?.ports)
            ? product.connectivity.ports.join(', ')
            : '',
        },
      });
    }
  }, [product, form]);

  return (
    <>
      <div className="flex gap-12 items-center mb-2">
        <span className="text-sm text-primary font-medium">
          Thông tin kết nối
        </span>
        <div className="flex-1 border-t border-t-gray-300"></div>
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
          <Form.Item
            name={['connectivity', 'nfc']}
            label="NFC"
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
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
          <Form.Item
            name={['connectivity', 'gps']}
            label="GPS"
            valuePropName="checked"
          >
            <Switch checkedChildren="Có" unCheckedChildren="Không" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

export default ConnectionInformation;
