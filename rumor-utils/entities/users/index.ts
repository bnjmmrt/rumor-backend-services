import "reflect-metadata";
import config from "../config";

import { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";

export class ConnectionManager {
  connection: DataSource;

  public async initializeDbConnection(): Promise<DataSource> {
    try {
      if (!this.connection) {
        const appDataSource = new DataSource({
          type: config.get("POSTGRES_DATABASE"),
          host: config.get("POSTGRES_HOST"),
          port: config.get("POSTGRES_PORT"),
          username: config.get("POSTGRES_USERNAME"),
          password: config.get("POSTGRES_PASSWORD"),
          database: config.get("POSTGRES_DATABASE"),
          entities: [ "../../../"+"/entities/*.ts"],
          synchronize: false,
          logging: false,
          ssl: { rejectUnauthorized: false }
        });
        this.connection = await appDataSource.initialize();
      }
      return this.connection;
    } catch (error) {
      throw error;
    }
  }

  public getRepository<T extends ObjectLiteral>(
    target: EntityTarget<T>
  ): Repository<T> {
    return this.connection.getRepository(target);
  }

  public async closeConnection(): Promise<void> {
    await this.connection.destroy();
  }

  public async runMigrations(): Promise<void> {
    await this.connection.runMigrations();
  }

  public async runSeeders(): Promise<void> {}
}

const connectionManager = new ConnectionManager();

export default connectionManager;
