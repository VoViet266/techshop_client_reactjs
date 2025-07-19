import { useState } from 'react';
import { useLogin } from '@hooks/users';
import { Modal, Form, Input, Button, Divider, Typography, Space } from 'antd';
import {
  EyeTwoTone,
  LockOutlined,
  UserOutlined,
  CloseOutlined,
  GoogleOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { useAppContext } from '@contexts';
import UserService from '@/services/users';

const { Title, Link, Text } = Typography;

function Login() {
  const [user, setUser] = useState({ email: '', password: '' });
  const { setShowLogin, setShowSignup, message, setShowForgotPassword } =
    useAppContext();
  const { handleLogin } = useLogin(message);
  const handleLoginWithGoogle = async () => {
    try {
      window.location.href = `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/google`;
    } catch (error) {
      message.error('Đăng ký bằng google thất bại!');
      console.log(error);
    }
  };
  return (
    <Modal
      open={true}
      onCancel={() => setShowLogin(false)}
      footer={null}
      width={700}
      centered
      closeIcon={
        <CloseOutlined
          style={{
            fontSize: 20,

            transition: 'all 0.3s ease',
          }}
        />
      }
    >
      <Space
        direction="vertical"
        size={16}
        style={{
          width: '100%',
          padding: '32px 0 0 0',
          textAlign: 'center',
        }}
      >
        <div>
          <Title
            level={2}
            style={{ margin: 0, fontWeight: 'bold', color: '#e53935' }}
          >
            Đăng Nhập
          </Title>
        </div>
      </Space>

      <div style={{ padding: '32px 24px' }}>
        <Form
          layout="vertical"
          onValuesChange={(_, allValues) => {
            setUser(allValues);
          }}
          onFinish={() => handleLogin(user)}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label={
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#262626',
                }}
              >
                Email
              </span>
            }
            name="email"
            rules={[
              {
                required: true,
                message: 'Email không được để trống.',
              },
              {
                type: 'email',
                message: 'Email không đúng định dạng.',
              },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập email của bạn"
              style={{
                borderRadius: 8,
                padding: '12px 16px',
                border: '1px solid #e0e0e0',
                fontSize: 15,
              }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#262626',
                }}
              >
                Mật khẩu
              </span>
            }
            name="password"
            rules={[
              {
                required: true,
                message: 'Mật khẩu không được để trống.',
              },
              {
                min: 8,
                message: 'Mật khẩu phải có ít nhất 6 ký tự.',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu của bạn"
              iconRender={(visible) =>
                visible ? (
                  <EyeTwoTone twoToneColor="#8c8c8c" />
                ) : (
                  <EyeInvisibleOutlined style={{ color: '#8c8c8c' }} />
                )
              }
              style={{
                borderRadius: 8,
                padding: '12px 16px',
                border: '1px solid #e0e0e0',
                fontSize: 15,
              }}
            />
          </Form.Item>

          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
            <Link
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#e53935',
              }}
              onClick={() => {
                setShowForgotPassword(true);
                setShowLogin(false);
              }}
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Form.Item>
            <Button
              block
              htmlType="submit"
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
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider
            plain
            style={{
              margin: '20px 0',
              borderColor: '#e0e0e0',
            }}
          >
            <span
              style={{
                color: '#8c8c8c',
                fontSize: 14,
                backgroundColor: '#fafafa',
                padding: '0 16px',
              }}
            >
              Hoặc tiếp tục với
            </span>
          </Divider>

          <Button
            icon={<GoogleOutlined style={{ fontSize: 18 }} />}
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
            onClick={() => handleLoginWithGoogle()}
          >
            Đăng nhập với Google
          </Button>
        </Form>
      </div>

      <div
        style={{
          textAlign: 'center',
          padding: '16px 0',
          backgroundColor: 'white',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <Text style={{ color: '#8c8c8c', fontSize: 14 }}>
          Chưa có tài khoản?
        </Text>
        <Button
          type="link"
          style={{ color: '#e53935', fontWeight: 600 }}
          onClick={() => {
            setShowLogin(false), setShowSignup(true);
          }}
        >
          Đăng ký
        </Button>
      </div>
    </Modal>
  );
}

export default Login;
