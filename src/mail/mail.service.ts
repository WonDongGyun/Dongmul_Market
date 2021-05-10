import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MailService {
	constructor(private readonly mailerService: MailerService) {}

	// async sendUserConfirmation(user: User, token: string) {
	// 	const url = `http://localhost:3000/account/confirm?token=${token}`;

	// 	await this.mailerService.sendMail({
	// 		to: user.email,
	// 		// from: '"Support Team" <support@example.com>', // override default from
	// 		subject: 'Welcome to Nice App! Confirm your Email',
	// 		template:
	// 			'C:/Users/uon10/Desktop/dongmul/templates/confirmation.hbs', // `.hbs` extension is appended automatically
	// 		context: {
	// 			name: user.nickname,
	// 			url
	// 		}
	// 	});
	// }

	public example2(): void {
		this.mailerService
			.sendMail({
				to: 'uon10@naver.com',
				from: 'ljayoon@gmail.com',
				subject: 'Testing Nest Mailermodule with template ✔',
				template: 'C:/Users/uon10/Desktop/dongmul/templates/index.hbs', // The `.pug` or `.hbs` extension is appended automatically.
				context: {
					// Data to be sent to template engine.
					code: 'cf1a3f828287',
					username: 'john doe'
				}
			})
			.then((success) => {
				console.log(success);
			})
			.catch((err) => {
				console.log(err);
			});
	}
}
