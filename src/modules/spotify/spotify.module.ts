import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { SetlistParserModule } from '../setlist-parser/setlist-parser.module';

@Module({
  imports: [SetlistParserModule],
  controllers: [SpotifyController],
  providers: [SpotifyService],
})
export class SpotifyModule {}
