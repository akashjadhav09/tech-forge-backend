import type { Request, Response, NextFunction } from "express";

import { signIn, signUp, resetPassword } from "./auth.service.ts";
import type { SignInInput, SignUpInput, ResetPasswordInput } from "./auth.types.ts";

//POST /api/v1/auth/signin
export async function signInController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as SignInInput;
    const tokens = await signIn(body);

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      data: tokens,
    });
  } catch (err) {
    next(err); // Delegate to global error handler
  }
}


//POST /api/v1/auth/signup
export async function signUpController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as SignUpInput;
    const tokens = await signUp(body);

    res.status(200).json({
      success: true,
      message: "Signed up successfully",
      data: tokens,
    });
  } catch (err) {
    next(err); // Delegate to global error handler
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as ResetPasswordInput;
    await resetPassword(body);

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    next(err); // Delegate to global error handler
  }
}
