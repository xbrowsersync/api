import { MigrationInterface, QueryRunner } from 'typeorm';
import { AppDataSource } from '../db';

export class Initialize1700911500755 implements MigrationInterface {
  name = 'Initialize1700911500755';

  public async up(queryRunner: QueryRunner): Promise<void> {
    AppDataSource.synchronize();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('new_sync_log');
    await queryRunner.dropTable('bookmarks');
  }
}
