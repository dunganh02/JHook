import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@/modules/users/schemas/user.schema';
import { Model } from 'mongoose';
import { hashPasswordHelper } from '@/helpers/util';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
