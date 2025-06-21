import axios from 'axios';

async function getAllProvinces() {
  try {
    const provinces = await axios.get('https://provinces.open-api.vn/api/p/');
    if (provinces.length < 0) {
      throw new Error('Không lấy được danh sách tỉnh.');
    }
    return provinces.data;
  } catch (error) {
    console.log(`Lỗi: ${error.message}`);
  }
}

export default getAllProvinces;
