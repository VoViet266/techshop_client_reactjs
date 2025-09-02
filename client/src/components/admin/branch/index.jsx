import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Input, Select, message, Row, Col } from 'antd';
import {
  callCreateBranch,
  callFetchBranches,
  callFetchUsers,
  callUpdateBranch,
} from '@/services/apis';
import useMessage from '@/hooks/useMessage';

const ModalBranch = (props) => {
  const { setOpenModal, reloadTable, dataInit, setDataInit, visible } = props;
  const [form] = Form.useForm();
  const [branches, setBranches] = useState([]);
  const [managers, setManagers] = useState([]);
  const { success, error, warning } = useMessage();
  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data.result);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };
  const fetchManagers = async () => {
    try {
      const response = await callFetchUsers();
      const allUsers = response.data.data;

      const onlyManagers = allUsers.filter((user) => {
        return user.role;
      });

      setManagers(onlyManagers);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchManagers();
  }, []);

  useEffect(() => {
    if (dataInit?._id) {
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        address: dataInit.address,
        email: dataInit.email,
        phone: dataInit.phone,
        manager: dataInit.manager?._id || dataInit.manager, // Lấy ID của manager
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
      success(
        dataInit?._id
          ? 'Cập nhật chi nhánh thành công!'
          : 'Tạo chi nhánh mới thành công',
      );
      setOpenModal(false);
      reloadTable();
    } else {
      error('Lưu thông tin chi nhánh thất bại!');
    }
  };

  return (
    <Modal
      title={dataInit?._id ? 'Cập nhật chi nhánh' : 'Tạo chi nhánh mới'}
      visible={visible}
      onCancel={handleReset}
      onOk={form.submit}
      destroyOnClose={true}
    >
      <Form
        form={form}
        onFinish={submitBranch}
        layout="vertical"
        name="form_in_modal"
      >
        <Form.Item
          name="name"
          label="Tên chi nhánh"
          rules={[
            { required: true, message: 'Vui lòng nhập tên chi nhánh!' },
            {
              min: 5,
              message: 'Tên chi nhánh phải có ít nhất 5 ký tự!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
        >
          <Input.TextArea rows={2} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: 'Vui lòng nhập số điện thoại!' },
                {
                  pattern: /^[\d\-\s]+$/,
                  message: 'Định dạng số điện thoại không hợp lệ!',
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
                { required: true, message: 'Vui lòng nhập email!' },
                {
                  type: 'email',
                  message: 'Định dạng email không hợp lệ!',
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          name="manager"
          label="Quản lý"
          rules={[{ required: true, message: 'Vui lòng chọn quản lý!' }]}
        >
          <Select
            placeholder="Chọn quản lý"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.children ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          >
            {managers.map((manager) => (
              <Select.Option key={manager._id} value={manager._id}>
                {manager.name} - {manager.email}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="isActive"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
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
