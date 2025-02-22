import { Sequelize } from "sequelize";

const sequelize = new Sequelize("neondb", "neondb_owner", "npg_JMoE91GTbzkn", {
  host: "ep-hidden-queen-a1lc2x8d-pooler.ap-southeast-1.aws.neon.tech",
  dialect: "postgres",
  logging: false,
});

export default sequelize;