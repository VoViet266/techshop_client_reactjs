import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Divider,
  Typography,
  Select,
  Row,
  Col,
  Space,
  message,
  InputNumber,
  Switch,
  Card,
  Upload,
} from 'antd';
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  GoogleOutlined,
  CloseOutlined,
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import Users from '@services/users';
import Address from '@services/address';
import { useAppContext } from '@contexts';

const { Title, Link, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function Signup() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const {
    setMessage,
    setShowLogin,
    setShowSignup,
    setToastLoading,
    setLoadingError,
    setLoadingSuccess,
  } = useAppContext();

  useEffect(() => {
    document.title = 'TechShop | Đăng ký';
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const provincesData = await Address.getAllProvinces();
      setProvinces(provincesData);
    } catch (error) {
      message.error('Không thể tải danh sách tỉnh/thành phố');
    }
  };

  const fetchDistricts = async (provinceCode) => {
    try {
      const districtsData = await Address.getDistricts(provinceCode);
      setDistricts(districtsData);
    } catch (error) {
      message.error('Không thể tải danh sách quận/huyện');
    }
  };

  const fetchWards = async (districtCode) => {
    try {
      const wardsData = await Address.getWards(districtCode);
      setWards(wardsData);
    } catch (error) {
      message.error('Không thể tải danh sách xã/phường');
    }
  };

  const handleSignup = async (values) => {
    setLoading(true);
    try {
      // Transform form data to match DTO structure
      const userData = {
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone,
        gender: values.gender,
        age: values.age,
        avatar: values.avatar,
        role: ['user'], // Default role
        address: values.addresses || [],
      };

      await Users.signup(
        userData,
        {},
        setMessage,
        {},
        () => {},
        setShowLogin,
        setShowSignup,
        () => {},
        setToastLoading,
        setLoadingError,
        setLoadingSuccess,
      );

      message.success('Đăng ký thành công!');
    } catch (error) {
      message.error('Đăng ký thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    message.info('Tính năng đăng ký với Google đang được phát triển');
  };

  const uploadProps = {
    name: 'avatar',
    listType: 'picture-card',
    maxCount: 1,
    beforeUpload: (file) => {
      const isJpgOrPng =
        file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Chỉ được upload file JPG/PNG!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Ảnh phải nhỏ hơn 2MB!');
      }
      return false; // Prevent upload, handle manually
    },
  };

  return (
    <Modal
      open={true}
      onCancel={() => setShowSignup(false)}
      footer={null}
      width={800}
      centered
      closeIcon={
        <CloseOutlined
          style={{
            fontSize: 18,
            color: '#8c8c8c',
          }}
        />
      }
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <UserAddOutlined style={{ fontSize: 24, color: 'white' }} />

        <Title
          level={2}
          style={{ margin: 0, fontWeight: 600, alignItems: 'center' }}
        >
          Tạo tài khoản mới
        </Title>
      </Space>

      <div
        style={{
          padding: '30px 40px',

          maxHeight: '60vh',
          overflowY: 'auto',
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSignup}
          autoComplete="off"
          size="large"
        >
          {/* Avatar Upload */}
          <Form.Item
            label={
              <span style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>
                Ảnh đại diện
              </span>
            }
            name="avatar"
          >
            <Upload {...uploadProps}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh</div>
              </div>
            </Upload>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}
                  >
                    Họ và tên
                  </span>
                }
                name="name"
                rules={[
                  { required: true, message: 'Họ và tên không được để trống' },
                  { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự' },
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập họ và tên"
                  style={{ borderRadius: 8, padding: '10px 12px' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}
                  >
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: 'Email không được để trống' },
                  { type: 'email', message: 'Email không đúng định dạng' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập email"
                  style={{ borderRadius: 8, padding: '10px 12px' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <span style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}>
                Mật khẩu
              </span>
            }
            name="password"
            rules={[
              { required: true, message: 'Mật khẩu không được để trống' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="Nhập mật khẩu"
              iconRender={(visible) =>
                visible ? (
                  <EyeTwoTone twoToneColor="#667eea" />
                ) : (
                  <EyeInvisibleOutlined style={{ color: '#8c8c8c' }} />
                )
              }
              style={{ borderRadius: 8, padding: '10px 12px' }}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}
                  >
                    Số điện thoại
                  </span>
                }
                name="phone"
                rules={[
                  {
                    pattern: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ',
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                  placeholder="Nhập SĐT"
                  style={{ borderRadius: 8, padding: '10px 12px' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}
                  >
                    Giới tính
                  </span>
                }
                name="gender"
              >
                <Select
                  placeholder="Chọn giới tính"
                  style={{ borderRadius: 8 }}
                >
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                  <Option value="other">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}
                  >
                    Tuổi
                  </span>
                }
                name="age"
                rules={[
                  {
                    type: 'number',
                    min: 13,
                    max: 100,
                    message: 'Tuổi phải từ 13-100',
                  },
                ]}
              >
                <InputNumber
                  placeholder="Nhập tuổi"
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.List name="addresses">
            {(fields, { add, remove }) => (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{ fontSize: 14, fontWeight: 500, color: '#262626' }}
                  >
                    Địa chỉ
                  </span>
                  <Button
                    type="dashed"
                    onClick={() => add({ addressDetail: '', default: false })}
                    icon={<PlusOutlined />}
                    size="small"
                  >
                    Thêm địa chỉ
                  </Button>
                </div>

                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 16, borderRadius: 8 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    }
                  >
                    <Row gutter={16}>
                      <Col span={20}>
                        <Form.Item
                          {...restField}
                          name={[name, 'addressDetail']}
                          rules={[
                            {
                              required: true,
                              message: 'Vui lòng nhập địa chỉ',
                            },
                          ]}
                        >
                          <TextArea
                            placeholder="Nhập địa chỉ chi tiết"
                            rows={2}
                            style={{ borderRadius: 8 }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'default']}
                          valuePropName="checked"
                        >
                          <div style={{ textAlign: 'center', paddingTop: 8 }}>
                            <Switch size="small" />
                            <div
                              style={{
                                fontSize: 12,
                                color: '#8c8c8c',
                                marginTop: 4,
                              }}
                            >
                              Mặc định
                            </div>
                          </div>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button
              type="link"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 50,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 600,
                border: '2px solid #f0f0f0',
                backgroundColor: 'white',
                color: '#262626',
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider plain style={{ margin: '20px 0' }}>
            <span style={{ color: '#8c8c8c', fontSize: 14 }}>
              Hoặc tiếp tục với
            </span>
          </Divider>

          <Button
            icon={<GoogleOutlined style={{ fontSize: 16 }} />}
            onClick={handleGoogleSignup}
            block
            style={{
              height: 48,
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 500,
              border: '2px solid #f0f0f0',
            }}
          >
            Đăng ký với Google
          </Button>
        </Form>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '20px 40px 25px',
          backgroundColor: 'white',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <Text style={{ color: '#8c8c8c', fontSize: 14 }}>
          Đã có tài khoản?{' '}
          <Link
            onClick={() => {
              setShowSignup(false);
              setShowLogin(true);
            }}
            style={{
              fontWeight: 600,
              color: '#667eea',
            }}
          >
            Đăng nhập ngay
          </Link>
        </Text>
      </div>
    </Modal>
  );
}

export default Signup;
