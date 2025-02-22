import { Sequelize } from "sequelize";

const sequelize = new Sequelize(process.env.DATABASE_URL as string, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Neon DB
    },
  },
  logging: true, // Enable logging for debugging
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

connectDB();

export { sequelize };
