import { AuthGuard } from '@nestjs/passport';

export class AccountGuardJwt extends AuthGuard('jwt') {}
