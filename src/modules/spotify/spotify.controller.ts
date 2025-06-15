import { Controller, Get } from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller()
export class SpotifyController {
  constructor(private readonly SpotifyService: SpotifyService) {}

  @Get()
  getHello(): string {
    return this.SpotifyService.getSpotify();
  }
}
