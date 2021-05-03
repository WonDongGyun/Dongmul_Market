import { AuthGuard } from '@nestjs/passport';

export class AccountGuardLocal extends AuthGuard('local') {}
