import { Sequelize } from "sequelize";

// Use environment variable for security
const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // Required for NeonDB
      rejectUnauthorized: false, // Bypass self-signed SSL issues
    },
  },
  logging: console.log, // Enable logging to debug SQL queries
});

export default sequelize;
