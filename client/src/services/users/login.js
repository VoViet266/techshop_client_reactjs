import axios from "axios";
import { validateEmail, validatePassword } from "@helpers";

async function login(
  user,
  navigate,
  setMessage,
  setShowLogin,
  setEmailError,
  setToastLoading,
  setEmailMessage,
  setLoadingError,
  setPasswordError,
  setLoadingSuccess,
  setPasswordMessage
) {
  var hasError = false;

  if (validateEmail(user.email)) {
    setEmailError(false);
  } else {
    setEmailError(true);
    setEmailMessage("Email không hợp lệ.");
    hasError = true;
  }

  if (validatePassword(user.password)) {
    setPasswordError(false);
  } else {
    setPasswordError(true);
    setPasswordMessage(
      "Mật khẩu phải chứa tối thiểu 8 ký tự và không bao gồm khoảng trắng."
    );
    hasError = true;
  }

  if (!hasError) {
    setToastLoading(true);
    setMessage("Đang đăng nhập.");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/login`,
        {
          username: user.email,
          password: user.password,
        }
      );

      if (response.data.statusCode === 201) {
        setToastLoading(false);
        setLoadingSuccess(true);
        setMessage("Đăng nhập thành công.");
        localStorage.setItem("access_token", response.data.data.access_token);
        if (response.data.data.role.roleName.includes("admin")) {
          navigate("/dashboard");
        } else {
          setShowLogin(false);
        }
      } else {
        setToastLoading(false);
        setPasswordError(true);
        setPasswordMessage(
          "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
        );
      }
    } catch (error) {
      setToastLoading(false);
      setEmailError(true);
      setPasswordError(true);
      setEmailMessage(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
      );
      setPasswordMessage(
        "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
      );
      setLoadingError(true);
      setMessage("Đăng nhập thất bại.");
    }
  }
}

export default login;
