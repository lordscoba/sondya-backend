import upload from "../../config/file.js";
import adminCategories from "../../controllers/admin/admin-categories.controllers.js";

import express from "express";
const AdminCategoriesRoutes = express.Router();

// for admin categories
AdminCategoriesRoutes.post(
  "/admin/category/create",
  upload.array("image"),
  adminCategories.create
);
AdminCategoriesRoutes.put(
  "/admin/category/update/:id",
  upload.array("image"),
  adminCategories.update
);
AdminCategoriesRoutes.get("/admin/category/:id", adminCategories.getById);
AdminCategoriesRoutes.delete("/admin/category/:id", adminCategories.delete);
AdminCategoriesRoutes.get("/admin/categories", adminCategories.getAll);
AdminCategoriesRoutes.get(
  "/admin/categories/:category",
  adminCategories.getCategory
);

export default AdminCategoriesRoutes;
