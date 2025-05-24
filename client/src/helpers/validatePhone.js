function validatePhone(phone) {
  const regex = /^0\d{9}$/;
  return regex.test(phone);
}

export default validatePhone;
