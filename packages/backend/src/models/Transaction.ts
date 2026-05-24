import {
  Model,
  DataTypes,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  NonAttribute,
} from "sequelize";
import { User } from "./User";

export enum TransactionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export class Transaction extends Model<
  InferAttributes<Transaction>,
  InferCreationAttributes<Transaction>
> {
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<User["id"]> | null;
  declare cpf: string;
  declare description: string;
  declare transactionDate: Date;
  declare pointsValue: number;
  declare monetaryValue: number;
  declare status: CreationOptional<TransactionStatus>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  declare user?: NonAttribute<User>;

  static initModel(sequelize: Sequelize): typeof Transaction {
    Transaction.init(
      {
        id: {
          type: DataTypes.INTEGER.UNSIGNED,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.INTEGER.UNSIGNED,
          allowNull: true,
        },
        cpf: { type: DataTypes.STRING(14), allowNull: false },
        description: { type: DataTypes.STRING(500), allowNull: false },
        transactionDate: { type: DataTypes.DATEONLY, allowNull: false },
        pointsValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        monetaryValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        status: {
          type: DataTypes.ENUM(...Object.values(TransactionStatus)),
          allowNull: false,
          defaultValue: TransactionStatus.PENDING,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: "transactions",
        timestamps: true,
      }
    );
    return Transaction;
  }

  static associate(): void {
    Transaction.belongsTo(User, { foreignKey: "userId", as: "user" });
    User.hasMany(Transaction, { foreignKey: "userId", as: "transactions" });
  }
}
