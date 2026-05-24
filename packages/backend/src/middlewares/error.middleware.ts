import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { AppError } from "../errors/AppError";

// Express requires exactly 4 params to detect error middleware
export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      data: null,
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    res.status(400).json({
      status: "error",
      message: err.message,
      data: null,
    });
    return;
  }

  // Validation errors (class-validator)
  if (err.name === "ValidationError" || Array.isArray((err as any).errors)) {
    res.status(422).json({
      status: "error",
      message: "Dados inválidos",
      data: null,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    status: "error",
    message: "Erro interno do servidor",
    data: null,
  });
}
