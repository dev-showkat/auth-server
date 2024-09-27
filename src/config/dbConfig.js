import { config } from "dotenv";
import pg from "pg";
import { logger } from "../utils/logger.js";

import { connect } from "mongoose";
config();

export const connectDb = async () => {
  try {
    await connect(process.env.MONGO_URI);
    logger(`Database Connected Successfully`);
  } catch (error) {
    console.error({ status: "connection failed", error });
    process.exit(1);
  }
};
