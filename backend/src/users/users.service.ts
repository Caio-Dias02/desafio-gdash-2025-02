import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    // Verifica se email já existe
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('Este email já está registrado');
    }

    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password').exec();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    const user = await this.userModel.findByIdAndDelete(id).exec();

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
  }

  async seedDefaultUser(): Promise<void> {
    const defaultEmail = process.env.DEFAULT_USER_EMAIL || 'admin@gdash.com';
    const defaultPassword =
      process.env.DEFAULT_USER_PASSWORD || '123456';

    const existingUser = await this.userModel.findOne({
      email: defaultEmail,
    });

    if (!existingUser) {
      const newUser = new this.userModel({
        email: defaultEmail,
        password: defaultPassword,
        role: 'admin',
      });

      await newUser.save();
      console.log(`✅ Usuário padrão criado: ${defaultEmail}`);
    }
  }
}
