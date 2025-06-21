import add from './add';
import search from './search';
import getAll from './getAll';
import getProductDetail from './getProductDetail';

class Products {
  static add = add;
  static getAll = getAll;
  static search = search;
  static get = getProductDetail;
}

export default Products;
