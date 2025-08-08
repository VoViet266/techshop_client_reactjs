import axiosInstance from '@services/apis';

class CartServices {
  add(items) {
    return axiosInstance.post('/api/v1/carts', { items });
  }

  static get() {
    return axiosInstance.get('/api/v1/carts');
  }

  delete(id) {
    return axiosInstance.delete(`/api/v1/carts/remove-all?id=${id}`);
  }

  static update(id, cartItems) {

    return axiosInstance.patch(`/api/v1/carts/${id}`, { items: cartItems });
  }

  deleteOne(productId, variantId) {

    return axiosInstance.delete(`/api/v1/carts/remove-item`, {
      data: {
        productId: productId,
        variantId: variantId
      }
    });
  }
}

export default CartServices;
