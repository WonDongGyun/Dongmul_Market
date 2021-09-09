import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseFilters,
	UseGuards
} from '@nestjs/common';
// import { AccountService } from './account.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create.user.dto';
import { ChkLoginDto } from './dto/chkLogin.dto';
import { KakaoChkEmailDto } from './dto/kakaoChkEmail.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { EmailAuthDto } from './dto/emailAuth.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dtd';
import { PasswordChangeDto } from './dto/passwordChange.dto';
import { GoogleChkEmailDto } from './dto/googleChkEmail.dto';
import { AccountNormalService } from './services/accountNormal.service';
import { AccountGoogleService } from './services/accountGoogle.service';
import { AccountKakaoService } from './services/accountKakao.service';
import { MessageService } from 'src/global/message/message.service';
import { AccountGuardJwt } from 'src/guard/account.guard.jwt';
import { CurrentUser } from './current-account.decorator';
import { ExceptionHandler } from 'src/global/exception/ExceptionHandler';

// **************************************
// * controller: account
// * programer: JaeYoon Lee
// **************************************

@Controller('account')
@UseFilters(ExceptionHandler)
export class AccountController {
	constructor(
		// private readonly accountService: AccountService,
		private readonly accountNormalService: AccountNormalService,
		private readonly accountGoogleService: AccountGoogleService,
		private readonly accountKakaoService: AccountKakaoService,
		private readonly messageService: MessageService
	) {}

	// 회원 가입
	@Post()
	async create(@Body() createUserDto: CreateUserDto) {
		return await this.accountNormalService.setUser(createUserDto);
	}

	// 기본 로그인
	@Post('login')
	async chkLogin(@Body() chkLoginDto: ChkLoginDto) {
		return await this.accountNormalService.chkLogin(chkLoginDto);
	}

	// // 프로필 조회
	// @Get('profile')
	// @UseGuards(AccountGuardJwt)
	// getProfile(@CurrentUser() email: string) {
	// 	return this.accountService.getProfile(email);
	// }

	// 이메일 중복확인 및 이메일 인증 보내기
	@Post('mail')
	async mail(@Body() loginUserDto: LoginUserDto) {
		return await this.accountNormalService
			.chkEmail(loginUserDto)
			.then(async (findEmail) => {
				if (findEmail) {
					return this.messageService.existEmail();
				} else {
					return await this.accountNormalService.sendRegisterMail(
						loginUserDto.email
					);
				}
			});
	}
	//메일 인증번호 확인
	@Post('mail/check')
	async mailcheck(@Body() emailAuthDto: EmailAuthDto) {
		return await this.accountNormalService.sendEmailConfirm(emailAuthDto);
	}
	//로그아웃
	@Get('logout')
	@UseGuards(AuthGuard('jwt'))
	logout(@Req() req, @Res() res) {
		req.logout();
		res.json({ loggedOut: true });
	}

	//비밀번호 인증번호 전송
	@Post('/sendpassword')
	async forgotPassword(@Body() forgotPassword: ForgotPasswordDto) {
		return await this.accountNormalService.sendEmailPassword(
			forgotPassword.email
		);
	}
	//비밀번호 변경
	@Post('/changepassword')
	async changePassword(@Body() passwordChangeDto: PasswordChangeDto) {
		return await this.accountNormalService.changePassword(
			passwordChangeDto
		);
	}

	//구글 회원가입 및 로그인
	@Post('googleAuth')
	async GoogleAuthCheck(@Body() googleChkEmaildto: GoogleChkEmailDto) {
		return await this.accountGoogleService.googleCheck(googleChkEmaildto);
	}

	//카카오계정 저장
	@Post('/kakaoAuth')
	async KakaoAuthCheck(@Body() kakaoChkEmaildto: KakaoChkEmailDto) {
		return await this.accountKakaoService.kakaoCheck(kakaoChkEmaildto);
	}

	// front redux set
	@Post('/reset')
	@UseGuards(AccountGuardJwt)
	async getPostList(@CurrentUser() email: string) {
		return await this.accountNormalService.resetRedux(email);
	}
}
