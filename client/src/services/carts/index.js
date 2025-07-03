import axiosInstance from '@services/apis';

class CartServices {
  add(items) {
    return axiosInstance.post('/api/v1/carts', { items });
  }

  get() {
    return axiosInstance.get('/api/v1/carts');
  }

  delete(id) {
    return axiosInstance.delete(`/api/v1/carts/remove-all?id=${id}`);
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
