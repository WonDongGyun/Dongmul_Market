import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';

require('dotenv').config();

// **************************************
// * module: mail
// * programer: JaeYoon Lee
// **************************************

@Module({
	imports: [
		MailerModule.forRoot({
			transport: {
				host: process.env.EMAIL_HOST,
				port: 465,
				secure: true, // true for 465, false for other ports
				auth: {
					user: process.env.MAIL_USER, // generated ethereal user
					pass: process.env.MAIL_PASSWORD // generated ethereal password
				},
				tls: { rejectUnauthorized: false }
			},
			defaults: {
				from: '"nest-modules" <user@outlook.com>' // outgoing email ID
			},
			template: {
				// dir: process.cwd() + '/template/',
				dir: process.cwd() + '/template/',
				adapter: new HandlebarsAdapter(), //new HandlebarsAdapter(), //new HandlebarsAdapter(), // or new PugAdapter()
				options: {
					// extName: '.pug',
					strict: true
				}
			}
		})
	],

	providers: []
})
export class MailModule {}
