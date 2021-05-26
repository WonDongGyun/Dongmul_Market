import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
	const httpsOptions = {
		key: fs.readFileSync(
			'/etc/letsencrypt/live/dongmul.shop/privkey.pem',
			'utf8'
		),
		cert: fs.readFileSync(
			'/etc/letsencrypt/live/dongmul.shop/cert.pem',
			'utf8'
		),
		ca: fs.readFileSync(
			'/etc/letsencrypt/live/dongmul.shop/chain.pem',
			'utf8'
		)
	};
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true,
		httpsOptions
	});
	app.useStaticAssets(join(__dirname, '..', 'public'));
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	);
	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
		next();
	});
	await app.listen(3000);
}
bootstrap();
