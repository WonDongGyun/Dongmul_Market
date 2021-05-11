import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from 'src/account/current-account.decorator';
import { AccountGuardJwt } from 'src/guard/account.guard.jwt';
import { SetItemDto } from './dto/setItem.dto';
import { MainPageService } from './main-page.service';

@Controller('mainPage')
export class MainPageController {
	constructor(private readonly mainPageService: MainPageService) {}

	// 메인 화면
	// 사용자의 주소와 같은 주소를 가진 사람들의 경매 진행 중 목록만 가져옴
	@Get()
	@UseGuards(AccountGuardJwt)
	async getItem(@CurrentUser() email: string) {
		return await this.mainPageService.getItem(email);
	}

	// 로그인 하지 않은 사람들을 위한 메인 화면
	// 사용자의 주소와 같은 주소를 가진 사람들의 경매 진행 중 목록만 가져옴
	@Get('noLogin')
	async noLoginGetItem() {
		return await this.mainPageService.noLoginGetItem();
	}

	// 경매 글 작성
	@Post()
	@UseGuards(AccountGuardJwt)
	@UseInterceptors(FileInterceptor('file'))
	async setItem(
		@Body() setItemDto: SetItemDto,
		@UploadedFile() file,
		@CurrentUser() email: string
	) {
		return await this.mainPageService.setItem(setItemDto, file, email);
	}

	// 경매 글 상세내용
	@Get(':itemId')
	async getDetail(@Param('itemId') itemId: string) {
		return await this.mainPageService.getDetail(itemId);
	}

	// 로그인한 사용자의 경매 글 상세내용 채팅방 버튼 여부
	// 채팅방에 입장안한 상태라면, 채팅방 입장 버튼은 무조건 있어야함. 1:1은 꺼져있어야 함.
	@Post(':icrId')
	@UseGuards(AccountGuardJwt)
	async getButton(
		@CurrentUser() email: string,
		@Param('icrId') icrId: string
	) {
		return await this.mainPageService.getButton(email, icrId);
	}
}
