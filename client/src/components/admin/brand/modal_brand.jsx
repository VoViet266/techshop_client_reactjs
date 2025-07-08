import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  callCreateBrand,
  callFetchBrands,
  callUpdateBrand,
  callUploadSingleImage,
} from '@/services/apis';
import Files from '@/services/files';

const ModalBrand = (props) => {
  const { setOpenModal, reloadTable, dataInit, setDataInit, visible } = props;
  const [form] = Form.useForm();
  const [, setBrands] = useState([]);
  const [loadingUpload] = useState(false);
  const [logoImage, setLogoImage] = useState([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await callFetchBrands();
        setBrands(response.data.data.result);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };
    fetchBrands();
  }, []);

  const handleReset = () => {
    form.resetFields();
    setDataInit(null);
    setOpenModal(false);
  };

  useEffect(() => {
    if (dataInit?._id) {
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        description: dataInit.description,
      });
      if (dataInit?.logo && typeof dataInit?.logo === 'string') {
        setLogoImage([{ uid: '-1', url: dataInit.logo }]);
      }
    } else {
      form.resetFields();
      setLogoImage([]);
    }
  }, [dataInit]);

  const submitBrand = async (values) => {
    const { name, description } = values;
    const brandData = {
      name,
      description,
    };
    if (dataInit?._id) {
      brandData._id = dataInit._id;
    }

    if (logoImage[0]?.originFileObj) {
      const filePathLogo = await Files.upload(logoImage[0]?.originFileObj);
      brandData.logo = filePathLogo.data.data.filePath;
    } else if (logoImage[0]?.url) {
      brandData.logo = logoImage[0]?.url;
    }

    const res = dataInit?._id
      ? await callUpdateBrand(brandData)
      : await callCreateBrand(brandData);
    if (res.data) {
      message.success(
        dataInit?._id
          ? 'Brand updated successfully.'
          : 'Brand created successfully.',
      );
      setOpenModal(false);
      reloadTable();
    } else {
      message.error('Failed to create brand.');
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const handleUploadFile = (fileList) => {
    setLogoImage(fileList);
  };

  return (
    <Modal
      title={dataInit?._id ? 'Update Brand' : 'Create Brand'}
      open={visible}
      onCancel={() => handleReset()}
      onOk={form.submit}
    >
      <Form
        form={form}
        onFinish={submitBrand}
        layout="vertical"
        name="form_in_modal"
        initialValues={{ modifier: 'public' }}
      >
        <Form.Item label="Logo" style={{ marginBottom: 16 }}>
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
            <div>{loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}</div>
          </Upload>
        </Form.Item>

        <Form.Item
          name="name"
          label="Brand Name"
          rules={[
            {
              required: true,
              message: 'Please input the name of the brand!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[
            {
              required: true,
              message: 'Please input the description of the brand!',
            },
          ]}
        >
          <Input.TextArea type="textarea" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalBrand;
