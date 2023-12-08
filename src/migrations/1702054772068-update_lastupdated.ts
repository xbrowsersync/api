import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateLastupdated1702054772068 implements MigrationInterface {
  name = 'UpdateLastupdated1702054772068';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.startTransaction();

    await queryRunner.dropColumn('bookmarks', 'lastUpdated');
    await queryRunner.addColumn(
      'bookmarks',
      new TableColumn({
        name: 'lastUpdated',
        type: 'datetime',
      })
    );

    // await queryRunner.commitTransaction();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('bookmarks', 'lastUpdated');
    await queryRunner.addColumn(
      'bookmarks',
      new TableColumn({
        name: 'lastUpdated',
        type: 'datetime',
      })
    );
  }
}
