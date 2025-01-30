import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReferralCodeSeq1723662848830 implements MigrationInterface {
  name = 'ReferralCodeSeq1723662848830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE referral_code_seq START WITH 10000;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE referral_code_seq;`);
  }
}
