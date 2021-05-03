import { HttpService, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LogOut } from './account.dto';

@Injectable()
export class AccountService {
	constructor(private readonly jwtService: JwtService) {}
	// @InjectRepository(User)
	// private readonly userRepository: Repository<User>;



	public getTokenForUser(user: User): string {
		return this.jwtService.sign({
			email: user.email,
			sub: user
		});
	}

	public async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
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

	logOut(logOut: LogOut): Promise<import('./account.dto').LogOutSuccess> {
		throw new Error('Method not implemented.');
	}
	
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