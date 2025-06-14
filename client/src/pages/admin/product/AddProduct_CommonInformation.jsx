import Files from "@services/files";
import { useCallback } from "react";
import { Editor } from "@components/app";
import {
  Input,
  Select,
  Divider,
  Typography,
  Space,
  Row,
  Col,
  Form,
} from "antd";

const { Option } = Select;
const { Text } = Typography;

function CommonInformation({
  brands,
  product,
  categories,
  setProduct,
  productError,
  productMessage,
}) {
  const handleImageUpload = useCallback(async (files, info, uploadHandler) => {
    try {
      const file = files[0];

      if (!file) {
        throw new Error("No file selected");
      }

      const imageUrl = await Files.upload(file);

      if (typeof imageUrl === "string" && imageUrl.startsWith("http")) {
        uploadHandler({
          result: [
            {
              url: imageUrl,
              name: file.name,
              size: file.size,
            },
          ],
        });
      } else {
        throw new Error("Invalid image URL");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      uploadHandler({
        errorMessage: "Upload failed: " + (error.message || "Unknown error"),
      });
    }
  }, []);

  return (
    <>
      <div className="flex gap-12 items-center ">
        <span className="text-sm text-primary font-medium">
          Thông tin chung
        </span>
        <div className="flex-1 border-t border-t-gray-300"></div>
      </div>
      <Form layout="vertical">
        <Row gutter={[10, 0]}>
          <Col span={6}>
            <Form.Item
              label="Tên sản phẩm"
              className="font-roboto!"
              validateStatus={productError.name ? "error" : ""}
              help={productError.name ? productMessage.name : ""}
              style={{ marginBottom: 0 }}
            >
              <Input
                id="name"
                name="name"
                value={product.name || ""}
                onChange={(event) => {
                  setProduct((currentProduct) => {
                    return { ...currentProduct, name: event.target.value };
                  });
                }}
                placeholder="Nhập tên sản phẩm"
                size="large"
                className="font-roboto! placeholder:text-sm! placeholder:font-medium! rounded-md!"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Giảm giá"
              validateStatus={productError.discount ? "error" : ""}
              help={productError.discount ? productMessage.discount : ""}
              style={{ marginBottom: 0 }}
            >
              <Input
                id="discount"
                name="discount"
                type="number"
                min={0}
                value={product.discount || ""}
                onChange={(event) => {
                  setProduct((currentProduct) => {
                    return {
                      ...currentProduct,
                      discount: parseInt(event.target.value) || 0,
                    };
                  });
                }}
                placeholder="Nhập phần trăm giảm giá"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Thể loại"
              validateStatus={productError.category ? "error" : ""}
              help={productError.category ? productMessage.category : ""}
              style={{ marginBottom: 0 }}
            >
              <Select
                id="category"
                value={product.category || undefined}
                placeholder="Chọn thể loại"
                onChange={(value) => {
                  setProduct({
                    ...product,
                    category: value,
                  });
                }}
                size="large"
                style={{ width: "100%" }}
              >
                {categories.map((category) => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Thương hiệu"
              validateStatus={productError.brand ? "error" : ""}
              help={productError.brand ? productMessage.brand : ""}
            >
              <Select
                id="brand"
                value={product.brand || undefined}
                placeholder="Chọn thương hiệu"
                onChange={(value) => {
                  setProduct({
                    ...product,
                    brand: value,
                  });
                }}
                size="large"
                style={{ width: "100%" }}
              >
                {brands.map((brand) => (
                  <Option key={brand._id} value={brand._id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Mô tả"
          validateStatus={productError.description ? "error" : ""}
          help={productError.description ? productMessage.description : ""}
          style={{ marginBottom: 0 }}
        >
          <Editor
            height="200px"
            setProduct={setProduct}
            product={product}
            onImageUploadBefore={handleImageUpload}
          />
        </Form.Item>
      </Form>
    </>
  );
}

export default CommonInformation;
