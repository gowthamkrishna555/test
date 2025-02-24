import { Sequelize } from "sequelize";
import pg from "pg";

const sequelize = new Sequelize(
  "neondb", // Database name
  "neondb_owner", // Database user
  "npg_H5BKa6EwhvFl", // Database password
  {
    host: "ep-purple-wildflower-a1gtfkf9-pooler.ap-southeast-1.aws.neon.tech", 
    dialect: "postgres",
    dialectModule: pg,
    logging: false, // Set to true for debugging queries
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Allows self-signed certificates
      },
    },
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("PostgreSQL connected successfully!");
  } catch (error) {
    console.error("PostgreSQL connection failed:", error);
    process.exit(1);
  }
};

connectDB();

export { sequelize };
