import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, Select, message, Row, Col } from 'antd';
import { callCreateBranch, callFetchBranches, callUpdateBranch } from '@/services/apis';

const ModalBranch = (props) => {
  const { setOpenModal, reloadTable, dataInit, setDataInit, visible } = props;
  const [form] = Form.useForm();
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await callFetchBranches();
        setBranches(response.data.data.result);
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    if (dataInit?._id) {
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        address: dataInit.address,
        email: dataInit.email,
        phone: dataInit.phone,
        manager: dataInit.manager,
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

  const submitBranch = async (values) => {
    const branchData = { ...values };
    if (dataInit?._id) {
      branchData._id = dataInit._id;
    }
    const res = dataInit?._id
      ? await callUpdateBranch(branchData)
      : await callCreateBranch(branchData);
    if (res.data) {
      message.success(
        dataInit?._id ? 'Branch updated successfully.' : 'Branch created successfully.',
      );
      setOpenModal(false);
      reloadTable();
    } else {
      message.error('Failed to save branch.');
    }
  };

  return (
    <Modal
      title={dataInit?._id ? 'Update Branch' : 'Create Branch'}
      visible={visible}
      onCancel={handleReset}
      onOk={form.submit}
      destroyOnClose={true}
    >
      <Form form={form} onFinish={submitBranch} layout="vertical" name="form_in_modal">
        <Form.Item
          name="name"
          label="Branch Name"
          rules={[
            { required: true, message: 'Please input the branch name!' },
            {
              min: 5,
              message: 'Branch name must be at least 5 characters!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: 'Please input the address!' }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Phone"
              rules={[
                { required: true, message: 'Please input the phone number!' },
                {
                  pattern: /^[\d\-\s]+$/,
                  message: 'Invalid phone number format!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please input the email!' },
                {
                  type: 'email',
                  message: 'Invalid email format!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="manager"
          label="Manager"
          rules={[{ required: true, message: 'Please input the manager name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="isActive"
          label="Status"
          rules={[{ required: true, message: 'Please select a status!' }]}
        >
          <Select>
            <Select.Option value={true}>Hoạt động</Select.Option>
            <Select.Option value={false}>Ngưng hoạt động</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalBranch;
