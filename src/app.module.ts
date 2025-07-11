import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpotifyService } from './modules/spotify/spotify.service';
import { SpotifyController } from './modules/spotify/spotify.controller';
import { ConfigModule } from '@nestjs/config';
import { SetlistFmService } from './modules/setlist-fm/setlist-fm.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, SpotifyController],
  providers: [AppService, SpotifyService, SetlistFmService],
})
export class AppModule {}
