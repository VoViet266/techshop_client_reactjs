import axiosInstance from '@services/apis';

async function getAll() {
  try {
    var categories;
    const response = await axiosInstance.get(`/api/v1/categories`);
    if (response.status === 200) {
      categories = response.data.data;
      return categories;
    }
    throw new Error('Không thể lấy danh sách thể loại.');
  } catch (error) {
    console.error(error);
  }
}

export default getAll;
