import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards
} from '@nestjs/common';
import { AccountService } from './account.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create.user.dto';
import { ChkEmailDto } from './dto/chkEmail.dto';
import { ChkLoginDto } from './dto/chkLogin.dto';
import { KakaoChkEmailDto } from './dto/kakaoChkEmail.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { EmailAuthDto } from './dto/emailAuth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dtd';
import { PasswordChangeDto } from './dto/passwordChange.dto';
import { GoogleChkEmailDto } from './dto/googleChkEmail.dto';

@Controller('account')
export class AccountController {
	constructor(private readonly accountService: AccountService) {}

	// 회원 가입
	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return await this.accountService.setUser(createUserDto);
	}

	// 이메일 중복확인
	@Post('chkEmail')
	async chkEmail(@Body() chkEmailDto: ChkEmailDto) {
		return await this.accountService.chkEmail(chkEmailDto);
	}

	// 기본 로그인
	@Post('login')
	async chkLogin(@Body() chkLoginDto: ChkLoginDto) {
		return await this.accountService.chkLogin(chkLoginDto);
	}

	// // 프로필 조회
	// @Get('profile')
	// @UseGuards(AccountGuardJwt)
	// getProfile(@CurrentUser() email: string) {
	// 	return this.accountService.getProfile(email);
	// }

	@Post('mail')
	async mail(@Body() userData: LoginUserDto) {
		console.log(userData);
		const user = await this.accountService.findUserEmail(userData.email);

		if (!user) {
			const CodeEmail = await this.accountService.sendRegisterMail(
				userData.email
			);
			console.log(
				`email ID ${userData.email} not found 인증번호 메일 요청했습니다`
			);
			return CodeEmail;
		} else {
			console.log('이미 있는 계정입니다.');
		}
	}

	@Post('mail/check')
	async mailcheck(@Body() emailAuthDto: EmailAuthDto) {
		return await this.accountService.sendEmailConfirm(emailAuthDto);
	}

	@Get('logout')
	@UseGuards(AuthGuard('jwt'))
	logout(@Req() req, @Res() res) {
		req.logout();
		res.json({ loggedOut: true });
	}

	@Post('/sendpassword')
	async forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
		return await this.accountService.sendEmailPassword(
			forgotPassword.email
		);
	}

	@Post('/changepassword')
	async changePassword(@Body() passwordChangeDto: PasswordChangeDto) {
		return await this.accountService.changePassword(passwordChangeDto);
	}

	//구글 회원가입 및 로그인
	@Post('googleAuth')
	async GoogleAuthCheck(@Body() googleChkEmaildto: GoogleChkEmailDto) {
		return await this.accountService.googleCheck(googleChkEmaildto);
	}

	//카카오계정 저장
	@Post('/kakaoAuth')
	async KakaoAuthCheck(@Body() kakaoChkEmaildto: KakaoChkEmailDto) {
		return await this.accountService.kakaoCheck(kakaoChkEmaildto);
	}
}
