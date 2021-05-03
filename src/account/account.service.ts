import { HttpService, Injectable } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { ChkEmailDto } from './dto/chkEmail.dto';
import { ChkLoginDto } from './dto/chkLogin.dto';

@Injectable()
export class AccountService {
	constructor(
		private readonly jwtService: JwtService,

		@InjectRepository(User)
		private readonly userRepository: Repository<User>
	) {}

	// 패스워드 해쉬화
	public async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	// jwt 토큰 만들기
	public getTokenForUser(email: string) {
		return this.jwtService.sign({
			email
		});
	}

	// 회원가입 하기
	async setUser(createUserDto: CreateUserDto) {
		const user = new User();
		user.email = createUserDto.email;
		user.password = await this.hashPassword(createUserDto.password);
		user.nickname = createUserDto.nickname;
		user.address = createUserDto.address;

		return await this.userRepository.save(user).then(async () => {
			return { msg: 'success', errorMsg: '회원가입 성공!' };
		});
	}

	// 이메일 중복확인
	async chkEmail(chkEmailDto: ChkEmailDto) {
		const existingUser = await this.userRepository.findOne({
			email: chkEmailDto.email
		});

		if (existingUser) {
			return { msg: 'fail', errorMsg: '이미 등록된 이메일입니다.' };
		} else {
			return { msg: 'success' };
		}
	}

	// 로그인 확인
	async chkLogin(chkLoginDto: ChkLoginDto) {
		const user = await this.userRepository.findOne({
			email: chkLoginDto.email
		});

		if (!user) {
			return { msg: 'fail', errorMsg: '존재하지 않는 계정입니다.' };
		}

		if (!(await bcrypt.compare(chkLoginDto.password, user.password))) {
			return {
				msg: 'fail',
				errorMsg: '잘못된 이메일 혹은 비밀번호를 입력하셨습니다.'
			};
		}

		return {
			msg: 'success',
			email: user.email,
			nickname: user.nickname,
			token: this.getTokenForUser(user.email)
		};
	}

	// 로그인 확인
	async getProfile(email: string) {
		return await this.userRepository
			.findOne({
				email: email
			})
			.then((findProfile) => {
				if (findProfile) {
					return {
						email: findProfile.email,
						nickname: findProfile.nickname,
						address: findProfile.address
					};
				}
			})
			.catch((err) => {
				return {
					msg: 'fail',
					errorMsg: '프로필 조회 중 오류가 발생하였습니다.'
				};
			});
	}

	googleLogin(req) {
		if (!req.user) {
			return 'no user from google';
		}
		return {
			message: 'User information from google',
			user: req.user
		};
	}

	// logOut(logOut: LogOut): Promise<import('./account.dto').LogOutSuccess> {
	// 	throw new Error('Method not implemented.');
	// }
}

//카카오로그인
@Injectable()
export class KakaoLogin {
	check: boolean;
	accessToken: string;
	accountemail: string;

	private http: HttpService;
	constructor() {
		this.check = false;
		this.http = new HttpService();
		this.accessToken = '';
		this.accountemail = '';
	}
	loginCheck(): void {
		this.check = !this.check;

		return;
	}
	async login(url: string, headers: any): Promise<any> {
		return await this.http.post(url, '', { headers }).toPromise();
	}
	setToken(token: string): boolean {
		this.accessToken = token;
		return true;
	}

	async getEmail(): Promise<any> {
		const _url = 'https://kapi.kakao.com/v2/user/me';
		const _header = {
			Authorization: `bearer ${this.accessToken}`,
			'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
		};
		return await this.http.post(_url, '', { headers: _header }).toPromise();
	}
	setEmail(email: string): boolean {
		this.accountemail = email;
		return true;
	}

	async logout(): Promise<any> {
		const _url = 'https://kapi.kakao.com/v1/user/logout';
		const _header = {
			Authorization: `bearer ${this.accessToken}`
		};
		return await this.http.post(_url, '', { headers: _header }).toPromise();
	}
	async deleteLog(): Promise<any> {
		const _url = 'https://kapi.kakao.com/v1/user/unlink';
		const _header = {
			Authorization: `bearer ${this.accessToken}`
		};
		return await this.http.post(_url, '', { headers: _header }).toPromise();
	}
}
