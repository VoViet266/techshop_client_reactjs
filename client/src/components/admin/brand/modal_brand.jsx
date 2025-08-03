import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, message, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import {
  callCreateBrand,
  callFetchBrands,
  callUpdateBrand,
} from '@/services/apis';
import Files from '@/services/files';

const ModalBrand = (props) => {
  const { setOpenModal, reloadTable, dataInit, setDataInit, visible } = props;
  const [form] = Form.useForm();
  const [, setBrands] = useState([]);
  const [loadingUpload] = useState(false);
  const [logoImage, setLogoImage] = useState([]);
  const [imagesDelete, setImagesDelete] = useState([]);

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
    setLogoImage([]);
    setImagesDelete([]);
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

    // Xóa ảnh cũ từ storage nếu có
    if (imagesDelete.length > 0) {
      await Promise.all(
        imagesDelete.map(async (image) => {
          try {
            await Files.callDelete(image.url);
          } catch (error) {
            console.error('Xóa ảnh thất bại', error);
          }
        }),
      );
    }

    // Xử lý logo
    if (logoImage.length === 0) {
      // Không có ảnh nào được chọn - xóa logo trong DB
      brandData.logo = null;
    } else if (logoImage[0]?.originFileObj) {
      // Upload ảnh mới
      const filePathLogo = await Files.upload(logoImage[0]?.originFileObj);
      brandData.logo = filePathLogo.data.data.filePath;
    } else if (logoImage[0]?.url) {
      // Giữ nguyên ảnh cũ
      brandData.logo = logoImage[0]?.url;
    }

    try {
      // Gọi API update hoặc create
      const res = dataInit?._id
        ? await callUpdateBrand(brandData)
        : await callCreateBrand(brandData);

      if (res.data) {
        message.success(
          dataInit?._id
            ? 'Thương hiệu cập nhật thành công.'
            : 'Thêm thương hiệu thành công.',
        );

        handleReset();
        reloadTable();
      }
    } catch (error) {
      console.error(error);
      message.error(
        dataInit?._id ? 'Update brand failed.' : 'Create brand failed.',
      );
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
      title={dataInit?._id ? 'Cập nhật thương hiệu' : 'Tạo thương hiệu'}
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
            // Chỉ lưu file vào imagesDelete, không xóa ngay trên cloud
            onRemove={(file) => {
              setImagesDelete((prev) => [...prev, file]);
            }}
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
              message: 'Vui lòng nhập tên thương hiệu!',
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
              message: 'Vui lòng nhập mô tả của thương hiệu!',
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
