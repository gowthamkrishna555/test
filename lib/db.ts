import { Sequelize } from "sequelize";

const sequelize = new Sequelize("reactflow_db", "nextjs_user", "Password@123", {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

export default sequelize;