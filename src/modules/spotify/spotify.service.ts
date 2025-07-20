import { Injectable } from '@nestjs/common';
import * as querystring from 'querystring';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { CreatePlaylistDto } from '../../dto/create-playlist-dto';
import { getuid } from 'process';
import { SetlistParserService } from '../setlist-parser/setlist-parser.service';

@Injectable()
export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(
    private readonly setlistFmService: SetlistParserService,
    private readonly configService: ConfigService,
  ) {
    this.clientId = this.configService.get('SPOTIFY_CLIENT_ID')!;
    this.clientSecret = this.configService.get('SPOTIFY_CLIENT_SECRET')!;
    this.redirectUri = this.configService.get('SPOTIFY_REDIRECT_URI')!;
  }

  buildAuthUrl(): string {
    const scopes = ['playlist-modify-public', 'playlist-modify-private'];

    const queryParams = querystring.stringify({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
    });

    return `https://accounts.spotify.com/authorize?${queryParams}`;
  }

  async exchangeCodeForToken(code: string) {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
            'base64',
          ),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
      }),
    };

    const response = await axios(authOptions);
    return response.data;
  }

  async getUserId(accessToken: string) {
    const authOptions = {
      url: 'https://api.spotify.com/v1/me',
      method: 'get',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios(authOptions);

    return response.data.id;
  }

  async buildPlaylist(
    playlistName: string,
    setlistFmLink: string,
    accessToken: any,
    userId: any,
  ) {
    const ParsedSetlist =
      await this.setlistFmService.parseSetlistVersion4o(setlistFmLink);
  }
}
