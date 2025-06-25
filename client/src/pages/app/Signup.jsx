import React, { useState, useEffect, useRef } from 'react';
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
} from '@ant-design/icons';
import Users from '@services/users';
import Address from '@services/address';
import { useAppContext } from '@contexts';
import { useNavigate } from 'react-router-dom';

const { Title, Link, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function Signup() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [user, setUser] = useState({});
  const [wards, setWards] = useState([]);
  const addressDropdownRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [addressValue, setAddressValue] = useState('');
  const [selectedWard, setSelectedWard] = useState({});
  const [selectedProvince, setSelectedProvince] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState({});
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('Tỉnh/Thành phố');

  const places = ['Tỉnh/Thành phố', 'Quận/Huyện', 'Xã/Phường'];
  const { setShowLogin, setShowSignup, message } = useAppContext();

  useEffect(() => {
    document.title = 'TechShop | Đăng ký';
    fetchProvinces();
    fetchDistricts();
    fetchWards();
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

  const handleSignup = async (user) => {
    setLoading(true);
    try {
      const userData = {
        age: user.age,
        name: user.name,
        phone: user.phone,
        email: user.email,
        gender: user.gender,
        password: user.password,
        // role: ['user'], // Default role
        address: addressValue
          ? [
              {
                addressDetail: addressValue,
                default: true,
              },
            ]
          : [],
      };
      const userServices = new Users();
      await userServices.signup(userData);
      message.success('Đăng ký thành công!');
      navigate('/');
      setShowSignup(false);
      setShowLogin(true);
    } catch (error) {
      message.error('Đăng ký thất bại. Vui lòng thử lại!');
      console.error('Lỗi:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    message.info('Tính năng đăng ký với Google đang được phát triển');
  };
  const handleProvinceSelect = async (province, event) => {
    const newAddress = event.target.textContent;
    setAddressValue(newAddress);
    setSelectedProvince(province);
    setSelectedPlace('Quận/Huyện');
    setSelectedDistrict({});
    setSelectedWard({});

    await fetchDistricts(province.code);
  };

  const handleDistrictSelect = async (district, event) => {
    const districtName = event.target.textContent;
    const newAddress =
      selectedDistrict.name === district.name
        ? selectedProvince.name + ', ' + districtName
        : addressValue + ', ' + districtName;

    setAddressValue(newAddress);
    setSelectedDistrict(district);
    setSelectedPlace('Xã/Phường');
    setSelectedWard({});

    await fetchWards(district.code);
  };

  const handleWardSelect = (ward, event) => {
    const wardName = event.target.textContent;
    const newAddress =
      selectedWard.name === ward.name
        ? selectedProvince.name + ', ' + selectedDistrict.name + ', ' + wardName
        : selectedProvince.name +
          ', ' +
          selectedDistrict.name +
          ', ' +
          wardName;

    setAddressValue(newAddress);
    setSelectedWard(ward);
    setShowAddressDropdown(false);
  };
  return (
    <Modal
      open={true}
      onCancel={() => setShowSignup(false)}
      footer={null}
      width={900}
      centered
      closeIcon={
        <CloseOutlined
          style={{
            fontSize: 20,
          }}
        />
      }
    >
      <Space
        direction="vertical"
        size={12}
        style={{ width: '100%', textAlign: 'center', padding: '16px 0' }}
      >
        <Title
          level={2}
          style={{ margin: 0, fontWeight: 'bold', color: '#e53935' }}
        >
          Tạo tài khoản mới
        </Title>
      </Space>

      <div
        style={{
          padding: '24px 40px',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSignup}
          onValuesChange={(_, values) => {
            setUser(values);
          }}
          autoComplete="off"
          size="large"
        >
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
                  { min: 8, message: 'Họ và tên phải có ít nhất 2 ký tự' },
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
                  <EyeTwoTone twoToneColor={'#8c8c8c'} />
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
            <Col span={24}>
              <Form.Item>
                <div style={{ marginBottom: 24, position: 'relative' }}>
                  <label
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#262626',
                      display: 'block',
                      marginBottom: 8,
                    }}
                  >
                    Địa chỉ (mặc định)
                  </label>
                  <Input
                    readOnly
                    value={addressValue}
                    placeholder="Chọn địa chỉ"
                    onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                    prefix={<HomeOutlined style={{ color: '#8c8c8c' }} />}
                    style={{
                      borderRadius: 8,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: '#fff',
                    }}
                  />

                  {showAddressDropdown && (
                    <div
                      ref={addressDropdownRef}
                      style={{
                        backgroundColor: 'white',
                        position: 'absolute',
                        zIndex: 1000,
                        top: '100%',
                        marginTop: 8,
                        left: 0,
                        right: 0,
                        borderRadius: 8,
                        border: '1px solid #d9d9d9',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                      >
                        {places.map((place, index) => (
                          <div
                            key={index}
                            onClick={() => setSelectedPlace(place)}
                            style={{
                              width: '33.33%',
                              cursor: 'pointer',
                              padding: '12px 8px',
                              textAlign: 'center',
                              fontSize: 14,
                              borderBottom:
                                selectedPlace === place
                                  ? '2px solid #667eea'
                                  : '2px solid transparent',
                              color:
                                selectedPlace === place ? '#667eea' : '#262626',
                              fontWeight: selectedPlace === place ? 500 : 400,
                            }}
                          >
                            {place}
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          overflowY: 'auto',
                          maxHeight: 200,
                          padding: 8,
                          cursor: 'pointer',
                        }}
                      >
                        {selectedPlace === 'Tỉnh/Thành phố' &&
                          provinces.map((province, index) => (
                            <div
                              key={index}
                              onClick={(event) =>
                                handleProvinceSelect(province, event)
                              }
                              style={{
                                padding: '8px 12px',
                                margin: '4px 0',
                                borderRadius: 6,
                                fontSize: 14,
                                backgroundColor:
                                  selectedProvince.name === province.name
                                    ? '#f6f6f6'
                                    : 'transparent',
                                ':hover': { backgroundColor: '#f6f6f6' },
                              }}
                            >
                              {province.name}
                            </div>
                          ))}

                        {selectedPlace === 'Quận/Huyện' &&
                          districts.map((district, index) => (
                            <div
                              key={index}
                              onClick={(event) =>
                                handleDistrictSelect(district, event)
                              }
                              style={{
                                padding: '8px 12px',
                                margin: '4px 0',
                                borderRadius: 6,
                                fontSize: 14,
                                backgroundColor:
                                  selectedDistrict.name === district.name
                                    ? '#f6f6f6'
                                    : 'transparent',
                              }}
                            >
                              {district.name}
                            </div>
                          ))}

                        {selectedPlace === 'Xã/Phường' &&
                          wards.map((ward, index) => (
                            <div
                              key={index}
                              onClick={(event) => handleWardSelect(ward, event)}
                              style={{
                                padding: '8px 12px',
                                margin: '4px 0',
                                borderRadius: 6,
                                fontSize: 14,
                                backgroundColor:
                                  selectedWard.name === ward.name
                                    ? '#f6f6f6'
                                    : 'transparent',
                              }}
                            >
                              {ward.name}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 600,
                backgroundColor: '#e53935',
                color: '#fff',
                border: 'none',
              }}
            >
              Đăng ký
            </Button>
          </Form.Item>

          <Divider plain style={{ margin: '20px 0' }}>
            <span style={{ color: '#8c8c8c', fontSize: 14 }}>
              Hoặc tiếp tục với
            </span>
          </Divider>

          <Button
            icon={<GoogleOutlined style={{ fontSize: 18 }} />}
            onClick={handleGoogleSignup}
            block
            style={{
              height: 48,
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              border: '1px solid #e0e0e0',
              color: '#e53935',
              backgroundColor: '#fff',
            }}
          >
            Đăng ký với Google
          </Button>
        </Form>
      </div>
      <div
        style={{
          textAlign: 'center',
          padding: '16px 40px 20px',
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
              color: '#e53935',
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
