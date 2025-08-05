import { CameraOutlined, WifiOutlined } from '@ant-design/icons';
import { Avatar, Card, Descriptions, Space, Tag, Typography } from 'antd';
const { Text } = Typography;
export const ExpandedRowRender = ({ record }) => {
  const groupNameMapping = {
    specifications: 'Thông số kỹ thuật',
    connectivity: 'Kết nối',
    'camera.front': 'Camera trước',
    'camera.rear': 'Camera sau',
  };

  const getAttributeValue = (key) => {
    const value = record.attributes?.[key];

    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
    return null;
  };

  const createFieldGroups = () => {
    const fieldGroups = {};

    if (
      !record.category?.configFields?.extraFields ||
      !Array.isArray(record.category?.configFields.extraFields)
    ) {
      return fieldGroups;
    }

    record.category.configFields.extraFields.forEach((field) => {
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
        type: field.type,
      };

      fieldGroups[groupName].fields.push(fieldConfig);
    });

    return fieldGroups;
  };

  // Hàm render giá trị dựa trên type
  const renderFieldValue = (field, value) => {
    switch (field.type) {
      case 'checkbox':
        return value ? 'Có' : 'Không';

      case 'text':
      default:
        if (Array.isArray(value)) {
          return value.join(', ');
        }
        return value || 'Đang cập nhật';
    }
  };

  // Hàm render một nhóm fields
  const renderFieldGroup = (groupName, groupConfig) => {
    const groupData = [];

    groupConfig.fields.forEach((field) => {
      const value = getAttributeValue(field.key);

      if (value !== null && value !== undefined) {
        const displayValue = renderFieldValue(field, value);

        groupData.push({
          label: field.label,
          value: displayValue,
          key: field.key,
        });
      }
    });

    // Chỉ render nhóm nếu có dữ liệu
    if (groupData.length === 0) {
      return null;
    }

    return (
      <Descriptions
        key={groupName}
        title={groupName}
        size="small"
        bordered
        column={1}
        style={{ marginBottom: 10 }}
      >
        {groupData.map((item) => (
          <Descriptions.Item key={item.key} label={item.label}>
            {item.value}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  // Hàm render các field chưa được sử dụng
  const renderExtraFields = () => {
    const fieldGroups = createFieldGroups();
    const usedKeys = new Set();

    // Collect all keys đã sử dụng
    Object.values(fieldGroups).forEach((group) => {
      group.fields.forEach((field) => {
        usedKeys.add(field.key);
      });
    });

    const extraFields = [];

    // Duyệt qua tất cả attributes để tìm các trường chưa sử dụng
    if (record.attributes) {
      Object.entries(record.attributes).forEach(([key, value]) => {
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
            key: key,
          });
        }
      });
    }

    if (extraFields.length > 0) {
      return (
        <Descriptions title="Thông tin khác" size="default" bordered column={1}>
          {extraFields.map((item) => (
            <Descriptions.Item key={item.key} label={item.label}>
              <Text>{item.value}</Text>
            </Descriptions.Item>
          ))}
        </Descriptions>
      );
    }
    return null;
  };

  // Tạo fieldGroups từ category config
  const fieldGroups = createFieldGroups();

  return (
    <Card
      size="small"
      style={{
        margin: '10px 0',
        borderRadius: 12,
      }}
    >
      {/* Render các nhóm từ category config */}
      {Object.entries(fieldGroups).map(([groupName, groupConfig]) =>
        renderFieldGroup(groupName, groupConfig),
      )}

      {/* Render các field chưa được sử dụng */}
      {renderExtraFields()}

      {/* Cổng kết nối - nếu có */}
      {record.connectivity?.ports && record.connectivity.ports.length > 0 && (
        <Descriptions title="Cổng kết nối" size="small" bordered column={1}>
          <Descriptions.Item label="Cổng kết nối" span={1}>
            <Space wrap>
              {record.connectivity.ports.map((port, index) => (
                <Tag key={index} color="geekblue">
                  {port}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      )}

      {/* Các phiên bản */}
      {record.variants?.length > 0 && (
        <Descriptions title="Các phiên bản" size="small" bordered column={1}>
          {record.variants.map((variant, index) => (
            <Descriptions.Item
              key={index}
              label={
                <Avatar
                  shape="square"
                  size={160}
                  src={variant.images?.[0]}
                  alt={`Variant ${index + 1}`}
                  style={{
                    borderRadius: 12,
                    border: `2px solid #E2E8F0`,
                  }}
                />
              }
              labelStyle={{
                width: 100,
                padding: 20,
                textAlign: 'center',
              }}
            >
              <Space size="large" align="start">
                <div>
                  <Space direction="vertical" size="small">
                    <Text strong style={{ fontSize: 16, color: '#0F172A' }}>
                      {variant.name}
                    </Text>
                    <Tag
                      style={{
                        fontSize: 14,
                        padding: '4px 12px',
                        backgroundColor: '#EF4444',
                        color: '#FEFEFE',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 600,
                      }}
                    >
                      {`${variant.price?.toLocaleString()} VND`}
                    </Tag>

                    {variant.color && (
                      <Space>
                        <Text>Màu:</Text>
                        <Tag
                          style={{
                            backgroundColor: variant.color.hex,
                            color: '#FEFEFE',
                            border: 'none',
                            borderRadius: 6,
                          }}
                        >
                          {variant.color.name}
                        </Tag>
                        <Tag
                          style={{
                            backgroundColor: '#F1F5F9',
                            color: '#0F172A',
                            border: `1px solid #CBD5E1`,
                            borderRadius: 6,
                          }}
                        >
                          {variant.color.hex}
                        </Tag>
                      </Space>
                    )}

                    {variant.memory && (
                      <Space direction="vertical" size={1}>
                        <Text style={{ color: '#475569' }}>
                          RAM: {variant.memory?.ram}
                        </Text>
                        <Text style={{ color: '#475569' }}>
                          Storage: {variant.memory.storage}
                        </Text>
                      </Space>
                    )}
                  </Space>
                </div>
              </Space>
            </Descriptions.Item>
          ))}
        </Descriptions>
      )}
    </Card>
  );
};
