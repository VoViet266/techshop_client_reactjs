import axiosInstance from '@services/apis';

class CartServices {
  add(items) {
    return axiosInstance.post('/api/v1/carts', { items });
  }

  static  get() {
    return axiosInstance.get('/api/v1/carts');
  }

  delete(id) {
    return axiosInstance.delete(`/api/v1/carts/remove-all?id=${id}`);
  }

  static update(id, cartItems) {
    console.log('Updating cart items', id, cartItems.quantity);
    return axiosInstance.patch(`/api/v1/carts/${id}`, {  items: cartItems });
  }

  deleteOne(productId, variantId) {
    const params = new URLSearchParams();
    params.append('productId', productId);
    params.append('variantId', variantId);

    return axiosInstance.delete(`/api/v1/carts/remove-item`, {
      data: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
}

export default CartServices;
