import axiosInstance from '@services/apis';

class Branchs {
  static getAll() {
    return axiosInstance.get('api/v1/branchs');
  }
}

export default Branchs;
