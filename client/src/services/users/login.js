import { validateEmail, validatePassword } from "@/helpers";

function login(user, setEmailError, setPasswordError) {
  if (validateEmail(user.email)) {
    setEmailError(true);
  } else {
    setEmailError(false);
    return;
  }

  if (validatePassword(user.password)) {
    setPasswordError(true);
  } else {
    setPasswordError(false);
    return;
  }

  console.log("Thông tin đăng nhập hợp lệ.");
}

export default login;
