import axiosInstance from '@services/apis';

async function getAll() {
  const reponse = await axiosInstance.get('api/v1/brands');
  if (reponse.status === 200) {
    return reponse.data.data;
  }
  throw new Error('Không thể lấy danh sách thương hiệu.');
}

export default getAll;
