import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('login')
  login(@Res() res: Response) {
    const authUrl = this.spotifyService.buildAuthUrl();
    return res.redirect(authUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    const tokenData = await this.spotifyService.exchangeCodeForToken(code);
    return tokenData;
  }
}
