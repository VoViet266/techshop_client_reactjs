import React, { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  message,
  Row,
  Col,
  InputNumber, // [THÊM] Dùng InputNumber cho tọa độ
} from 'antd';
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
  const [branches, setBranches] = useState([]); // (Hình như state này không dùng?)
  const [managers, setManagers] = useState([]);
  const { success, error, warning } = useMessage();

  // (Hàm fetchBranches không thấy dùng, nhưng giữ nguyên)
  const fetchBranches = async () => {
    try {
      const response = await callFetchBranches();
      setBranches(response.data.data.result);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // (Hàm fetchManagers giữ nguyên)
  const fetchManagers = async () => {
    try {
      const response = await callFetchUsers();
      const allUsers = response.data.data;
      // [GÓP Ý] Nên filter theo role cụ thể, ví dụ: user.role === 'manager'
      const onlyManagers = allUsers.filter((user) => {
        return user.role;
      });
      setManagers(onlyManagers);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  useEffect(() => {
    // fetchBranches(); // (Bạn có thể bỏ dòng này nếu không dùng)
    fetchManagers();
  }, []);

  // [SỬA] Cập nhật useEffect để xử lý `location`
  useEffect(() => {
    if (dataInit?._id) {
      // --- BẮT ĐẦU SỬA ---
      // 1. Chuẩn bị dữ liệu location cho form
      // dataInit.location từ API là: { type: 'Point', coordinates: [lng, lat] }
      let locationForForm = {
        longitude: undefined,
        latitude: undefined,
      };

      if (dataInit.location && dataInit.location.coordinates) {
        locationForForm = {
          longitude: dataInit.location.coordinates[0],
          latitude: dataInit.location.coordinates[1],
        };
      }

      // 2. Set giá trị cho form
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        address: dataInit.address,
        email: dataInit.email,
        phone: dataInit.phone,
        manager: dataInit.manager?._id || dataInit.manager,
        isActive: dataInit.isActive,
        location: locationForForm, // Gán object location đã chuẩn bị
      });
      // --- KẾT THÚC SỬA ---
    } else {
      form.resetFields();
    }
  }, [dataInit, form]);

  const handleReset = () => {
    form.resetFields();
    setOpenModal(false);
    setDataInit(null);
  };

  // [KHÔNG CẦN SỬA] Hàm submit này đã đúng
  const submitBranch = async (values) => {
    // Nhờ đặt tên Form.Item lồng nhau (name=['location', 'longitude']),
    // 'values' từ Ant Design sẽ tự động có dạng:
    // { name: "...", location: { longitude: 105.7, latitude: 10.0 } }
    // Đây chính là DTO mà backend cần!
    const branchData = { ...values };

    if (dataInit?._id) {
      branchData._id = dataInit._id;
    }

    try {
      const res = dataInit?._id
        ? await callUpdateBranch(branchData._id, branchData) // [GÓP Ý] API update thường nhận (id, data)
        : await callCreateBranch(branchData);

      if (res.data) {
        success(
          dataInit?._id
            ? 'Cập nhật chi nhánh thành công!'
            : 'Tạo chi nhánh mới thành công',
        );
        handleReset(); // Dùng lại hàm reset
        reloadTable();
      } else {
        error('Lưu thông tin chi nhánh thất bại!');
      }
    } catch (apiError) {
      error(apiError.response?.data?.message || 'Lưu thông tin thất bại!');
    }
  };

  return (
    <Modal
      title={dataInit?._id ? 'Cập nhật chi nhánh' : 'Tạo chi nhánh mới'}
      open={visible} // Sửa 'visible' thành 'open' cho antd v5+
      onCancel={handleReset}
      onOk={form.submit}
      destroyOnClose={true}
      maskClosable={false} // Chống bấm ra ngoài
      width={600} // Thêm độ rộng cho form
    >
      <Form
        form={form}
        onFinish={submitBranch}
        layout="vertical"
        name="form_in_modal"
      >
        {/* (Các trường name, address, phone, email, manager, isActive giữ nguyên) */}
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
                  pattern: /^[0-9\-\s+]+$/, // Sửa pattern
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
          initialValue={true} // Set giá trị mặc định khi tạo mới
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
        >
          <Select>
            <Select.Option value={true}>Hoạt động</Select.Option>
            <Select.Option value={false}>Ngưng hoạt động</Select.Option>
          </Select>
        </Form.Item>

        {/* --- [THÊM] Form Item cho Location --- */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Kinh độ (Longitude)"
              name={['location', 'longitude']} // Tên lồng nhau
              rules={[{ required: true, message: 'Kinh độ là bắt buộc!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="VD: 105.7706"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Vĩ độ (Latitude)"
              name={['location', 'latitude']} // Tên lồng nhau
              rules={[{ required: true, message: 'Vĩ độ là bắt buộc!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="VD: 10.0279"
              />
            </Form.Item>
          </Col>
        </Row>
      
      </Form>
    </Modal>
  );
};

export default ModalBranch;
