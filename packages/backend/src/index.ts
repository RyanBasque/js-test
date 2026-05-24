import "reflect-metadata";
import "./config/container"; // register DI bindings before routes resolve them
import express from "express";
import { config } from "./config/config";
import { initDatabase } from "./config/database";
import routes from "./routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({
    status: "error",
    message: "Rota não encontrada",
    data: null,
  });
});

app.use(errorMiddleware);

async function start(): Promise<void> {
  await initDatabase();
  app.listen(config.port, () => {
    console.log(`Backend running on http://localhost:${config.port}`);
  });
}

start().catch(console.error);
