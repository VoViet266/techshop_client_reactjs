function validatePassword(password) {
  const regex = /^\S{8,}$/;
  return regex.test(password);
}

export default validatePassword;
