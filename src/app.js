import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { customlimiter } from "./middlewares/rateLimiting";
import { MAX_API_REQUEST } from "./config";
import authRouter from "./routes/auth.router";
import productRouter from "./routes/products.router";
import transactionRouter from "./routes/transactions.router";

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

// router  middlewares

app.use(customlimiter);

app.get("/", (req, res) => {
  res.send(`WELCOME`);
});

// authentication
app.use("/api/auth", authRouter);

// products
app.use("/api/product", productRouter);

// transactions
app.use("/api/transaction", transactionRouter)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listening @ http://localhost:${PORT}`);
});
