import getAll from './getAll';
import axiosInstance from '@services/apis';

class Categories {
  static getAll = getAll;

  findOne(id) {
    return axiosInstance.get(`/api/v1/categories/${id}`);
  }
}

export default Categories;
