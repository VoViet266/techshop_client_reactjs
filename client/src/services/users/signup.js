import axios from 'axios';

import {
  validateEmail,
  validatePhone,
  validateAddress,
  validatePassword,
  validateFullname,
} from '@helpers';

async function signup(
  user,
  userError,
  setMessage,
  userMessage,
  setUserError,
  setShowLogin,
  setShowSignup,
  setUserMessage,
  setToastLoading,
  setLoadingError,
  setLoadingSuccess,
) {
  const newUserError = { ...userError };
  const newUserMessage = { ...userMessage };

  var hasError = false;

  if (validateFullname(user.fullName)) {
    newUserError.fullNameError = false;
  } else {
    newUserError.fullNameError = true;
    newUserMessage.fullNameMessage = 'Họ tên không được bao gồm số.';
    hasError = true;
  }

  if (validateAddress(user.address)) {
    newUserError.addressError = false;
  } else {
    newUserError.addressError = true;
    hasError = true;
  }

  if (validatePhone(user.phone)) {
    newUserError.phoneError = false;
  } else {
    newUserError.phoneError = true;
    newUserMessage.phoneMessage = 'Số điện thoại không hợp lệ.';
    hasError = true;
  }

  if (user.gender !== '') {
    newUserError.genderError = false;
  } else {
    newUserError.genderError = true;
    hasError = true;
  }

  if (validateEmail(user.email)) {
    newUserError.emailError = false;
  } else {
    newUserError.emailError = true;
    newUserMessage.emailMessage = 'Email không hợp lệ.';
    hasError = true;
  }

  if (validatePassword(user.password)) {
    newUserError.passwordError = false;
  } else {
    newUserError.passwordError = true;
    newUserMessage.passwordMessage =
      'Mật khẩu phải có ít nhất 8 ký tự và không bao gồm khoảng trắng.';
    hasError = true;
  }

  setUserError(newUserError);
  setUserMessage(newUserMessage);

  if (!hasError) {
    setToastLoading(true);
    setMessage('Đang đăng ký.');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/register`,
        {
          name: user.fullName,
          address: user.address,
          phone: user.phone,
          gender: user.gender,
          email: user.email,
          password: user.password,
        },
      );

      if (response.data.statusCode === 201) {
        setToastLoading(false);
        setLoadingSuccess(true);
        setMessage('Đăng ký thành công.');
        setShowSignup(false);
        setShowLogin(true);
      }
    } catch (error) {
      setToastLoading(false);
      setLoadingError(true);

      if (error.response && error.response.status === 409) {
        setMessage('Đăng ký thất bại.');
        newUserError.emailError = true;
        setUserError(newUserError);
        newUserMessage.emailMessage = 'Email đã được sử dụng.';
        setUserMessage(newUserMessage);
      } else {
        setMessage('Đăng ký thất bại.');
      }
    }
  }
}

export default signup;
