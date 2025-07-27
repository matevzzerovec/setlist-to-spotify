import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { load } from 'cheerio';
import OpenAI from 'openai';
import { ParsedSetlist, ParsedSetlistSchema } from './types';
import { zodTextFormat } from 'openai/helpers/zod';

@Injectable()
export class SetlistParserService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async parseSetlistHtml(url: string): Promise<ParsedSetlist> {
    const response = await axios.get(url);
    const $ = load(response.data);

    const artist = $('div.setlistHeadline h1 a').first().text().trim();

    const songs: string[] = [];
    $('ol.songsList li.song .songLabel').each((_, el) => {
      const song = $(el).text().trim();
      if (song) songs.push(song);
    });

    console.debug('Artist: ', artist);
    console.debug('Songs: ', songs);

    return { artist, songs };
  }

  async parseSetlistOpenAi(url: string): Promise<ParsedSetlist> {
    const response = await axios.get(url);
    const html = response.data;

    const openaApiResponse = await this.openai.responses.parse({
      model: 'gpt-4o-2024-08-06',
      input: [
        {
          role: 'system',
          content:
            'You are an expert in extracting structured information from HTML. You will receive raw HTML from a setlist.fm page. Extract the artist name and the list of songs performed.',
        },
        {
          role: 'user',
          content: html,
        },
      ],
      // schema: ParsedSetlistSchema,
      text: {
        format: zodTextFormat(ParsedSetlistSchema, 'responseSchema'),
      },
    });

    console.log(openaApiResponse);

    const parsed = ParsedSetlistSchema.parse(openaApiResponse);

    console.log(parsed);

    return parsed;
  }
}
