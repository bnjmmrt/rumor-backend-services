import 'reflect-metadata';
import config from '../config';
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
export class ConnectionManager {
  connection: DataSource;

  public async initializeDbConnection(): Promise<DataSource> {
    try {
      if (!this.connection) {
        const appDataSource = new DataSource({
          type: 'postgres',
          host: config.get('POSTGRES_HOST'),
          port: config.get('POSTGRES_PORT'),
          username: config.get('POSTGRES_USERNAME'),
          password: config.get('POSTGRES_PASSWORD'),
          database: config.get('POSTGRES_DATABASE'),
          entities: [
            'packages/rumor-utils/shared/users/entities/*.ts',
            'packages/rumor-utils/shared/events/entities/*.ts',
            'packages/rumor-utils/shared/users/entities/*.js',
            'packages/rumor-utils/shared/events/entities/*.js',
            'packages/rumor-utils/shared/notifications/entities/*.ts',
            'packages/rumor-utils/shared/notifications/entities/*.js',
          ],
          ...(['development', 'staging', 'production', 'uat'].includes(config.get('NODE_ENV')) && {
            ssl: { rejectUnauthorized: false },
          }),
          synchronize: false,
          logging: true,
        });
        this.connection = await appDataSource.initialize();
      }
      return this.connection;
    } catch (error) {
      throw error;
    }
  }

  public getRepository<T extends ObjectLiteral>(target: EntityTarget<T>): Repository<T> {
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
