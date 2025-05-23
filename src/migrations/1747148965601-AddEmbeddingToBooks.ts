import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmbeddingAndTables1680000000000 implements MigrationInterface {
  name = 'AddEmbeddingAndTables1680000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {

    // Enable pgvector
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // Create User table
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "lastName" VARCHAR NOT NULL,
        "email" VARCHAR NOT NULL,
        "password" VARCHAR NOT NULL,
        "active" BOOLEAN DEFAULT true,
        "admin" BOOLEAN DEFAULT false
      )
    `);

    // Create Book table
    await queryRunner.query(`
      CREATE TABLE "book" (
        "id" SERIAL PRIMARY KEY,
        "title" VARCHAR NOT NULL,
        "numberOfPages" INT NOT NULL,
        "edition" VARCHAR NOT NULL,
        "year" INT,
        "category" VARCHAR DEFAULT 'N/A',
        "quantity" INT NOT NULL,
        "coverPath" VARCHAR,
        "authors" TEXT[] NOT NULL
          )
    `);

    // Create UserToBook table
    await queryRunner.query(`
      CREATE TABLE "userToBook" (
        "userToBookId" SERIAL PRIMARY KEY,
        "createdDate" TIMESTAMP DEFAULT now(),
        "userId" INT NOT NULL,
        "bookId" INT NOT NULL,
        "startDate" DATE NOT NULL,
        "endDate" DATE NOT NULL,
        "status" VARCHAR DEFAULT 'Pending',
        "receiverRole" VARCHAR DEFAULT 'user',
        "receiverSeen" BOOLEAN DEFAULT false,
        CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_book" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "userToBook"`);
    await queryRunner.query(`DROP TABLE "book"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS vector`);
  }
}
