import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ErrService } from 'src/err/err.service';
import { Repository } from 'typeorm';
import { GoogleChkEmailDto } from './dto/googleChkEmail.dto';

@Injectable()
export class AccountGoogleService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly errService: ErrService,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }
    
    // jwt 토큰 만들기
    public getTokenForUser(email: string) {
        return this.jwtService.sign({
            email
        });
    }
    
    //구글 로그인
    async googleCheck(googleChkEmaildto: GoogleChkEmailDto): Promise<any> {
        try {
            const google = await this.userRepository.findOne({
                email: googleChkEmaildto.email
            });
            console.log(google);
            if (google) {
                return await this.userRepository
                    .findOne({
                        email: googleChkEmaildto.email,
                        password: null
                    })
                    .then((findGoogle) => {
                        if (findGoogle) {
                            const token = this.getTokenForUser(
                                googleChkEmaildto.email
                            );
                            return {
                                msg: 'success',
                                email: findGoogle.email,
                                nickname: findGoogle.nickname,
                                token: 'bearer ' + token
                            };
                        } else {
                            return this.errService.existEmail();
                        }
                    })
                    .catch((err) => {
                        return this.errService.socialLoginFail();
                    });
            } else {
                const user = new User();
                user.email = googleChkEmaildto.email;
                user.nickname =
                    googleChkEmaildto.lastName + googleChkEmaildto.firstName;
                user.address = ' ';

                return await this.userRepository.save(user).then(async () => {
                    return this.errService.signUpOk();
                });
            }
        } catch (err) {
            console.log(err);
            return this.errService.setUserErr();
        }
    }
    
}