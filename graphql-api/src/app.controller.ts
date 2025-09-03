import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PersonService } from './gql-layer/person-service.interface';
import { GeneratorService } from './sequelize-layer/services/generator.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private genService: GeneratorService) {}

  @Get("/health")
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/populate')
  async populateDatabase() {
    return this.genService.populateDB();
  }
}
