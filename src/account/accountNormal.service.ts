import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailAuth } from 'src/entities/emailAuth.entity';
import { User } from 'src/entities/user.entity';
import { ErrService } from 'src/err/err.service';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountNormalService {
    constructor(		
        private readonly errService: ErrService,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(EmailAuth)
        private readonly emailRepository: Repository<EmailAuth>
    ) { }
    
    // 패스워드 해쉬화
    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }


    // 회원가입 하기
    async setUser(createUserDto: CreateUserDto) {
        try {
            const user = new User();

            user.email = createUserDto.email;
            user.password = await this.hashPassword(createUserDto.password);
            user.nickname = createUserDto.nickname;
            user.address = createUserDto.address;

            await this.emailRepository.delete({ email: createUserDto.email });
            return await this.userRepository.insert(user).then(async () => {
                return this.errService.signUpOk();
            });
        } catch (err) {
            console.log(err);
            return this.errService.setUserErr();
        }
    }
}