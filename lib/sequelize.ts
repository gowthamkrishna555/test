import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5, // Max 5 connections (important for serverless)
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false, // Change to `true` for debugging
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("✅ PostgreSQL connected successfully!");
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error);
    process.exit(1);
  }
};

// Connect to DB only once in production
if (process.env.NODE_ENV !== "production") {
  connectDB();
}

export { sequelize };
