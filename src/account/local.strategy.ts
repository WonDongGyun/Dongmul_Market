import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Strategy } from 'passport-local';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	private readonly logger = new Logger(LocalStrategy.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {
		super({ usernameField: 'email' });
	}
	//유저네임으로 로그인
	public async validate(email: string, password: string): Promise<any> {
		console.log(email, password);
		const user = await this.userRepository.findOne({
			email
			// where: { username},
		});

		if (!user) {
			this.logger.debug(`User ${email} not found!`);
			throw new UnauthorizedException();
		}

		if (!(await bcrypt.compare(password, user.password))) {
			this.logger.debug(`Invalid credentials for user ${email}`);
			throw new UnauthorizedException();
		}

		return user;
	}
}
