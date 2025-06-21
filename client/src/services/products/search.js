import axiosInstance from '@services/apis';

async function search(query) {
  const response = await axiosInstance.get(
    `api/v1/products/search/autocomplete?query=${query}`,
  );
  if (response.status === 200) {
    const result = response.data.data;
    return result;
  }
  throw new Error('Không tìm thấy sản phẩm');
}

export default search;
