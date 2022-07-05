import express from "express";
import ProductsController from "../controller/product.controller";
import { isLoggedIn } from "../middlewares/auth";

const Router = express.Router();

const Product = new ProductsController();

// add product
Router.post("/add", isLoggedIn, (req, res) => {
  const payload = req.body;
  Product.create(res, payload);
});

// fetch product
// by: ID
Router.post("/byId", (req, res) => {
  const payload = req.body;
  Product.getById(res, payload);
});

// by: OrgId
Router.post("/byOrgId", (req, res) => {
  const payload = req.body;
  Product.getByOrgId(res, payload);
});

// UPDATE
Router.put("/update", isLoggedIn, (req, res) => {
  const payload = req.body;
  Product.updateProduct(res, payload);
});

// DELETE
Router.delete("/delete", isLoggedIn, (req, res) => {
  const payload = req.body;
  Product.deleteProduct(res, payload);
});

export default Router;
