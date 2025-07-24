import React from 'react';
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
      </Row>

      <Row gutter={16}>
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
        <Col span={12}>
          <Form.Item
            name="variantId"
            label="Biến thể"
            rules={[{ required: true, message: 'Vui lòng chọn biến thể' }]}
          >
            <Select placeholder="Chọn biến thể" disabled={!selectedProduct}>
              {selectedProduct?.variants?.map((variant) => (
                <Option key={variant._id} value={variant._id}>
                  {variant.name}
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
