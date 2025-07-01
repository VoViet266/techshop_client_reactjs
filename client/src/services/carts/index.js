import axiosInstance from '@services/apis';

class CartServices {
  add(items) {
    return axiosInstance.post('/api/v1/carts', { items });
  }
  
  get() {
    return axiosInstance.get('/api/v1/carts');
  }
}

export default CartServices;
