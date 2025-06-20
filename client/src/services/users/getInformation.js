import axiosInstance from "@services/apis";

async function getInformation(id) {
  try {
    if (!localStorage.getItem("token")) {
      throw new Error("Không tìm thấy token, vui lòng đăng nhập lại.");
    }
    const response = await axiosInstance.get(`/api/v1/users/${id}`);

    if (response.status !== 200) {
      throw new Error("Lấy thông tin người dùng thất bại");
    }

    return response.data.data;
  } catch (error) {
    console.error(error.message);
  }
}

export default getInformation;
