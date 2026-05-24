import { Sequelize } from "sequelize";
import { config } from "./config";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";

const sequelize = new Sequelize({
  dialect: "mysql",
  host: config.dbHost,
  port: config.dbPort,
  database: config.dbName,
  username: config.dbUser,
  password: config.dbPass,
  logging: config.nodeEnv === "development" ? console.log : false,
  define: { underscored: false },
});

export async function initDatabase(): Promise<void> {
  User.initModel(sequelize);
  Transaction.initModel(sequelize);
  Transaction.associate();
  await sequelize.authenticate();
  await sequelize.sync({ alter: config.nodeEnv === "development" });
}

export default sequelize;
