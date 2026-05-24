import { injectable } from "tsyringe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository";
import { RegisterDto, LoginDto } from "../dtos/auth.dto";
import { AppError } from "../errors/AppError";
import { config } from "../config/config";
import { formatCpf } from "../utils/cpf";

type AuthResult = {
  user: { id: number; name: string; email: string };
  token: string;
};

@injectable()
export default class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(dto: RegisterDto): Promise<AuthResult> {
    const [byEmail, byCpf] = await Promise.all([
      this.userRepository.findByEmail(dto.email),
      this.userRepository.findByCpf(dto.cpf),
    ]);

    if (byEmail) throw new AppError("Email already in use", 409);
    if (byCpf) throw new AppError("CPF already registered", 409);

    const password = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      cpf: formatCpf(dto.cpf),
      password,
    });

    const token = this.signToken(user.id, user.email);
    return {
      user: { id: user.id, name: user.name, email: user.email },
      token,
    };
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) throw new AppError("Invalid credentials", 401);

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const token = this.signToken(user.id, user.email);
    return {
      user: { id: user.id, name: user.name, email: user.email },
      token,
    };
  }

  private signToken(id: number, email: string): string {
    return jwt.sign({ id, email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}
