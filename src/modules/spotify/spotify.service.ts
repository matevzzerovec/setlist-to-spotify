import { Injectable } from '@nestjs/common';

@Injectable()
export class SpotifyService {
  getSpotify(): string {
    return 'Hello spotify!';
  }
}
