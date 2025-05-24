function validateFullname(fullName) {
  const regex = /^[\p{L}\s']+$/u;
  return regex.test(fullName);
}

export default validateFullname;
