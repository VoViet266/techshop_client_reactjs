import React, { useEffect, useState } from 'react';

import {
  Table,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Input,
  message,
  Tooltip,
  Tag,
  Flex,
  Modal,
  Avatar,
  Empty,
  Form,
  Upload,
  Image,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  AppstoreOutlined,
  SearchOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import ModalBrand from '../../../components/admin/brand/modal_brand';
import {
  callFetchBrands,
  callDeleteBrand,
  callUploadSingleImage,
  callUpdateBrand,
  callCreateBrand,
} from '@/services/apis';
import useMessage from '@/hooks/useMessage';
import TextArea from 'antd/es/input/TextArea';
import Files from '@/services/files';

const { Title, Text, Paragraph } = Typography;

const BrandManagement = () => {
  const [form] = Form.useForm();
  const [brands, setBrands] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [dataInit, setDataInit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const { success, error, warning, contextHolder } = useMessage();
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await callFetchBrands();
      setBrands(response.data.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
      error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedRowKeys.map((id) => callDeleteBrand(id)));
      success(`Đã xóa ${selectedRowKeys.length} thương hiệu thành công`);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      setOpenModalDelete(false);

      fetchBrands();
    } catch (error) {
      console.error('Failed to delete brands:', error);
      error('Xóa thất bại');
    }
  };

  const reloadTable = async () => {
    setLoading(true);
    try {
      const response = await callFetchBrands();
      setBrands(response.data.data);
      message.success('Brands refreshed successfully');
    } catch (error) {
      console.error('Failed to reload brands:', error);
      error('Failed to refresh brands');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    console.log(dataInit);
    if (dataInit?._id) {
      form.setFieldsValue({
        _id: dataInit._id,
        name: dataInit.name,
        description: dataInit.description,
        logo: dataInit.logo,
      });
      if (dataInit?.logo && typeof dataInit?.logo === 'string') {
        setFileList([{ uid: '-1', url: dataInit.logo, status: 'done' }]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [dataInit, form]);

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 110,
      align: 'center',
      render: (text, record) => (
        <Image
          src={record.logo}
          alt={record.name}
          width={80}
          height={80}
          style={{
            cursor: 'pointer',
            objectFit: 'contain',
          }}
          preview={false}
          onClick={() => {
            setSelectedBrand(record);
            setPreviewVisible(true);
          }}
        />
      ),
    },
    {
      title: 'Tên thương hiệu',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) =>
        text ? (
          text.length > 100 ? (
            <Tooltip title={text}>{text.substring(0, 100)}...</Tooltip>
          ) : (
            text
          )
        ) : (
          <Text type="secondary" italic>
            No description
          </Text>
        ),
    },
    {
      title: 'Trạng thái',
      key: 'isActive',
      align: 'center',
      width: 120,
      render: (record) => (
        <Tooltip title="Đang hoạt động">
          {record.isActive ? ' Còn hoạt động' : 'Ngưng hoạt động'}
        </Tooltip>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          size="small"
          style={{ padding: 0 }}
          onClick={() => {
            setSelectedBrand(record);
            setPreviewVisible(true);
          }}
        />
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys, selectedRows) => {
      setSelectedRowKeys(selectedKeys);
      setSelectedRows(selectedRows);
    },
  };
  const uploadFile = async (file) => {
    try {
      const response = await Files.upload(file);
      return response;
    } catch (error) {
      error('Có lỗi khi upload hình ảnh', error);
      throw error;
    }
  };
  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      let logoUrl = '';
      if (fileList.length > 0) {
        const file = fileList[0];

        if (file.originFileObj) {
          logoUrl = await uploadFile(file.originFileObj);
        } else if (file.url) {
          logoUrl = file.url;
        }
      }

      if (dataInit) {
        await callUpdateBrand({
          _id: dataInit._id,
          name: values.name,
          description: values.description,
          logo: dataInit.logo,
        });
        success('Cập nhật thương hiệu thành công');
      } else {
        await callCreateBrand({
          name: values.name,
          description: values.description,
          logo: logoUrl,
        });
        success('Tạo thương hiệu mới thành công');
      }

      handleCancel();
      reloadTable();
    } catch (error) {
      console.error('Failed to save brand:', message.error);
      error('Lưu thương hiệu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ có thể upload file hình ảnh!');
      return Upload.LIST_IGNORE;
    }

    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Kích thước file phải nhỏ hơn 2MB!');
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setPreviewOpen(false);
    setPreviewImage('');
    setOpenModal(false);
    setDataInit(null);
  };
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <>
      {contextHolder}
      <Modal
        title="Xóa thương hiệu"
        open={openModalDelete}
        onCancel={() => setOpenModalDelete(false)}
        onOk={handleBulkDelete}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        style={{ top: 20, zIndex: 9999 }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}
        >
          <ExclamationCircleOutlined
            style={{ color: '#ff4d4f', fontSize: 22, marginRight: 8 }}
          />
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            Xác nhận xóa thương hiệu
          </span>
        </div>
        <div>
          <p>
            Bạn có chắc là muốn xóa {selectedRowKeys.length} thương hiệu đã
            chọn?
          </p>
        </div>
      </Modal>

      <Card
        style={{ borderRadius: 8, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)' }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <AppstoreOutlined style={{ marginRight: 8 }} />
              Danh sách các thương hiệu
            </Title>
          </Col>
        </Row>

        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col xs={24} sm={12} md={6}>
            <Input
              placeholder="Tìm kiếm thương hiệu, mô tả..."
              prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{
                borderRadius: 8,
                border: `1px solid #CBD5E1`,
              }}
            />
          </Col>

          <Col xs={24} sm={12} md={12}>
            <Flex gap={8} wrap="wrap" justify="end">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{
                  backgroundColor: 'rgb(11, 162, 36)',
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                }}
                onClick={() => {
                  setDataInit(null);
                  setOpenModal(true);
                }}
              >
                Thêm thương hiệu
              </Button>

              <Button
                type="primary"
                disabled={selectedRowKeys.length !== 1}
                icon={<EditOutlined />}
                onClick={() => {
                  setDataInit(selectedRows[0]);
                  setOpenModal(true);
                }}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  boxShadow:
                    selectedRowKeys.length === 1
                      ? '0 2px 8px rgba(79, 70, 229, 0.2)'
                      : 'none',
                }}
              >
                Sửa ({selectedRowKeys.length})
              </Button>

              <Button
                danger
                onClick={() => setOpenModalDelete(true)}
                disabled={selectedRowKeys.length === 0}
                icon={<DeleteOutlined />}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  borderColor:
                    selectedRowKeys.length > 0 ? '#EF4444' : undefined,
                  boxShadow:
                    selectedRowKeys.length > 0
                      ? '0 2px 8px rgba(239, 68, 68, 0.2)'
                      : 'none',
                }}
              >
                Xóa ({selectedRowKeys.length})
              </Button>

              <Button
                icon={<ReloadOutlined />}
                onClick={reloadTable}
                loading={loading}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                Làm mới
              </Button>
            </Flex>
          </Col>
        </Row>

        <Table
          loading={loading}
          rowKey={(record) => record._id}
          rowSelection={rowSelection}
          dataSource={filteredBrands}
          columns={columns}
          bordered
          size="middle"
          pagination={{
            defaultPageSize: 10,
          }}
          locale={{
            emptyText: (
              <Empty
                description="Không tìm thấy thương hiệu nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={selectedBrand?.name}
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="back" onClick={() => setPreviewVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setDataInit(selectedBrand);
              setOpenModal(true);
              setPreviewVisible(false);
            }}
          >
            Chỉnh sửa
          </Button>,
        ]}
        width={600}
      >
        {selectedBrand && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Avatar
              src={selectedBrand.logo}
              alt={selectedBrand.name}
              shape="square"
              size={120}
              style={{ marginBottom: 16 }}
            />
            <div style={{ width: '100%' }}>
              <Title level={5}>Mô tả</Title>
              <Paragraph>
                {selectedBrand.description || 'Không có mô tả.'}
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        title={dataInit ? 'Cập nhật thương hiệu' : 'Tạo thương hiệu mới'}
        open={openModal}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={() => form.submit()}
          >
            {dataInit ? 'Cập nhật' : 'Tạo mới'}
          </Button>,
        ]}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Tên thương hiệu"
                name="name"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên thương hiệu!',
                  },
                ]}
              >
                <Input placeholder="Nhập tên thương hiệu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Mô tả" name="description">
                <TextArea rows={4} placeholder="Nhập mô tả thương hiệu" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Logo thương hiệu">
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onPreview={handlePreview}
                  onChange={handleChange}
                  beforeUpload={beforeUpload}
                  maxCount={1}
                >
                  {fileList.length >= 1 ? null : uploadButton}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Image
        // wrapperStyle={{
        //   display: 'none',
        // }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          afterOpenChange: (visible) => !visible && setPreviewImage(''),
        }}
        src={previewImage}
      />
    </>
  );
};

export default BrandManagement;
