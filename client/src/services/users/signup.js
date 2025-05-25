import axios from "axios";
import {
  validateEmail,
  validatePhone,
  validateAddress,
  validatePassword,
  validateFullname,
} from "@helpers";

async function signup(user, userError, setUserError) {
  if (validateFullname(user.fullName)) {
    setUserError({ ...userError, fullNameError: false });
  } else {
    setUserError({ ...userError, fullNameError: true });
    return;
  }

  if (validateAddress(user.address)) {
    setUserError({ ...userError, addressError: false });
  } else {
    setUserError({ ...userError, addressError: true });
    return;
  }

  if (validatePhone(user.phone)) {
    setUserError({ ...userError, phoneError: false });
  } else {
    setUserError({ ...userError, phoneError: true });
    return;
  }

  if (user.gender !== "") {
    setUserError({ ...userError, genderError: false });
  } else {
    setUserError({ ...userError, genderError: true });
    return;
  }

  if (validateEmail(user.email)) {
    setUserError({ ...userError, emailError: false });
  } else {
    setUserError({ ...userError, emailError: true });
    return;
  }

  if (validatePassword(user.password)) {
    setUserError({ ...userError, passwordError: false });
  } else {
    setUserError({ ...userError, passwordError: true });
    return;
  }
  try {
    await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/v1/auth/register`, {
      name: user.fullName,
      address: user.address,
      phone: user.phone,
      gender: user.gender,
      email: user.email,
      password: user.password,
    });
  } catch (error) {
    console.log("Lỗi:", error.message);
  }
}

export default signup;
