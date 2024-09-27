import express, { json } from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { config } from "dotenv";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { logger } from "./src/utils/logger.js";
import { connectDb } from "./src/config/dbConfig.js";
import authRouter from "./src/routes/authRouter.js";

//Load ENV
config();

// Connect Database
connectDb();

// Initialize Application Instance
const app = express();
const { PORT, NODE_ENV } = process.env;

// Middleware
app.use(json());
app.use(morgan("combined"));
app.use(helmet());
app.use(cors());

//Routes
const baseUrl = "/api/v1";

app.use(`${baseUrl}/auth`, authRouter);

// Index route
app.get("/", (_, res) => {
  return res.status(200).json({
    message: "The server is up and running...",
  });
});

// Resource Not Found
app.use("*", (_, res) => {
  return res.status(404).json({
    message: "Resource Not Found",
  });
});

//Error handling Middleware
app.use(errorHandler);

//Start the server
app.listen(process.env.PORT, () => {
  logger(`Server is running in ${NODE_ENV} mode on port ${PORT}`);
});
