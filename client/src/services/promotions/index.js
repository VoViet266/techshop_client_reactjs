import axiosInstance from '../apis';

class PromotionService {
  static getAll() {
    return axiosInstance.get('/api/v1/benefits/promotions');
  }
}

export default PromotionService;
