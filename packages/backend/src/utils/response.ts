import { Response } from "express";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T | null;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): void {
  const body: ApiResponse<T> = { status: "success", message, data };
  res.status(statusCode).json(body);
}
