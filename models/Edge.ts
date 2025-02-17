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
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    source: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Node,  
        key: 'id',    
      },
      onDelete: 'CASCADE', 
    },
    target: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Node,  
        key: 'id',    
      },
      onDelete: 'CASCADE', 
    },
  },
  {
    sequelize,
    tableName: "Edge", 
    
    timestamps: false, 
  }
);


Edge.belongsTo(Node, { foreignKey: 'source', as: 'SourceNode' });
Edge.belongsTo(Node, { foreignKey: 'target', as: 'TargetNode' });

export default Edge;
