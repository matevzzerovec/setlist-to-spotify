import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpotifyService } from './modules/spotify/spotify.service';
import { SpotifyController } from './modules/spotify/spotify.controller';
import { ConfigModule } from '@nestjs/config';
import { SetlistParserService } from './modules/setlist-parser/setlist-parser.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, SpotifyController],
  providers: [AppService, SpotifyService, SetlistParserService],
})
export class AppModule {}
