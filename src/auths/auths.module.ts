import { Module } from '@nestjs/common';
import { AuthsController } from '@/auths/auths.controller';
import { AuthsService } from '@/auths/auths.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '@/modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@/auths/passport/local.strategy';
import { JwtStrategy } from '@/auths/passport/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: undefined,
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthsController],
  providers: [AuthsService, LocalStrategy, JwtStrategy],
})
export class AuthsModule {}
