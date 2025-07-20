import { Injectable } from '@nestjs/common';
import axios from 'axios';
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

  async parseSetlistVersion4o(url: string): Promise<ParsedSetlist> {
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

  async parseSetlistVersion3_5(url: string): Promise<ParsedSetlist> {
    const response = await axios.get(url);
    const html = response.data;

    const chatResponse = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'Extract artist name and list of songs from HTML input. Respond ONLY with JSON like: { "artist": "name", "songs": ["Song 1", "Song 2"] }',
        },
        {
          role: 'user',
          content: html,
        },
      ],
    });

    const rawContent = chatResponse.choices[0].message?.content;

    const parsed: ParsedSetlist = JSON.parse(rawContent || '{}');

    return parsed;
  }
}
