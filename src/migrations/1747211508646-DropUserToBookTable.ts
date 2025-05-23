import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUserToBookTable1747211508646 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.dropTable('user_to_book')

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
