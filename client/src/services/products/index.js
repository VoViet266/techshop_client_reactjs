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

  payment(paymentInformation) {
    return axiosInstance.post('/api/v1/payment/create-payment', {
      ...paymentInformation,
    });
  }
}

export default Products;
