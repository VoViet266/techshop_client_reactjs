import { validateEmail, validatePassword } from "@helpers";

function login(user, setEmailError, setPasswordError) {
  if (validateEmail(user.email)) {
    setEmailError(false);
  } else {
    setEmailError(true);
    return;
  }

  if (validatePassword(user.password)) {
    setPasswordError(false);
  } else {
    setPasswordError(true);
    return;
  }

  console.log("Thông tin đăng nhập hợp lệ.");
}

export default login;
