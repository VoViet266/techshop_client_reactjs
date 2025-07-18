// ...các import giữ nguyên...

import { useAppContext } from '@/contexts';
import { callCreateCategory, callUpdateCategory } from '@/services/apis';
import { PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Switch,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';

const ModalCategory = (props) => {
  const { setOpenModal, reloadTable, dataInit, setDataInit, visible } = props;
  const [form] = Form.useForm();
  const [logoImage, setLogoImage] = useState([]);
  const { message } = useAppContext();
  const [extraFields, setExtraFields] = useState([
    { label: '', name: '', type: 'text', group: 'specifications' },
  ]);

  const fieldTypes = [
    { label: 'Văn bản', value: 'text' },
    { label: 'Số', value: 'number' },
    { label: 'Chọn', value: 'select' },
    { label: 'Checkbox', value: 'checkbox' },
  ];

  const groupOptions = [
    { label: 'Thông số kỹ thuật', value: 'specifications' },
    { label: 'Kết nối', value: 'connectivity' },
    { label: 'Camera trước', value: 'camera.front' },
    { label: 'Camera sau', value: 'camera.rear' },
    { label: 'Khác', value: 'other' },
  ];

  useEffect(() => {
    if (dataInit?._id) {
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        description: dataInit.description,
        isActive: dataInit.isActive,
        configFields: dataInit.configFields || {},
      });

      if (dataInit?.configFields?.extraFields) {
        setExtraFields(dataInit.configFields.extraFields);
      }

      if (dataInit?.logo && typeof dataInit?.logo === 'string') {
        setLogoImage([{ uid: '-1', url: dataInit.logo }]);
      }
    } else {
      form.resetFields();
      setLogoImage([]);
      setExtraFields([
        { label: '', name: '', type: 'text', group: 'specifications' },
      ]);
    }
  }, [dataInit, form]);

  const handleReset = () => {
    form.resetFields();
    setOpenModal(false);
    setDataInit(null);
  };

  const submitCategory = async (values) => {
    const { name, description, isActive, configFields } = values;

    const categoryData = {
      name,
      description,
      isActive,
      configFields: {
        ...configFields,
        extraFields,
      },
    };

    if (dataInit?._id) categoryData._id = dataInit._id;

    if (logoImage[0]?.originFileObj) {
      const filePathLogo = await Files.upload(logoImage[0]?.originFileObj);
      categoryData.logo = filePathLogo;
    } else if (logoImage[0]?.url) {
      categoryData.logo = logoImage[0]?.url;
    }

    try {
      const res = dataInit?._id
        ? await callUpdateCategory(categoryData)
        : await callCreateCategory(categoryData);

      if (res.data) {
        message.success(
          dataInit?._id ? 'Cập nhật thành công' : 'Tạo mới thành công',
        );
        handleReset();
        reloadTable();
      }
    } catch (error) {
      console.error(error);
      message.error(dataInit?._id ? 'Cập nhật thất bại' : 'Tạo thất bại');
    }
  };

  const beforeUpload = (file) => {
    const isImage = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ].includes(file.type);
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isImage) message.error('Chỉ chấp nhận ảnh JPG/PNG');
    if (!isLt2M) message.error('Ảnh phải nhỏ hơn 2MB');
    return isImage && isLt2M;
  };

  const handleUploadFile = (fileList) => {
    setLogoImage(fileList);
  };

  return (
    <Modal
      title={dataInit?._id ? 'Cập nhật danh mục' : 'Tạo danh mục'}
      open={visible}
      width={900}
      onCancel={handleReset}
      onOk={form.submit}
    >
      <Form
        form={form}
        onFinish={submitCategory}
        layout="vertical"
        initialValues={{ isActive: dataInit?.isActive ?? true }}
      >
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[{ required: true, message: 'Hãy nhập tên danh mục!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Hãy nhập mô tả!' }]}
        >
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Trạng thái"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Logo">
              <Upload
                name="logo"
                listType="picture-card"
                maxCount={1}
                beforeUpload={beforeUpload}
                onRemove={() => setLogoImage([])}
                onChange={({ fileList }) => handleUploadFile(fileList)}
                fileList={logoImage}
                customRequest={({ onSuccess }) => onSuccess('ok')}
              >
                <div>{<PlusOutlined />}</div>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Cấu hình hiển thị</Divider>
        <Form.Item
          name={['configFields', 'specifications']}
          valuePropName="checked"
        >
          <Checkbox>Hiển thị Thông số kỹ thuật</Checkbox>
        </Form.Item>
        <Form.Item name={['configFields', 'camera']} valuePropName="checked">
          <Checkbox>Hiển thị Camera</Checkbox>
        </Form.Item>
        <Form.Item
          name={['configFields', 'connectivity']}
          valuePropName="checked"
        >
          <Checkbox>Hiển thị Kết nối</Checkbox>
        </Form.Item>

        <Divider orientation="left">Trường bổ sung</Divider>

        {extraFields.map((field, index) => (
          <Space
            key={index}
            style={{ display: 'flex', marginBottom: 8 }}
            align="baseline"
          >
            <Input
              placeholder="Label"
              value={field.label}
              onChange={(e) => {
                const updated = [...extraFields];
                updated[index].label = e.target.value;
                setExtraFields(updated);
              }}
            />
            <Input
              placeholder="Tên (name)"
              value={field.name}
              onChange={(e) => {
                const updated = [...extraFields];
                updated[index].name = e.target.value;
                setExtraFields(updated);
              }}
            />
            <Select
              placeholder="Kiểu"
              value={field.type}
              style={{ width: 120 }}
              onChange={(value) => {
                const updated = [...extraFields];
                updated[index].type = value;
                setExtraFields(updated);
              }}
              options={fieldTypes}
            />
            <Select
              placeholder="Thuộc nhóm"
              value={field.group}
              style={{ width: 160 }}
              onChange={(value) => {
                const updated = [...extraFields];
                updated[index].group = value;
                setExtraFields(updated);
              }}
              options={groupOptions}
            />
            <Checkbox
              checked={field.filterable}
              onChange={(e) => {
                const updated = [...extraFields];
                updated[index].filterable = e.target.checked;
                setExtraFields(updated);
              }}
            >
              Lọc được
            </Checkbox>
            <Button
              danger
              onClick={() => {
                const updated = extraFields.filter((_, i) => i !== index);
                setExtraFields(updated);
              }}
            >
              Xoá
            </Button>
          </Space>
        ))}

        <Button
          type="dashed"
          onClick={() =>
            setExtraFields([
              ...extraFields,
              { label: '', name: '', type: 'text', group: 'specifications' },
            ])
          }
          block
        >
          Thêm trường mới
        </Button>
      </Form>
    </Modal>
  );
};

export default ModalCategory;
