import axios from 'axios';

async function getDistricts(code) {
  const districts = await axios.get('https://provinces.open-api.vn/api/d/');

  if (!districts.data) {
    throw new Error('Không tìm thấy danh sách huyện.');
  }

  const result = districts.data.filter((district) => district.province_code === code);

  return result;
}

export default getDistricts;
