import { Form, Input, InputNumber, Divider, Row, Col } from 'antd';

function CameraInformations({ setProduct, product }) {
  const { camera } = product;
  return (
    <Form layout="vertical" initialValues={camera}>
      <div className="flex gap-12 items-center">
        <span className="text-sm text-primary font-medium">Camera Trước</span>
        <div className="flex-1 border-t border-t-gray-300"></div>
      </div>

      <Row gutter={[10, 0]}>
        <Col span={8}>
          <Form.Item
            name={['front', 'resolution']}
            label="Độ phân giải"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập độ phân giải camera trước!',
              },
            ]}
          >
            <Input
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      front: {
                        ...currentProduct.camera.front,
                        resolution: event.target.value,
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập độ phân giải camera trước"
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name={['front', 'features']} label="Tính năng">
            <Input
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      front: {
                        ...currentProduct.camera.front,
                        features: event.target.value.split(', '),
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập tính năng camera trước "
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item name={['front', 'videoRecording']} label="Quay phim">
            <Input
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      front: {
                        ...currentProduct.camera.front,
                        videoRecording: event.target.value.split(', '),
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập tính năng quay phim camera trước "
            />
          </Form.Item>
        </Col>
      </Row>

      <div className="flex gap-12 items-center">
        <span className="text-sm text-primary font-medium">Camera Sau</span>
        <div className="flex-1 border-t border-t-gray-300"></div>
      </div>

      <Row gutter={[10, 0]}>
        <Col span={6}>
          <Form.Item
            name={['rear', 'resolution']}
            label="Độ phân giải"
            rules={[
              {
                required: true,
                message: 'Vui lòng nhập độ phân giải camera sau!',
              },
            ]}
          >
            <Input
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      rear: {
                        ...currentProduct.camera.rear,
                        resolution: event.target.value,
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập độ phân giải camera sau"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name={['rear', 'features']} label="Tính năng">
            <Input
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      rear: {
                        ...currentProduct.camera.rear,
                        features: event.target.value.split(', '),
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập tính năng camera sau "
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name={['rear', 'videoRecording']} label="Quay phim">
            <Input
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      rear: {
                        ...currentProduct.camera.rear,
                        videoRecording: event.target.value.split(', '),
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập tính năng quay phim camera sau"
            />
          </Form.Item>
        </Col>

        <Col span={6}>
          <Form.Item name={['rear', 'lensCount']} label="Số lượng ống kính">
            <Input
              onChange={(event) => {
                setProduct((currentProduct) => {
                  return {
                    ...currentProduct,
                    camera: {
                      ...currentProduct.camera,
                      rear: {
                        ...currentProduct.camera.rear,
                        lensCount: parseInt(event.target.value),
                      },
                    },
                  };
                });
              }}
              placeholder="Nhập số lượng ống kính"
              min={1}
              type="number"
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
}

export default CameraInformations;
