import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Divider,
  Typography,
  Space,
  Alert,
  Spin,
  Result,
  Steps,
  Row,
  Col,
  Progress,
} from 'antd';
import {
  EyeTwoTone,
  LockOutlined,
  UserOutlined,
  CloseOutlined,
  GoogleOutlined,
  EyeInvisibleOutlined,
  MailOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  SafetyOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { useAppContext } from '@/contexts';
import UserService from '@/services/users';
import { set } from 'react-hook-form';

const { Title, Link, Text } = Typography;
const { Step } = Steps;

const ForgotPasswordModal = () => {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timeLeft, setTimeLeft] = useState(300);
  const [form] = Form.useForm();

  const { showForgotPassword, setShowForgotPassword, message } =
    useAppContext();

  useEffect(() => {
    let interval = null;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleSendEmail = async () => {
    if (!email || !email.includes('@')) return;

    setLoading(true);
    try {
      await UserService.forgotPassword(email);

      setLoading(false);
      setCurrentStep(1);
    } catch (error) {
      console.log(error);
      setLoading(false);
      message.error('Gữi mã xác nhận thất bại');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6) return;
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(2);
    }, 1000);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) return;

    setLoading(true);
    try {
      await UserService.resetPassword(verificationCode, newPassword);
      setLoading(false);
      setCurrentStep(3);
    } catch (error) {
      console.log(error);
      message.error('Cập nhật mật khẩu thất bại');
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    handleSendEmail();
  };

  const handleClose = () => {
    setCurrentStep(0);
    setEmail('');
    setVerificationCode('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeLeft(0);
    form.resetFields();
    setShowForgotPassword(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return '#ff4d4f';
    if (strength < 75) return '#faad14';
    return '#52c41a';
  };

  const steps = [
    {
      title: 'Nhập Email',
      icon: <MailOutlined />,
    },
    {
      title: 'Xác nhận mã',
      icon: <SafetyOutlined />,
    },
    {
      title: 'Mật khẩu mới',
      icon: <KeyOutlined />,
    },
    {
      title: 'Hoàn tất',
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <Modal
      open={showForgotPassword}
      onCancel={handleClose}
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
      <div style={{ padding: '32px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title
            level={2}
            style={{ margin: 0, fontWeight: 'bold', color: '#e53935' }}
          >
            Khôi Phục Mật Khẩu
          </Title>
        </div>

        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((step, index) => (
            <Step key={index} title={step.title} icon={step.icon} />
          ))}
        </Steps>
        {currentStep === 0 && (
          <Form form={form} layout="vertical" size="large">
            <Form.Item
              label={
                <span
                  style={{ fontSize: 15, fontWeight: 500, color: '#262626' }}
                >
                  Email
                </span>
              }
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderRadius: 8,
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  fontSize: 15,
                }}
              />
            </Form.Item>

            <Alert
              message="Lưu ý"
              description="Mã xác nhận sẽ được gửi đến địa chỉ email đã đăng ký và có hiệu lực trong 5 phút."
              type="info"
              showIcon
              style={{
                marginBottom: 24,
                borderRadius: 8,
                backgroundColor: '#f0f8ff',
                border: '1px solid #91d5ff',
              }}
            />
            <Form.Item>
              <Button
                block
                loading={loading}
                onClick={handleSendEmail}
                disabled={!email || !email.includes('@')}
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
                {loading ? 'Đang gửi...' : 'Gửi mã xác nhận'}
              </Button>
            </Form.Item>
          </Form>
        )}
        {currentStep === 1 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Text style={{ color: '#8c8c8c', fontSize: 15 }}>
                Mã xác nhận đã được gửi đến:
              </Text>
              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '8px 12px',
                  borderRadius: 6,
                  margin: '8px 0',
                  display: 'inline-block',
                }}
              >
                <Text strong style={{ color: '#e53935' }}>
                  {email}
                </Text>
              </div>
            </div>

            <Form layout="vertical" size="large">
              <Form.Item
                label={
                  <span
                    style={{ fontSize: 15, fontWeight: 500, color: '#262626' }}
                  >
                    Mã xác nhận
                  </span>
                }
                required
              >
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="Nhập mã 6 chữ số"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  style={{
                    borderRadius: 8,
                    padding: '12px 16px',
                    border: '1px solid #e0e0e0',
                    fontSize: 18,
                    textAlign: 'center',
                    letterSpacing: '4px',
                  }}
                />
              </Form.Item>

              {timeLeft > 0 && (
                <Alert
                  message={`Mã sẽ hết hạn sau: ${formatTime(timeLeft)}`}
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16, borderRadius: 8 }}
                />
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    block
                    disabled={timeLeft > 0}
                    loading={loading}
                    onClick={handleResendCode}
                    style={{
                      height: 48,
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    Gửi lại mã
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    block
                    type="primary"
                    loading={loading}
                    onClick={handleVerifyCode}
                    disabled={!verificationCode || verificationCode.length < 6}
                    style={{
                      height: 48,
                      borderRadius: 8,
                      fontSize: 16,
                      fontWeight: 600,
                      backgroundColor: '#e53935',
                      border: 'none',
                    }}
                  >
                    Xác nhận
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
        )}

        {currentStep === 2 && (
          <Form layout="vertical" size="large">
            <Form.Item
              label={
                <span
                  style={{ fontSize: 15, fontWeight: 500, color: '#262626' }}
                >
                  Mật khẩu mới
                </span>
              }
              required
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                style={{
                  borderRadius: 8,
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  fontSize: 15,
                }}
              />
              {newPassword && (
                <div style={{ marginTop: 8 }}>
                  <Text style={{ fontSize: 12, color: '#8c8c8c' }}>
                    Độ mạnh mật khẩu:
                  </Text>
                  <Progress
                    percent={getPasswordStrength(newPassword)}
                    strokeColor={getPasswordStrengthColor(
                      getPasswordStrength(newPassword),
                    )}
                    showInfo={false}
                    size="small"
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item
              label={
                <span
                  style={{ fontSize: 15, fontWeight: 500, color: '#262626' }}
                >
                  Xác nhận mật khẩu
                </span>
              }
              required
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                style={{
                  borderRadius: 8,
                  padding: '12px 16px',
                  border: '1px solid #e0e0e0',
                  fontSize: 15,
                }}
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <Text style={{ color: '#ff4d4f', fontSize: 12 }}>
                  Mật khẩu xác nhận không khớp
                </Text>
              )}
            </Form.Item>

            <Alert
              message="Yêu cầu mật khẩu"
              description="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số."
              type="info"
              showIcon
              style={{
                marginBottom: 24,
                borderRadius: 8,
                backgroundColor: '#f0f8ff',
                border: '1px solid #91d5ff',
              }}
            />

            <Form.Item>
              <Button
                block
                loading={loading}
                onClick={handleResetPassword}
                disabled={
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword ||
                  getPasswordStrength(newPassword) < 50
                }
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
                {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
              </Button>
            </Form.Item>
          </Form>
        )}

        {currentStep === 3 && (
          <div style={{ textAlign: 'center' }}>
            <Result
              icon={
                <CheckCircleOutlined
                  style={{ color: '#52c41a', fontSize: 64 }}
                />
              }
              title={
                <Title level={3} style={{ margin: '16px 0', color: '#262626' }}>
                  Đặt lại mật khẩu thành công!
                </Title>
              }
              subTitle={
                <Text style={{ color: '#8c8c8c', fontSize: 15 }}>
                  Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với
                  mật khẩu mới.
                </Text>
              }
              extra={
                <Button
                  type="primary"
                  size="large"
                  onClick={handleClose}
                  style={{
                    height: 48,
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 600,
                    backgroundColor: '#e53935',
                    border: 'none',
                    minWidth: 200,
                  }}
                >
                  Quay lại đăng nhập
                </Button>
              }
            />
          </div>
        )}

        {currentStep > 0 && currentStep < 3 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              onClick={() => setCurrentStep(currentStep - 1)}
              style={{ color: '#e53935', fontWeight: 500 }}
            >
              Quay lại bước trước
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
