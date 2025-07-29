import add from './add';
import search from './search';
import getAll from './getAll';
import getProductDetail from './getProductDetail';
import axiosInstance from '../apis';

class Products {
  static add = add;
  static getAll = getAll;
  static search = search;
  static get = getProductDetail;


  order(order) {
    return axiosInstance.post('api/v1/orders', { ...order });
  }

  getAllOrder() {
    return axiosInstance.get('/api/v1/orders/user');
  }

  getOrderByUser(userId) {
    return axiosInstance.get(`/api/v1/orders/user`);
  }

  payment(paymentInformation) {
    return axiosInstance.post('/api/v1/payment/create-payment', {
      ...paymentInformation,
    });
  }

  static cancelOrder(orderId) {
    return axiosInstance.patch(`/api/v1/orders/cancel/${orderId}`);
  }

  static requestReturn(orderId, value) {

    return axiosInstance.patch(`/api/v1/orders/request-return/${orderId}`, {
      ...value,
    });
  }

  static confirmReturn(orderId, value) {

    return axiosInstance.patch(`/api/v1/orders/confirm-return/${orderId}`, {
      returnStatus: value
    });
  }


  static upViewCount(id) {
    return axiosInstance.patch(`/api/v1/products/${id}/view-count`);
  }
}

export default Products;
