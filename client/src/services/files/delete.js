import axiosInstance from "../apis";

async function callDelete(url) {
    const params = { url }
    console.log(params);
    return await axiosInstance.delete(`/api/v1/upload/image`, {
        params
    });
}

export default callDelete()