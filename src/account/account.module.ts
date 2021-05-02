import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
	imports: [TypeOrmModule.forFeature([User])],
	controllers: [AccountController],
	providers: [AccountService]
})
export class AccountModule {}
