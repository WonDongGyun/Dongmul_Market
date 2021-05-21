import { Module } from '@nestjs/common';
import {  MessageService } from './message.service';

@Module({
	providers: [MessageService]
})
export class MessageModule {}
