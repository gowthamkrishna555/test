"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Node", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
      },
      label: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      position_x: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      position_y: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      color: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Node");
  },
};
