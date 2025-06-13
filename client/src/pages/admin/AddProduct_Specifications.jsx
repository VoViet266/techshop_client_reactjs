import { Input, Divider, Typography, Space, Row, Col, Form } from "antd";

function Specifications({ setProduct, product }) {
  const { specifications } = product;
  console.log(specifications);
  return (
    <>
      <div className="flex gap-12 items-center">
        <span className="text-sm text-primary font-medium">
          Thông số kỹ thuật
        </span>
        <div className="flex-1 border-t border-t-gray-300"></div>
      </div>

      <Form layout="vertical" autoComplete="off" initialValues={specifications}>
        <Row gutter={[10, 0]}>
          <Col span={8}>
            <Form.Item label="Vi xử lý" name="processor">
              <Input
                id="processor"
                placeholder="Nhập thông tin vi xử lý"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Loại màn hình" name="displayType">
              <Input
                id="displayType"
                name="displayType"
                placeholder="Nhập loại màn hình"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Hệ điều hành" name="operatingSystem">
              <Input
                id="operatingSystem"
                name="operatingSystem"
                placeholder="Nhập hệ điều hành"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Kích thước màn hình" name="displaySize">
              <Input
                id="displaySize"
                name="displaySize"
                placeholder="Nhập kích thước màn hình"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Pin" name="battery">
              <Input
                id="battery"
                name="battery"
                placeholder="Nhập thông tin pin"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Khối lượng" name="weight">
              <Input
                id="weight"
                name="weight"
                placeholder="Nhập thông tin khối lượng"
                size="large"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default Specifications;
