import { Module } from '@nestjs/common';
import { SetlistParserService } from './setlist-parser.service';

@Module({
  providers: [SetlistParserService],
  exports: [SetlistParserService],
})
export class SetlistParserModule {}
