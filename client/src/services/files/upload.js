import axiosInstance from '@services/apis';

async function upload(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post(`/api/v1/upload/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.status === 201) {
    const url = response.data.data.secure_url;
    return url;
  }
  throw new Error('Có lỗi xảy ra khi tải lên ảnh.');
}

export default upload;
