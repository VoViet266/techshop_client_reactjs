import React, { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Row,
  Col,
  DatePicker,
  InputNumber,
  Switch,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { callCreateBanners, callUpdateBanners } from '@/services/apis';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ModalBanner = (props) => {
  const { openModal, reloadTable, dataInit, setDataInit, setOpenModal } = props;
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (dataInit?._id) {
      form.setFieldsValue({
        ...dataInit,
        dateRange: [dayjs(dataInit.startDate), dayjs(dataInit.endDate)],
      });
      setFileList([
        {
          uid: '-1',
          name: 'image.png',
          status: 'done',
          url: dataInit.imageUrl,
        },
      ]);
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [dataInit, form]);

  const handleReset = () => {
    form.resetFields();
    setOpenModal(false);
    setDataInit(null);
    setFileList([]);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
      message.error('Chỉ được upload hình ảnh!');
      return Upload.LIST_IGNORE;
    }
    if (!isLt2M) {
      message.error('Kích thước phải dưới 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const handleSubmit = async (values) => {
    const { dateRange, ...rest } = values;
    const imageUrl = fileList[0]?.url || fileList[0]?.thumbUrl;

    const data = {
      ...rest,
      imageUrl,
      _id: dataInit?._id,
      startDate: dateRange?.[0]?.toISOString(),
      endDate: dateRange?.[1]?.toISOString(),
    };

    try {
      const res = dataInit?._id
        ? await callUpdateBanners(data)
        : await callCreateBanners(data);

      if (res.data) {
        message.success(
          dataInit?._id
            ? 'Cập nhật banner thành công!'
            : 'Tạo banner mới thành công!',
        );
        reloadTable();
        handleReset();
      } else {
        message.error('Lưu banner thất bại!');
      }
    } catch (err) {
      console.error(err);
      message.error('Đã xảy ra lỗi!');
    }
  };

  return (
    <Modal
      title={dataInit?._id ? 'Cập nhật Banner' : 'Tạo Banner mới'}
      open={openModal}
      onCancel={handleReset}
      onOk={form.submit}
      destroyOnClose
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        name="form_in_modal"
        onFinish={handleSubmit}
        initialValues={{
          isActive: true,
          priority: 1,
          position: 'header',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="title"
              label="Tiêu đề banner"
              rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
            >
              <Input placeholder="Nhập tiêu đề banner" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="position"
              label="Vị trí hiển thị"
              rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}
            >
              <Select>
                <Select.Option value="header">Header</Select.Option>
                <Select.Option value="sidebar">Sidebar</Select.Option>
                <Select.Option value="footer">Footer</Select.Option>
                <Select.Option value="popup">Popup</Select.Option>
                <Select.Option value="hero">Hero Section</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả">
          <TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Hình ảnh banner"
          name="imageUrl"
          rules={[{ required: true, message: 'Vui lòng upload hình ảnh!' }]}
        >
          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={handleChange}
            beforeUpload={beforeUpload}
            maxCount={1}
          >
            {fileList.length >= 1 ? null : (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          name="linkTo"
          label="Đường dẫn"
          rules={[
            { required: true, message: 'Vui lòng nhập đường dẫn!' },
            { type: 'url', message: 'Vui lòng nhập URL hợp lệ!' },
          ]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              rules={[{ required: true, message: 'Vui lòng nhập độ ưu tiên!' }]}
            >
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              name="dateRange"
              label="Thời gian hiển thị"
              rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
            >
              <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalBanner;
