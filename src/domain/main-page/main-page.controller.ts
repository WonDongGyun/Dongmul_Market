import {
	Body,
	Controller,
	Get,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/domain/account/current-account.decorator';
import { AccountGuardJwt } from 'src/guard/account.guard.jwt';
import { SetItemDto } from './dto/setItem.dto';
import { MainPageService } from './main-page.service';

// **************************************
// * controller: main-page
// * programer: DongGyun Won
// **************************************

@Controller('mainPage')
export class MainPageController {
	constructor(private readonly mainPageService: MainPageService) {}

	// 메인 화면
	// 사용자의 주소와 같은 주소를 가진 사람들의 경매 진행 중 목록만 가져옴
	@Get()
	@UseGuards(AccountGuardJwt)
	async getPostList(@CurrentUser() email: string) {
		return await this.mainPageService.getPostList(email);
	}

	// 로그인 하지 않은 사람들을 위한 메인 화면
	// 사용자의 주소와 같은 주소를 가진 사람들의 경매 진행 중 목록만 가져옴
	@Get('noLogin')
	async noLoginGetPost() {
		return await this.mainPageService.noLoginGetPost();
	}

	// 경매 글 작성
	@Post('write')
	@UseGuards(AccountGuardJwt)
	@UseInterceptors(FileInterceptor('file'))
	async writePost(
		@Body() setItemDto: SetItemDto,
		@UploadedFile() file,
		@CurrentUser() email: string
	) {
		const a = new Date(setItemDto.deadLine);
		return await this.mainPageService.writePost(setItemDto, file, email);
	}
}
