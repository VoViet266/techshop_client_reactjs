import upload from './upload';
import callDelete from './delete';
import axiosInstance from '@services/apis';

class Files {
  static upload = upload;
  static async callDelete(url) {
    const params = { url };
    console.log(params);
    return await axiosInstance.delete(`/api/v1/upload/image`, { params });
  }
};


export default Files;
