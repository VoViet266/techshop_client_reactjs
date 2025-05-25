import axios from "axios";
import { validateEmail, validatePassword } from "@helpers";

async function login(user, setEmailError, setPasswordError, navigate) {
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

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_SERVER_URL}/api/v1/auth/login`,
      {
        username: user.email,
        password: user.password,
      }
    );

    if (response.data.statusCode === 201) {
      localStorage.setItem("Token", response.data.data.access_token);
      if (response.data.data.role.roleName.includes("admin")) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  } catch (error) {
    console.log("Lỗi:", error.message);
  }
}

export default login;
