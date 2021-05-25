import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import {
	ExpressAdapter,
	NestExpressApplication
} from '@nestjs/platform-express';
import { join } from 'path';
import http from 'http';
import https from 'https';
import express from 'express';

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
	const server = express();
	const app = await NestFactory.create<NestExpressApplication>(
		AppModule,
		new ExpressAdapter(server),
		{
			cors: true,
			httpsOptions
		}
	);

	app.useStaticAssets(join(__dirname, '..', 'public'));
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	);

	await app.init();
	http.createServer(server).listen(3001);
	https.createServer(httpsOptions, server).listen(3000);
}
bootstrap();
