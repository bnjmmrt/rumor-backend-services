// import "reflect-metadata";
// import config from "../config";

// import { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";

// export class ConnectionManager {
//   connection: DataSource;

//   public async initializeDbConnection(): Promise<DataSource> {
//     try {
//       if (!this.connection) {
//         const appDataSource = new DataSource({
//           type: 'postgres',
//           host: config.get("POSTGRES_HOST"),
//           port: config.get("POSTGRES_PORT"),
//           username: config.get("POSTGRES_USERNAME"),
//           password: config.get("POSTGRES_PASSWORD"),
//           database: config.get("POSTGRES_DATABASE"),
//           entities: [
//             "node_modules/rumor-utils/shared/users/entities/*.ts",
//             "node_modules/rumor-utils/shared/events/entities/*.ts",
//           ],
//           synchronize: false,
//           logging: false,
//           // ssl: { rejectUnauthorized: false },
//           migrationsTableName: "users-migrations",
//           migrations: ["src/database/migrations/*.ts"],
//           migrationsRun: true,
//         });
//         this.connection = await appDataSource.initialize();
//       }
//       return this.connection;
//     } catch (error) {
//       throw error;
//     }
//   }

//   public getRepository<T extends ObjectLiteral>(
//     target: EntityTarget<T>
//   ): Repository<T> {
//     return this.connection.getRepository(target);
//   }

//   public async closeConnection(): Promise<void> {
//     await this.connection.destroy();
//   }

//   public async runMigrations(): Promise<void> {
//     await this.connection.runMigrations();
//   }

//   public async runSeeders(): Promise<void> {}
// }

// const connectionManager = new ConnectionManager();

// export default connectionManager;



import "reflect-metadata";
import config from "../config";
import { DataSource, EntityTarget, ObjectLiteral, Repository } from "typeorm";

let connection: DataSource | null = null; // Initialize to null

export const initializeDataSource = async () => {
    try {

      connection = new DataSource({
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
      });

    } catch (error) {
        console.error("Error initializing DataSource:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

export class ConnectionManager {

  public async initializeDbConnection(): Promise<DataSource> {
    try {
      if (!connection || !connection.isInitialized) {
        connection = await connection.initialize();
      }
      return connection;
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }

  public getRepository<T extends ObjectLiteral>(
    target: EntityTarget<T>
  ): Repository<T> {
    if (!connection || !connection.isInitialized) {
      throw new Error("Database not initialized. Call initializeDbConnection first.");
    }
    return connection.getRepository(target);
  }

  public async closeConnection(): Promise<void> {
    if (connection && connection.isInitialized) {
      await connection.destroy();
      connection = null; // Reset connection after destroy
    }
  }

  public async runMigrations(): Promise<void> {
    const connection = await this.initializeDbConnection();
    await connection.runMigrations();
  }

  public async runSeeders(): Promise<void> {}
}

const connectionManager = new ConnectionManager();
export { connectionManager };

export default connection;

