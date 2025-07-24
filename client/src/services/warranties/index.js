import axiosInstance from '../apis';

class WarrantyService {
  static getAll() {
    return axiosInstance.get('/api/v1/benefits/warranties');
  }
}

export default WarrantyService;
