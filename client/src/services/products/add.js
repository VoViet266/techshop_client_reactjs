import axiosInstance from '@services/apis';

async function add(product) {
  const response = await axiosInstance.post('/api/v1/products', product);
  if (response.status !== 201) {
    throw new Error('Thêm sản phẩm không thành công.');
  }
  return response.data.data;
}

export default add;
