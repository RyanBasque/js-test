import { injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import AuthService from "../services/AuthService";
import { RegisterDto, LoginDto } from "../dtos/auth.dto";
import { validateDto } from "../utils/validate";
import { sendSuccess } from "../utils/response";

@injectable()
export default class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = await validateDto(RegisterDto, req.body);
      const result = await this.authService.register(dto);
      sendSuccess(res, result, "User registered successfully", 201);
    } catch (err) {
      next(err);
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const dto = await validateDto(LoginDto, req.body);
      const result = await this.authService.login(dto);
      sendSuccess(res, result, "Login successful");
    } catch (err) {
      next(err);
    }
  };
}
