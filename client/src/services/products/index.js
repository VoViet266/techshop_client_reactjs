import { callDeleteProduct } from "../apis";
import add from "./add";
import getAll from "./getAll";
import getProductDetail from "./getProductDetail";

class Products {
  static add = add;
  static getAll = getAll;
  static get = getProductDetail;

}

export default Products;
