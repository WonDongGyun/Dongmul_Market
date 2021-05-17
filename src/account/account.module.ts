import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailAuth } from 'src/entities/emailAuth.entity';
import { User } from 'src/entities/user.entity';
import { MailModule } from 'src/mail/mail.module';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { ErrService } from '../err/err.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, EmailAuth]),
		// PassportModule,
		MailModule,
		JwtModule.registerAsync({
			useFactory: () => ({
				secret: process.env.SECRET_KEY,
				signOptions: {
					expiresIn: '60m'
				}
			})
		})
	],
	controllers: [AccountController],
	providers: [AccountService, JwtStrategy, GoogleStrategy, ErrService],
	exports: []
})
export class AccountModule {}
