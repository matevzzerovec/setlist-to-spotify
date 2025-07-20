import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class SetlistParserService {
  async parseSetlistFromUrl(
    url: string,
  ): Promise<{ artist: string; songs: string[] }> {

    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const artist = $('div.setlistHeadline > h1 > a').text().trim();
    const songs: string[] = [];

    $('li.song').each((_, el) => {
      const song = $(el).find('.songLabel').text().trim();
      if (song) songs.push(song);
    });

    return { artist, songs };
  }
}
