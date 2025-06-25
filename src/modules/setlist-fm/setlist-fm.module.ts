import { Module } from '@nestjs/common';
import { SetlistFmService } from './setlist-fm.service';

@Module({
  providers: [SetlistFmService],
  exports: [SetlistFmService],
})
export class SetlistFmModule {}
