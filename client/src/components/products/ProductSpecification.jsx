import React from 'react';
import '@styles/product-specification.css';
import { Descriptions, Typography } from 'antd';

const { Title } = Typography;

const renderDescriptions = (title, data) => (
  <div className="mb-8">
    <Typography.Text className='text-lg! font-semibold!'>
      {title}
    </Typography.Text>
    <Descriptions
      column={1}
      size="middle"
      bordered
      className="custom-description border-none! mt-10! mb-30!"
      labelStyle={{ width: 220, fontWeight: 500 }}
      contentStyle={{ fontSize: 14 }}
    >
      {data.map((item) => (
        <Descriptions.Item label={item.label} key={item.label} className='bg-white! border-none!'>
          {item.value}
        </Descriptions.Item>
      ))}
    </Descriptions>
  </div>
);

const ProductSpecification = ({ product }) => {
  if (!product || !product.attributes) {
    return <p>Không có thông tin kỹ thuật.</p>;
  }

  const attributes = product.attributes || {};
  const categoryConfig = product.category || {};
  const groupNameMapping = {
    specifications: 'Thông số kỹ thuật',
    connectivity: 'Kết nối',
    'camera.front': 'Camera trước',
    'camera.rear': 'Camera sau',
  };

  // Hàm để lấy giá trị từ attributes
  const getAttributeValue = (key) => {
    const value = attributes[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }

    return null;
  };

  const createFieldGroups = () => {
    const fieldGroups = {};

    if (
      !categoryConfig.configFields.extraFields ||
      !Array.isArray(categoryConfig.configFields.extraFields)
    ) {
      return fieldGroups;
    }

    categoryConfig.configFields.extraFields.forEach((field) => {
      const groupKey = field.group;
      const groupName = groupNameMapping[groupKey] || groupKey;

      if (!fieldGroups[groupName]) {
        fieldGroups[groupName] = {
          fields: [],
        };
      }

      const fieldConfig = {
        key: field.name,
        label: field.label,
      };

      if (field.type === 'checkbox') {
        fieldConfig.transform = (value) => (value ? 'Có' : 'Không');
      }

      fieldGroups[groupName].fields.push(fieldConfig);
    });

    return fieldGroups;
  };

  const fieldGroups = createFieldGroups();
  const generateGroupData = (groupConfig) => {
    const data = [];

    groupConfig.fields.forEach((field) => {
      const value = getAttributeValue(field.key);

      if (value !== null && value !== undefined) {
        let displayValue = value;
        if (field.transform && typeof field.transform === 'function') {
          displayValue = field.transform(value);
        }

        data.push({
          label: field.label,
          value: displayValue || 'Đang cập nhật',
        });
      }
    });

    return data;
  };

  // Render các nhóm chỉ khi có dữ liệu
  const renderGroups = () => {
    return Object.entries(fieldGroups).map(([groupName, groupConfig]) => {
      const groupData = generateGroupData(groupConfig);

      // Chỉ render nhóm nếu có dữ liệu
      if (groupData.length > 0) {
        return (
          <div key={groupName}>{renderDescriptions(groupName, groupData)}</div>
        );
      }
      return null;
    });
  };

  const renderExtraFields = () => {
    const usedKeys = new Set();
    Object.values(fieldGroups).forEach((group) => {
      group.fields.forEach((field) => {
        usedKeys.add(field.key);
      });
    });

    const extraFields = [];

    // Duyệt qua tất cả attributes để tìm các trường chưa sử dụng
    Object.entries(attributes).forEach(([key, value]) => {
      if (
        !usedKeys.has(key) &&
        value !== null &&
        value !== undefined &&
        value !== ''
      ) {
        // Tạo label từ key
        const label = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());

        let displayValue = value;
        if (Array.isArray(value)) {
          displayValue = value.join(', ');
        } else if (typeof value === 'boolean') {
          displayValue = value ? 'Có' : 'Không';
        }

        extraFields.push({
          label: label,
          value: displayValue,
        });
      }
    });

    if (extraFields.length > 0) {
      return renderDescriptions('Thông tin khác', extraFields);
    }
    return null;
  };

  return (
    <div>
      <Typography.Title level={3} className='mb-20!'>Thông số cấu hình</Typography.Title>
      {renderGroups()}
      {renderExtraFields()}
    </div>
  );
};

export default ProductSpecification;
