import SellerOrder from "../../controllers/seller/orders.seller.controller.js";

import express from "express";
const SellerOrderRoutes = express.Router();

// for seller products order
SellerOrderRoutes.get(
  "/seller/order/products/:userId",
  SellerOrder.SellerGetProductsOrder
);
SellerOrderRoutes.put(
  "/seller/order/products/update",
  SellerOrder.SellerUpdateProductsOrder
);
SellerOrderRoutes.get(
  "/seller/order/product/details/:id",
  SellerOrder.SellerGetProductOrderById
);
SellerOrderRoutes.delete(
  "/seller/order/products/:id",
  SellerOrder.SellerdeleteProductOrder
);
SellerOrderRoutes.get(
  "/seller/order/services/list/:seller_id",
  SellerOrder.getServiceOrdersSeller
);

SellerOrderRoutes.put(
  "/seller/order/services/updateterms/:order_id",
  SellerOrder.updateServiceOrderTerms
);

SellerOrderRoutes.put(
  "/seller/order/services/update/:order_id",
  SellerOrder.updateServiceOrder
);

SellerOrderRoutes.get(
  "/seller/order/services/:order_id",
  SellerOrder.getServiceOrderById
);

export default SellerOrderRoutes;
