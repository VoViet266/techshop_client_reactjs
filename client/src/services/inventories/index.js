import axiosInstance from '../apis';

class Inventory {
  static getAll() {
    return axiosInstance.get('/api/v1/inventories');
  }
  static getStockProduct(branchId, variantId, productId) {
    const params = { branchId, variantId, productId }
    return axiosInstance.get(`api/v1/inventories/check-stock`, { params });
  }





}

export default Inventory;
