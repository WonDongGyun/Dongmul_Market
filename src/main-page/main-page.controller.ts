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
	getItem(@CurrentUser() email: string) {
		return this.mainPageService.getItem(email);
	}

	// 로그인 하지 않은 사람들을 위한 메인 화면
	// 사용자의 주소와 같은 주소를 가진 사람들의 경매 진행 중 목록만 가져옴
	@Get('noLogin')
	noLoginGetItem() {
		return this.mainPageService.noLoginGetItem();
	}

	// 경매 글 작성
	@Post()
	@UseGuards(AccountGuardJwt)
	@UseInterceptors(FileInterceptor('file'))
	setItem(
		@Body() setItemDto: SetItemDto,
		@UploadedFile() file,
		@CurrentUser() email: string
	) {
		return this.mainPageService.setItem(setItemDto, file, email);
	}

	// 경매 글 상세내용
	@Get(':itemId')
	getDetail(@Param() itemId: string) {
		return this.mainPageService.getDetail(itemId);
	}
}
