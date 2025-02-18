import { DataSource } from "typeorm";
import config from "../config";
console.log(config.getAll());

export const appDataSource = new DataSource({
    type: 'postgres',
    host: config.get("POSTGRES_HOST"),
    port: config.get("POSTGRES_PORT"),
    username: config.get("POSTGRES_USERNAME"),
    password: String(config.get("POSTGRES_PASSWORD")),
    database: config.get("POSTGRES_DATABASE"),
    entities: [
      "node_modules/rumor-utils/shared/users/entities/*.ts",
      "node_modules/rumor-utils/shared/events/entities/*.ts",
    ],
    synchronize: false,
    logging: false,
    migrationsTableName: "users-migrations",
    migrations: ["src/database/migrations/*.ts"],
    migrationsRun: false,
}) 