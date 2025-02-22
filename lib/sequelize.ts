import { Sequelize } from "sequelize";

if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in environment variables");
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // Fix here: No `require` function, just `true`
      rejectUnauthorized: false, // Required for NeonDB
    },
  },
  logging: process.env.NODE_ENV === "development", // Log queries only in dev mode
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
