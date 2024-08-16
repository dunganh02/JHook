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

@Controller('auths')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Post('login')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authsService.signIn(
      createAuthDto.username,
      createAuthDto.password,
    );
  }

  @Post('handle/login')
  @UseGuards(LocalAuthGuard)
  handleLogin(@Request() req) {
    return this.authsService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
