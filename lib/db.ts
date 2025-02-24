import { Sequelize } from "sequelize";

const sequelize = new Sequelize("neondb", "neondb_owner", "npg_H5BKa6EwhvFl", {
  host: "ep-purple-wildflower-a1gtfkf9-pooler.ap-southeast-1.aws.neon.tech",
  dialect: "postgres",
  logging: false,
});

export default sequelize;