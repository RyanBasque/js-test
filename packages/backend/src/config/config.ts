import dotenv from "dotenv";
dotenv.config();

class Config {
  readonly nodeEnv: string = process.env.NODE_ENV ?? "development";
  readonly port: number = parseInt(process.env.PORT ?? "3000", 10);

  readonly dbHost: string = process.env.DB_HOST ?? "localhost";
  readonly dbPort: number = parseInt(process.env.DB_PORT ?? "3306", 10);
  readonly dbName: string = process.env.DB_NAME ?? "";
  readonly dbUser: string = process.env.DB_USER ?? "";
  readonly dbPass: string = process.env.DB_PASS ?? "";

  readonly jwtSecret: string = process.env.JWT_SECRET ?? "";
  readonly jwtExpiresIn: string = process.env.JWT_EXPIRES_IN ?? "7d";
}

export const config = new Config();
