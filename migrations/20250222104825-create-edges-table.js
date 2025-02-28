import {  DataTypes } from "sequelize";

export async function up(queryInterface) {
  await queryInterface.createTable("Edge", {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    source: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Node",  // Matches the table name in your Node migration
        key: "id",
      },
      onDelete: "CASCADE",
    },
    target: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Node",  // Matches the table name in your Node migration
        key: "id",
      },
      onDelete: "CASCADE",
    },
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable("Edge");
}
