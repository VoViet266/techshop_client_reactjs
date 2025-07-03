import { Input, Row, Col, Form } from 'antd';
import { useEffect } from 'react';

function Specifications({ product, form }) {
  useEffect(() => {
    if (product) {
      form?.setFieldsValue({
        specifications: product.specifications,
      });
    }
  }, [product, form]);

  return (
    <>
      <div className="flex gap-4 items-center mb-10 relative">
        <div className="flex items-center gap-3">
          <span className="text-sm text-primary font-semibold tracking-wide uppercase letter-spacing-0.5 relative">
            Thông số kỹ thuật
          </span>
        </div>
        <div className="flex-1 relative">
          <div className="border-t border-r-300 opacity-60 text-primary"></div>
        </div>
      </div>

      <Row gutter={[10, 0]}>
        <Col span={8}>
          <Form.Item label="Vi xử lý" name={['specifications', 'processor']}>
            <Input placeholder="Nhập thông tin vi xử lý" size="large" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Loại màn hình"
            name={['specifications', 'displayType']}
          >
            <Input placeholder="Nhập loại màn hình" size="large" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Hệ điều hành"
            name={['specifications', 'operatingSystem']}
          >
            <Input placeholder="Nhập hệ điều hành" size="large" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Kích thước màn hình"
            name={['specifications', 'displaySize']}
          >
            <Input placeholder="Nhập kích thước màn hình" size="large" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Pin" name={['specifications', 'battery']}>
            <Input placeholder="Nhập thông tin pin" size="large" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item label="Khối lượng" name={['specifications', 'weight']}>
            <Input placeholder="Nhập khối lượng" size="large" />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

export default Specifications;
