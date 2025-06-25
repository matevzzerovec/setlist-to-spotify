import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { SetlistFmModule } from '../setlist-fm/setlist-fm.module';

@Module({
  imports: [SetlistFmModule],
  controllers: [SpotifyController],
  providers: [SpotifyService],
})
export class SpotifyModule {}
