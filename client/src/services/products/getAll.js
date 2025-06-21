import axiosInstance from '@services/apis';

async function getAll() {
  const response = await axiosInstance.get('/api/v1/products');
  if (response.status === 200) {
    const products = response.data.data.result;
    return products;
  }

  throw new Error('Không lấy được danh sách sản phẩm.');
}

export default getAll;
