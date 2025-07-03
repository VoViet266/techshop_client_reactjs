import axiosInstance from '@services/apis';

async function getAll(page, limit, category, brand) {
  const params = { page, limit };
  if (category) {
    params.category = category;
  }
  if (brand) {
    params.brand = brand;
  }
  const response = await axiosInstance.get(`/api/v1/products`, { params });
  if (response.status === 200) {
    const products = response.data.data;
    return products;
  }

  throw new Error('Không lấy được danh sách sản phẩm.');
}
export default getAll;

