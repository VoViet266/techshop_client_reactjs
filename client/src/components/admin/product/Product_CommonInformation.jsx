import { useEffect, useCallback } from 'react';
import { Editor } from '@components/app';
import { Input, Select, Typography, Row, Col, Form, Switch } from 'antd';
import Files from '@services/files';
import { useAppContext } from '@/contexts';

const { Option } = Select;

function CommonInformation({
  brands,
  categories,
  product,
  form,
  onCategoryChange,
}) {
  const { message } = useAppContext();
  const handleImageUpload = useCallback(async (files, uploadHandler) => {
    try {
      const file = files[0];
      if (!file) throw new Error('No file selected');

      const imageUrl = await Files.upload(file);
      if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
        uploadHandler({
          result: [{ url: imageUrl, name: file.name, size: file.size }],
        });
      } else {
        throw new Error('Invalid image URL');
      }
    } catch (error) {
      message.error('Có lỗi khi upload hình ảnh', error);
      console.error('Image upload failed:', error);
    }
  }, []);
  useEffect(() => {
    if (product) {
      form.setFieldsValue({ description: product.description });
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
        <Col span={5}>
          <Form.Item name="name" label="Tên sản phẩm">
            <Input placeholder="Nhập tên sản phẩm" size="large" />
          </Form.Item>
        </Col>

        <Col span={5}>
          <Form.Item name="discount" label="Giảm giá">
            <Input
              type="number"
              min={0}
              placeholder="Nhập phần trăm giảm giá"
              size="large"
            />
          </Form.Item>
        </Col>
        <Col span={5}>
          <Form.Item name="category" label="Thể loại">
            <Select
              placeholder="Chọn thể loại"
              size="large"
              onChange={onCategoryChange}
            >
              {categories.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={5}>
          <Form.Item name="brand" label="Thương hiệu">
            <Select placeholder="Chọn thương hiệu" size="large">
              {brands.map((brand) => (
                <Option key={brand._id} value={brand._id}>
                  {brand.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={4}>
          <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="description" label="Mô tả">
        <Editor
          product={product}
          setProduct={(val) => form.setFieldValue('description', val)}
          value={form.getFieldValue('description')} // Lấy value từ form
          height="300px"
          onImageUploadBefore={handleImageUpload}
        />
      </Form.Item>
    </>
  );
}

export default CommonInformation;
