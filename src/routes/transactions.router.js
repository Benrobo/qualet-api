import express from "express";
import TransactionController from "../controller/transactions.controller";
import { isLoggedIn } from "../middlewares/auth";

const Router = express.Router();

const Transaction = new TransactionController();

// add Transaction
Router.post("/create", (req, res) => {
    const payload = req.body;
    Transaction.create(res, payload);
});

// get all transactions
Router.post("/get", isLoggedIn, (req, res) => {
    const payload = req.body;
    Transaction.getTransactions(res, payload);
});


// approve transactions
Router.put("/approve", isLoggedIn, (req, res) => {
    const payload = req.body;
    Transaction.approveTransaction(res, payload);
});

// DENY Transaction
Router.post("/deny", isLoggedIn, (req, res) => {
    const payload = req.body;
    Transaction.denyTransaction(res, payload);
});

// DELETE Transaction
Router.delete("/delete", isLoggedIn, (req, res) => {
    const payload = req.body;
    Transaction.denyTransaction(res, payload);
});


// // fetch product
// // by: ID
// Router.post("/byId", (req, res) => {
//   const payload = req.body;
//   Product.getById(res, payload);
// });

// // by: OrgId
// Router.post("/byOrgId", (req, res) => {
//   const payload = req.body;
//   Product.getByOrgId(res, payload);
// });

// // UPDATE
// Router.put("/update", isLoggedIn, (req, res) => {
//   const payload = req.body;
//   Product.updateProduct(res, payload);
// });

// DELETE
Router.delete("/delete", isLoggedIn, (req, res) => {
    const payload = req.body;
    Product.deleteProduct(res, payload);
});

export default Router;
