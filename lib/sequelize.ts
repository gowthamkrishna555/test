import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "reactflow_db", // Database name
  "nextjs_user",  // Database user
  "Password@123", // Database password
  {
    host: "localhost", // Change if your database is on another server
    dialect: "postgres", // Specify PostgreSQL
    logging: true, // Set to true for debugging queries
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Sync all models with database
    console.log(" PostgreSQL connected successfully!");
  } catch (error) {
    console.error(" PostgreSQL connection failed:", error);
    process.exit(1);
  }
};

connectDB(); // Automatically connects to DB when this file is imported

export { sequelize }; // Exporting the sequelize instance
