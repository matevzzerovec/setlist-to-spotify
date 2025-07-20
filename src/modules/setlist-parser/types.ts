// setlist.types.ts
import { z } from 'zod';

export const ParsedSetlistSchema = z.object({
  artist: z.string().describe('The name of the artist or band'),
  songs: z
    .array(z.string())
    .describe('List of song titles performed during the concert'),
});

export type ParsedSetlist = z.infer<typeof ParsedSetlistSchema>;
