import { Module } from '@nestjs/common';
import { EventsModule } from './modules/websocket/event.module';
import { AppController } from './app.controller';

@Module({
  imports: [EventsModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
