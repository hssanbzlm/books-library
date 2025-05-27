import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';

const NOT_FOUND_BOOKS_PROMPT='You are an assistant inside a web application that mainly borrow books who response in friendly way to say that unfortunately we did not find books to recommend that meet his needs, do not ask further questions, just tell him to try searching by himself in our library and add emojis in your response'
@Injectable()
export class BookRecommendService {
  constructor(
    @InjectRepository(Book) private bookRepo: Repository<Book>,

    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async recommend(text:string) {
    const frontUrl = this.configService.get<string>('FRONT_URL');
    const chatCompletionToken = this.configService.get<string>(
      'CHAT_COMPLETION_TOKEN',
    );
    const chatCompletionUrl = this.configService.get<string>(
      'CHAT_COMPLETION_URL',
    );
    const chatCompletionModel = this.configService.get<string>(
      'CHAT_COMPLETION_MODEL',
    );
    let friendlyPrompt= NOT_FOUND_BOOKS_PROMPT;

    const books = await this.bookCosineSimilarity(text);
    const recommendation = books.map((book) => ({
      title: book.title,
      bookUrl: `${frontUrl}/user/book/${book.id}`,
      synopsis: book.synopsis,
    }));
     if(recommendation.length){
       friendlyPrompt = `Recommend the following books to a user based on their interests. Write in a warm, clear, and engaging tone, but do not include greetings or introductions. Just recommend the books directly. Use the synopsis to briefly describe each book,
        and include a link to help the user read more about it. ${JSON.stringify(recommendation)}. 
       Output a short paragraph that naturally presents these books as great choices, 
       using the synopsis and the URLs to help the user learn more. The most important thing, always use the url of each book in response.
       do not use markdown language and this is mandatory, only put the link between two parentheses"
       `;
     }

       const response = await lastValueFrom(
         this.httpService.post(
           chatCompletionUrl,
           {
             model: chatCompletionModel,
             messages: [
               {
                 role: 'user',
                 content: friendlyPrompt,
               },
             ],
           },
           { headers: { Authorization: `Bearer ${chatCompletionToken}` } },
         ),
       );
       return response.data.choices[0].message;
     
  }

  async generateBookEmbedding(dataToEmbed: any): Promise<number[]> {
    const token = this.configService.get<string>('EMBEDDING_TOKEN');
    const embeddingUrl= this.configService.get<string>('EMBEDDING_URL');
    const embeddingModel = this.configService.get<string>('EMBEDDING_MODEL');

    const response = await lastValueFrom(
      this.httpService.post(
        embeddingUrl,
        { model: embeddingModel, input: [dataToEmbed] },
        { headers: { Authorization: `Bearer ${token}` } },
      ),
    );
    return response.data.data[0].embedding;
  }

  private async bookCosineSimilarity(text: string) {
    const targetVectorNumber = await this.generateBookEmbedding(text);
    const targetVectorString = `[${targetVectorNumber.join(',')}]`;

    const result = (await this.bookRepo.query(
      `
      SELECT *, (embedding::vector) <=> $1::vector AS similarity
      FROM book
      where (embedding::vector) <=> $1::vector <= 0.5
      ORDER BY similarity ASC
      LIMIT $2 
      `,
      [targetVectorString, 5],
    )) as Book[];
    return result;
  }
}
