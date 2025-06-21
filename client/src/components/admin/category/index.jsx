import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { callCreateCategory, callFetchCategories, callUpdateCategory } from '@/services/apis';

const ModalCategory = (props) => {
  const { setOpenModal, reloadTable, dataInit, setDataInit, visible } = props;
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
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
    const { name, description } = values;
    const categoryData = {
      name: name,
      description: description,
    };
    if (dataInit?._id) {
      categoryData._id = dataInit._id;
    }
    const res = dataInit?._id
      ? await callUpdateCategory(categoryData)
      : await callCreateCategory(categoryData);
    if (res.data) {
      message.success(
        dataInit?._id ? 'Category updated successfully.' : 'Category created successfully.',
      );
      setOpenModal(false);
      reloadTable();
    } else {
      message.error('Failed to create category.');
    }
  };
  return (
    <Modal
      title={dataInit?._id ? 'Update Category' : 'Create Category'}
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
        initialValues={{ modifier: 'public' }}
      >
        <Form.Item
          name="name"
          label="Category Name"
          rules={[
            {
              required: true,
              message: 'Please input the name of the category!',
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
              message: 'Please input the description of the category!',
            },
          ]}
        >
          <Input.TextArea type="textarea" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalCategory;
