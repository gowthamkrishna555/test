import { Model, DataTypes } from "sequelize";
import { sequelize } from '../lib/sequelize';
import Node from './Node';  

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
      references: {
        model: Node,  
        key: 'id',    
      },
      onDelete: 'CASCADE', 
    },
    target: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Node,  // Reference the Node model
        key: 'id',    // 'id' field in the Node model
      },
      onDelete: 'CASCADE', // Optional: delete edges when the associated node is deleted
    },
  },
  {
    sequelize,
    tableName: "Edge", 
    freezeTableName: true,
    timestamps: false, 
  }
);

// Ensure relationships are set up in Sequelize
Edge.belongsTo(Node, { foreignKey: 'source', as: 'SourceNode' });
Edge.belongsTo(Node, { foreignKey: 'target', as: 'TargetNode' });

export default Edge;
