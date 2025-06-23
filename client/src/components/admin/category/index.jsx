import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message, Switch } from 'antd';
import {
  callCreateCategory,
  callFetchCategories,
  callUpdateCategory,
} from '@/services/apis';
import useMessage from '@/hooks/useMessage';

const ModalCategory = (props) => {
  const { setOpenModal, reloadTable, dataInit, setDataInit, visible } = props;
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const { success, error } = useMessage();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await callFetchCategories();
        setCategories(response.data.data.result);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (dataInit?._id) {
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        description: dataInit.description,
        isActive: dataInit.isActive,
      });
    } else {
      form.resetFields();
    }
  }, [dataInit, form]);
  const handleReset = () => {
    form.resetFields();
    setOpenModal(false);
    setDataInit(null);
  };
  const submitCategory = async (values) => {
    const { name, description, isActive } = values;

    const categoryData = {
      name: name,
      description: description,
      isActive: isActive,
    };
    if (dataInit?._id) {
      categoryData._id = dataInit._id;
    }
    try {
      const res = dataInit?._id
        ? await callUpdateCategory(categoryData)
        : await callCreateCategory(categoryData);
      if (res.data) {
        success(
          dataInit?._id
            ? 'Cập nhật danh mục thành công'
            : 'Tạo danh mục mới thành cong',
        );
        setOpenModal(false);
        handleReset();
        reloadTable();
      }
    } catch (error) {
      error('Failed to create category');
      console.error('Failed to create category:', error);
    }
  };
  return (
    <Modal
      title={dataInit?._id ? 'Cập nhật danh mục' : 'Tạo danh mục'}
      visible={visible}
      onCancel={() => handleReset()}
      onOk={form.submit}
      destroyOnClose={true}
    >
      <Form
        form={form}
        onFinish={submitCategory}
        layout="vertical"
        name="form_in_modal"
        initialValues={{
          modifier: 'public',
          isActive: dataInit?.isActive ?? true,
        }}
      >
        <Form.Item
          name="name"
          label="Tên danh mục"
          rules={[
            {
              required: true,
              message: 'Hãy nhập tên danh mục!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            {
              required: true,
              message: 'Hãy nhập mô tả!',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked">
          <Switch checkedChildren="Kích hoạt" unCheckedChildren="Ngưng" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalCategory;
