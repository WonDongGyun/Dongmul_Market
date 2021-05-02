import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService {
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}
}
