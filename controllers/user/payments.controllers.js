import asyncHandler from "express-async-handler";
import OrderPaymentModel from "../../models/productOrderPayment.model.js";
import responseHandle from "../../utils/handleResponse.js";

const OrderPayments = {};

OrderPayments.getProductsPaymentsOrder = asyncHandler(async (req, res) => {
  // #swagger.tags = ['User Payments']

  const getProductsPaymentsOrder = await OrderPaymentModel.find({
    "buyer.id": req.params.userId,
  });

  try {
    if (!getProductsPaymentsOrder) {
      res.status(404);
      throw new Error("error getting order");
    } else {
      responseHandle.successResponse(
        res,
        200,
        "Products payments order found successfully.",
        getProductsPaymentsOrder
      );
    }
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

OrderPayments.getProductPaymentsOrderById = asyncHandler(async (req, res) => {
  // #swagger.tags = ['User Payments']

  const id = req.params.id;
  const getProductPaymentsOrder = await OrderPaymentModel.findById(id);
  try {
    if (!getProductPaymentsOrder) {
      res.status(404);
      throw new Error("Id not found");
    } else {
      responseHandle.successResponse(
        res,
        200,
        "Products payments order found successfully.",
        getProductPaymentsOrder
      );
    }
  } catch (error) {
    res.status(500);
    throw new Error(error);
  }
});

export default OrderPayments;
