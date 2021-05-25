import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
	// const httpsOptions = {
	// 	key: fs.readFileSync('./secrets/private-key.pem'),
	// 	cert: fs.readFileSync('./secrets/public-certificate.pem')
	// };
	const app = await NestFactory.create<NestExpressApplication>(AppModule, {
		cors: true
		// httpsOptions
	});
	app.useStaticAssets(join(__dirname, '..', 'public'));
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true
		})
	);
	await app.listen(3000);
}
bootstrap();
