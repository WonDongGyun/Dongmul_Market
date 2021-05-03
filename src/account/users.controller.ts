import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AccountService } from './account.service';
import { CreateUserDto } from './dto/create.user.dto';



@Controller('users')
export class UsersController {
	constructor(
		private readonly accountService: AccountService,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		const user = new User();

		if (createUserDto.password !== createUserDto.password) {
			throw new BadRequestException(['Passwords are not identical']);
		}

		const existingUser = await this.userRepository.findOne({
			where: [
				// { username: createUserDto.username },
				{ email: createUserDto.email }
			]
		});

		if (existingUser) {
			throw new BadRequestException([
				'username or email is already taken'
			]);
		}
		user.email = createUserDto.email;
		user.password = await this.accountService.hashPassword(
			createUserDto.password
		);
		user.nickname = createUserDto.nickname;
		user.address =  createUserDto.address

		return {
			...(await this.userRepository.save(user))
			// token: this.authService.getTokenForUser(user),
		};
	}
}
