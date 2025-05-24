function validateAddress(address) {
  const regex = /^[^,]*?,[^,]*?,[^,]*?$/;
  return regex.test(address);
}

export default validateAddress;
