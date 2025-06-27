import { Form, Input, Row, Col } from 'antd';
import { useEffect } from 'react';

function CameraInformations({ product, form }) {
  useEffect(() => {
    if (product) {
      form?.setFieldsValue({
        camera: product.camera,
      });
    }
  }, [product, form]);

  return (
    <>
      <div className="flex gap-12 items-center mb-2">
        <span className="text-sm text-primary font-medium">Camera Trước</span>
        <div className="flex-1 border-t border-t-gray-300"></div>
      </div>

      <Row gutter={[10, 0]}>
        <Col span={8}>
          <Form.Item
            name={['camera', 'front', 'resolution']}
            label="Độ phân giải"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập độ phân giải camera trước!',
              },
            ]}
          >
            <Input placeholder="Nhập độ phân giải camera trước" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name={['camera', 'front', 'features']} label="Tính năng">
            <Input placeholder="Nhập tính năng camera trước" />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            name={['camera', 'front', 'videoRecording']}
            label="Quay phim"
          >
            <Input placeholder="Nhập khả năng quay phim camera trước" />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex gap-12 items-center mb-2 mt-4">
        <span className="text-sm text-primary font-medium">Camera Sau</span>
        <div className="flex-1 border-t border-t-gray-300"></div>
      </div>

      <Row gutter={[10, 0]}>
        <Col span={6}>
          <Form.Item
            name={['camera', 'rear', 'resolution']}
            label="Độ phân giải"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập độ phân giải camera sau!',
              },
            ]}
          >
            <Input placeholder="Nhập độ phân giải camera sau" />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name={['camera', 'rear', 'features']} label="Tính năng">
            <Input placeholder="Nhập tính năng camera sau" />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name={['camera', 'rear', 'videoRecording']}
            label="Quay phim"
          >
            <Input placeholder="Nhập khả năng quay phim camera sau" />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item
            name={['camera', 'rear', 'lensCount']}
            label="Số lượng ống kính"
          >
            <Input placeholder="Nhập số lượng ống kính" type="number" min={1} />
          </Form.Item>
        </Col>
      </Row>
    </>
  );
}

export default CameraInformations;
