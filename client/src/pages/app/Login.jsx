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
        size={16}
        direction="vertical"
        className="w-full! pt-32! text-center!"
      >
        <div>
          <Title level={2} className="m-0! font-bold!  text-[#e53935]!">
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
              <span className="text-[15px]! font-medium! text-[#262626]!">
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
              className="rounded-lg! py-12! px-16! border border-[#e0e0e0]! text-[15px]!"
            />
          </Form.Item>

          <Form.Item
            label={
              <span className="text-[15px]! font-medium! text-[#262626]!">
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
              className="rounded-lg! py-12! px-16! border border-[#e0e0e0]! text-[15px]!"
            />
          </Form.Item>

          <div className="text-right! mb-10!">
            <Link
              className="text-sm! font-medium! text-[#e53935]!"
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
              className="h-48! rounded-lg! test-base! font-semibold! bg-[#e53935]! text-white! border-none!"
            >
              Đăng nhập
            </Button>
          </Form.Item>

          <Divider plain className="my-20! mx-0! border border-[#e0e0e0]!">
            <span className="text-[#8c8c8c]! text-sm! bg-[#fafafa]! py-0! px-16!">
              Hoặc tiếp tục với
            </span>
          </Divider>

          <Button
            icon={<GoogleOutlined style={{ fontSize: 18 }} />}
            block
            className="h-48! rounded-lg! text-base! font-semibold! border border-[#e0e0e0]! text-[#e53935]! bg-white!"
            onClick={() => handleLoginWithGoogle()}
          >
            Đăng nhập với Google
          </Button>
        </Form>
      </div>

      <div className="text-center! py-16! px-0! bg-white! border-t border-t-[#f0f0f0]!">
        <Text className="text-[#8c8c8c]! text-sm!">Chưa có tài khoản?</Text>
        <Button
          type="link"
          className="text-[#e53935]! font-semibold!"
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
