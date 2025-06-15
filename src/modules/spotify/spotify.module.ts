import { Module } from '@nestjs/common';
import { SpotifyController } from './spotify.controller';
import { SpotifyService } from './spotify.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [SpotifyController],
  providers: [SpotifyService],
})
export class SpotifyModule {}
