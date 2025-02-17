import { Model, DataTypes } from "sequelize";
import  {sequelize}  from "../lib/sequelize";

class Node extends Model {
  public id!: string;
  public label!: string;
  public position_x!: number;
  public position_y!: number;
  public color!: string;
}

Node.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    position_x: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    position_y: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Node", //  Ensure it matches your database table
    freezeTableName: true, // Prevent Sequelize from pluralizing
    timestamps: false, 
  }
);

export default Node;
