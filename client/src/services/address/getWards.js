import axios from 'axios';

async function getWards(code) {
  const wards = await axios.get('https://provinces.open-api.vn/api/w/');

  if (!wards.data) {
    throw new Error('Không tìm thấy danh sách xã.');
  }

  const result = wards.data.filter((wards) => wards.district_code === code);

  return result;
}

export default getWards;
