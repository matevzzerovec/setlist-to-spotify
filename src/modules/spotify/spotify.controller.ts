import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { SpotifyService } from './spotify.service';
import { CreatePlaylistDto } from '../../dto/create-playlist-dto';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  @Get('login')
  login(@Res() res: Response) {
    const authUrl = this.spotifyService.buildAuthUrl();
    return res.redirect(authUrl);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokenData = await this.spotifyService.exchangeCodeForToken(code);

    const userId = await this.spotifyService.getUserId(tokenData.access_token);

    res.cookie('access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS in prod only
      sameSite: 'lax',
      maxAge: tokenData.expires_in * 1000,
    });

    res.cookie('user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in * 1000,
    });

    return { success: true };
  }

  @Post('create-playlist')
  async createPlaylist(
    @Req() req: Request,
    @Body() requestBody: CreatePlaylistDto,
  ) {
    const token = req.cookies['access_token'];
    const userId = req.cookies['user_id'];

    if (!token || !userId)
      throw new UnauthorizedException('User is unauthorized.');

    return {
      link: requestBody.setlistFmLink,
      name: requestBody.playlistName,
    };
  }
}
