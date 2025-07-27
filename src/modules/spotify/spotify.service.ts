import { ConsoleLogger, Injectable } from '@nestjs/common';
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
          'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
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

  async buildPlaylist(playlistName: string, setlistFmLink: string, accessToken: any, userId: any) {
    const parsedSetlist = await this.setlistFmService.parseSetlistHtml(setlistFmLink);

    const trackUris: string[] = [];
    for (const song of parsedSetlist.songs) {
      const uri = await this.searchTrack(accessToken, parsedSetlist.artist, song);
      if (uri) trackUris.push(uri);
    }

    const playlistId = await this.createPlaylist(
      accessToken,
      userId,
      playlistName || parsedSetlist.artist,
    );

    await this.addTracksToPlaylist(accessToken, playlistId, trackUris);

    return {
      playlistId,
      tracksAdded: trackUris.length,
      failedMatches: parsedSetlist.songs.length - trackUris.length,
    };
  }

  async searchTrack(accessToken: string, artist: string, song: string) {
    const cleanedTitle = this.normalizeForSearch(this.cleanSongTitle(song));
    const normalizedArtist = this.normalizeForSearch(artist);

    const queries = [`track:${cleanedTitle} artist:${normalizedArtist}`, `track:${cleanedTitle}`];

    for (const query of queries) {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.tracks.items.length > 0) {
        return response.data.tracks.items[0].uri;
      }
    }

    console.log('Coould not find song: ', song);

    return null;
  }

  cleanSongTitle(title: string): string {
    return title
      .replace(/\(.*?\)/g, '') // remove ( ... )
      .replace(/\[.*?\]/g, '') // remove [ ... ]
      .replace(/feat\..*/i, '') // remove "feat. ..."
      .trim();
  }

  normalizeForSearch(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  async createPlaylist(accessToken: string, userId: string, playlistName: string) {
    const url = `https://api.spotify.com/v1/users/${userId}/playlists`;

    const response = await axios.post(
      url,
      {
        name: playlistName,
        public: false,
        description: 'Generated from Setlist.fm',
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.id;
  }

  async addTracksToPlaylist(accessToken: string, playlistId: string, uris: string[]) {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

    await axios.post(
      url,
      { uris },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
