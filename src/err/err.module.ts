import { Module } from '@nestjs/common';
import { ErrService } from './err.service';
import { ErrController } from './err.controller';

@Module({
  providers: [ErrService],
  controllers: [ErrController]
})
export class ErrModule {}
