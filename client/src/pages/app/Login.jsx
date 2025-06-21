import Users from '@services/users';
import useMessage from '@/hooks/useMessage';

import { useAppContext } from '@contexts';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, Button, Typography, Divider, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, CloseOutlined, GoogleOutlined } from '@ant-design/icons';

function Login() {
  const {
    showLogin,
    setMessage,
    setShowLogin,
    setToastLoading,
    setLoadingError,
    setLoadingSuccess,
  } = useAppContext();

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { success, error, loading } = useMessage();
  const [user, setUser] = useState({ email: '', password: '' });

  useEffect(() => {
    document.title = 'TechShop | Đăng nhập';
  }, []);

  const onFinish = async (values) => {
    // await Users.login(
    //   values,
    //   navigate,
    //   setMessage,
    //   setShowLogin,
    //   setEmailError,
    //   setToastLoading,
    //   () => {},
    //   setLoadingError,
    //   setPasswordError,
    //   setLoadingSuccess,
    //   setPasswordMessage,
    // );
  };

  function handleInputChange(_, allValues) {
    setUser(allValues);
  }

  return (
    <Modal
      centered
      width="50%"
      footer={null}
      open={showLogin}
      title="Đăng nhập"
      closeIcon={<CloseOutlined />}
      onCancel={() => setShowLogin(false)}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={user}
        onValuesChange={handleInputChange}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Email không được để trống' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]}
        >
          <Input placeholder="Nhập email" onChange={handleInputChange} />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Mật khẩu không được để trống.' }]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu"
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginBottom: 16 }}>
          <Typography.Text type="secondary" style={{ cursor: 'pointer' }}>
            Quên mật khẩu?
          </Typography.Text>
        </div>

        <Form.Item>
          <Button type="primary" htmlType="submit" block style={{ marginBottom: 24 }}>
            Đăng nhập
          </Button>
        </Form.Item>

        <Divider plain>Hoặc</Divider>

        <Button
          icon={<GoogleOutlined />}
          block
          onClick={() => antdMessage.info('Chức năng đang phát triển')}
        >
          Đăng nhập với Google
        </Button>
      </Form>
    </Modal>
  );
}

export default Login;
