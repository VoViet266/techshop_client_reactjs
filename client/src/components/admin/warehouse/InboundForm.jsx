import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Select, Input, InputNumber, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { hasPermission } from '@/helpers';
import { Actions, Subjects } from '@/constants/permissions';

const { Option } = Select;
const { TextArea } = Input;

const InboundForm = ({
  permissions,
  form,
  inbound,
  branches,
  selectedProduct,
  setProductSearchVisible,
  handleAddItem,
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Reset variant và màu khi đổi sản phẩm
  useEffect(() => {
    if (!selectedProduct) {
      setSelectedVariant(null);
      form.setFieldsValue({
        variant: undefined,
        variantColor: undefined,
      });
    }
  }, [selectedProduct, form]);

  // Xử lý khi chọn biến thể
  const handleVariantChange = (variantId, option) => {
    const variant = option.variantData;
    setSelectedVariant(variant);

    // Reset màu đã chọn khi đổi biến thể
    form.setFieldsValue({
      variantColor: undefined,
    });

    console.log('Selected variant:', variant);
  };

  // Lấy các màu của biến thể đã chọn
  const getColorsForSelectedVariant = () => {
    if (!selectedVariant || !selectedVariant.color) {
      return [];
    }
    return selectedVariant.color;
  };

  return (
    <Form form={form} layout="vertical">
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="branchId"
            label="Chi nhánh"
            rules={[{ required: true, message: 'Vui lòng chọn chi nhánh' }]}
          >
            <Select placeholder="Chọn chi nhánh">
              {branches.map((branch) => (
                <Option key={branch._id} value={branch._id}>
                  {branch.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Sản phẩm" name="productId">
            <Form.Item name="productId" style={{ display: 'none' }}>
              <Input type="hidden" />
            </Form.Item>
            <Input
              placeholder="Click để tìm kiếm sản phẩm"
              readOnly
              onClick={() => setProductSearchVisible(true)}
              value={selectedProduct?.name || ''}
              suffix={<SearchOutlined />}
              style={{ cursor: 'pointer' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="variant"
            label="Biến thể"
            rules={[{ required: true, message: 'Vui lòng chọn biến thể' }]}
          >
            <Select
              placeholder="Chọn biến thể"
              disabled={!selectedProduct}
              onChange={handleVariantChange}
              value={selectedVariant?._id}
            >
              {selectedProduct?.variants?.map((variant) => (
                <Option
                  key={variant._id}
                  value={variant._id}
                  variantData={variant}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span>{variant.name}</span>
                    {variant.memory && (
                      <span style={{ color: '#666', fontSize: '12px' }}>
                        ({variant.memory.ram}/{variant.memory.storage})
                      </span>
                    )}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="variantColor"
            label="Màu biến thể"
            rules={[{ required: true, message: 'Vui lòng chọn màu' }]}
          >
            <Select
              placeholder="Chọn màu"
              disabled={!selectedVariant}
              allowClear
            >
              {getColorsForSelectedVariant().map((color, index) => (
                <Option
                  key={`${selectedVariant._id}-${index}`}
                  value={color.colorName}
                >
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        backgroundColor: color.colorHex,
                        border: '1px solid #ccc',
                        borderRadius: '50%',
                      }}
                    />
                    {color.colorName}
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={7}>
          <Form.Item
            name="quantity"
            label="Số lượng"
            rules={[
              { required: true, message: 'Vui lòng nhập số lượng' },
              {
                type: 'number',
                min: 1,
                message: 'Số lượng phải lớn hơn 0',
              },
            ]}
          >
            <InputNumber
              placeholder="Nhập số lượng"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>
        </Col>
        <Col span={9}>
          <Form.Item name="cost" label="Giá vốn (tùy chọn)">
            <InputNumber
              placeholder="Để trống sẽ dùng giá mặc định"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              addonAfter="₫"
              style={{ width: '100%' }}
              min={0}
            />
          </Form.Item>
        </Col>
        <Col span={8} style={{ display: 'flex', alignItems: 'end' }}>
          <Form.Item>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              disabled={
                !hasPermission(permissions, Subjects.Inventory, Actions.Create)
              }
              onClick={handleAddItem}
              style={{ width: '100%' }}
            >
              Thêm
            </Button>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="note" label="Ghi chú">
        <TextArea placeholder="Ghi chú về phiếu ..." rows={3} />
      </Form.Item>
    </Form>
  );
};

export default InboundForm;
