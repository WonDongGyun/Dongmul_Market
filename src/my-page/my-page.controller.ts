import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MyPageService } from './my-page.service';
import { AddressChange } from './dto/addressChange.dto';
import { AccountGuardJwt } from 'src/guard/account.guard.jwt';
import { CurrentUser } from 'src/account/current-account.decorator';

// **************************************
// * controller: my-page
// * programer: DongGyun Won, JaeYoon Lee
// **************************************
@Controller('myPage')
export class MyPageController {
	constructor(private readonly myPageService: MyPageService) {}
	//주소 변경
	@Post('address')
	@UseGuards(AccountGuardJwt)
	async AddressChange(@Body() addressChangeDto: AddressChange) {
		return await this.myPageService.addressChange(addressChangeDto);
	}

	//myPage 내가 작성한 글 정보 보기
	@Get()
	@UseGuards(AccountGuardJwt)
	async getMyPost(@CurrentUser() email: string) {
		return await this.myPageService.getMyPost(email);
	}
}
