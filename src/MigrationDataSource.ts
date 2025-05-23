import { DataSource } from "typeorm"

export default new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "admin",
    entities: [
        "src/user/entities/user.entity.ts", 
        "src/book/entities/book.entity.ts", 
        "src/book/entities/userToBook.ts"
    ],
    migrations:['src/migrations/1747148965601-AddEmbeddingToBooks.ts']
})