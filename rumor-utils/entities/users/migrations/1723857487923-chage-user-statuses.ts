import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeUserStatuses1723857487923 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE public.user ALTER COLUMN status TYPE VARCHAR;
            UPDATE public.user SET status = 'NEW_APPLICANT' WHERE status = 'PENDING';
            UPDATE public.user SET status = 'UNRECOGNIZED' WHERE status <> 'ACTIVE';
            DROP TYPE user_status_enum;
            CREATE TYPE user_status_enum AS ENUM ('NEW_APPLICANT', 'ACTIVE', 'WAITLISTED', 'DEACTIVATED', 'REJECTED', 'UNRECOGNIZED');
            ALTER TABLE public.user ALTER COLUMN status TYPE user_status_enum USING status::user_status_enum;
        `);
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
