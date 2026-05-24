import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";
import { AppError } from "../errors/AppError";

export async function validateDto<T extends object>(
  DtoClass: new () => T,
  data: unknown
): Promise<T> {
  const instance = plainToInstance(DtoClass, data, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  });
  const errors: ValidationError[] = await validate(instance as object, {
    whitelist: true,
    forbidNonWhitelisted: false,
  });

  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join(", "))
      .join("; ");
    throw new AppError(`Validation error: ${messages}`, 422);
  }

  return instance;
}
