import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthsService } from './auths.service';
import { CreateAuthDto } from '@/auths/dto/create-auth.dto';
import { LocalAuthGuard } from '@/auths/passport/local-auth.guard';
import { JwtAuthGuard } from '@/auths/passport/jwt-auth.guard';
import { Public } from '@/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auths')
export class AuthsController {
  constructor(
    private readonly authsService: AuthsService,
    private mailerService: MailerService,
  ) {}

  @Post('login')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authsService.signIn(
      createAuthDto.username,
      createAuthDto.password,
    );
  }

  @Post('handle/login')
  @Public() // kh check nhung route nay
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authsService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('register')
  @Public()
  register(@Body() createAuthDto: CreateAuthDto) {
    return this.authsService.handleRegister(createAuthDto);
  }

  @Get('mail')
  @Public()
  async testMail() {
    await this.mailerService
      .sendMail({
        to: 'padungg8@gmail.com', // list of receivers
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        template: 'register.hbs',
        context: {
          name: 'Anh Dung',
          activationCode: 123456576,
        },
      })
      .then(() => {})
      .catch(() => {});
    return 'ok';
  }
}
