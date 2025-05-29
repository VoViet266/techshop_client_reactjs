import axios from "axios";

async function getProductDetail(id) {
  const server_url = import.meta.env.VITE_SERVER_URL;
  try {
    const response = await axios.get(`${server_url}/api/v1/products/${id}`);
    if (response.status !== 200) {
      throw new Error("Không thể lấy thông tin sản phẩm.");
    }
    return response.data.data;
  } catch (error) {
    console.log(error.message);
  }
}

export default getProductDetail;
