import { Module } from '@nestjs/common';
import { ErrService } from './err.service';

@Module({
	providers: [ErrService]
})
export class ErrModule {}
