import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailAuth } from 'src/entities/emailAuth.entity';
import { User } from 'src/entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { AccountController } from './account.controller';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { MessageService } from '../../global/message/message.service';
import { AccountNormalService } from './services/accountNormal.service';
import { AccountGoogleService } from './services/accountGoogle.service';
import { AccountKakaoService } from './services/accountKakao.service';

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
	providers: [
		JwtStrategy,
		GoogleStrategy,
		MessageService,
		AccountNormalService,
		AccountGoogleService,
		AccountKakaoService
	],
	exports: []
})
export class AccountModule {}
