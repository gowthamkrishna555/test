import { Model, DataTypes } from "sequelize";
import { sequelize } from '../lib/sequelize'; 


class Edge extends Model {
  public id!: string;
  public source!: string;
  public target!: string;
}

Edge.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Edge", 
    freezeTableName: true,
    timestamps: false, 
  }
);

export default Edge;
