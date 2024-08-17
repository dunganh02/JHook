import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';
import { CreateAuthDto } from '@/auths/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private mailerService: MailerService,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.userModel.exists({ email });
    return !!user; // return true if user exists
  };

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, phone } = createUserDto;

    const checkEmail = await this.isEmailExist(email);
    if (checkEmail) {
      throw new BadRequestException(`Email ${email} already exists`);
    }
    const hashPassword = await hashPasswordHelper(password);
    // console.log('>> hashPassword', hashPassword);
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      phone,
    });
    return {
      _id: user.id,
    };
  }

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    // Loại bỏ các trường không cần thiết khỏi filter
    if (filter.pageSize) delete filter.pageSize;
    if (filter.current) delete filter.current;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    // Tính toán phân trang
    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    // Truy vấn dữ liệu
    const result = await this.userModel
      .find(filter)
      .limit(pageSize)
      .skip(skip)
      .select('-password')
      .sort(sort as any);

    // Trả về kết quả
    return {
      meta: {
        current,
        pageSize,
        totalItems,
        totalPages,
      },
      result,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(updateUserDto: UpdateUserDto) {
    console.log('Update user:', updateUserDto);

    // const { _id, ...updateData } = updateUserDto;
    const updatedUser = await this.userModel.findByIdAndUpdate(
      updateUserDto._id,
      updateUserDto,
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(
        `User with ID ${updateUserDto._id} not found`,
      );
    }
    return updatedUser;
  }

  async remove(_id: string) {
    if (mongoose.isValidObjectId({ _id })) {
      return this.userModel.deleteOne({ _id });
    } else {
      throw new BadRequestException(`Invalid ID ${_id}`);
    }
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async handleRegister(registerDto: CreateAuthDto) {
    // check email
    const { name, email, password, username } = registerDto;

    const checkEmail = await this.isEmailExist(email);
    if (checkEmail) {
      throw new BadRequestException(`Email ${email} already exists`);
    }
    const hashPassword = await hashPasswordHelper(password);
    const codeId = uuidv4();
    const user = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      username,
      isActive: false,
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes'), // thoi gian het han,
    });

    // send email
    this.mailerService
      .sendMail({
        to: user.email, // list of receivers
        subject: 'Active your account at @anhdung ✔', // Subject line
        template: 'register.hbs',
        context: {
          name: user?.name ?? user.email,
          activationCode: codeId,
        },
      })
      .then(() => {})
      .catch(() => {});
    // tra phan hoi khi tao duoc account
    return {
      _id: user.id,
      to: user.email,
    };
  }
}
