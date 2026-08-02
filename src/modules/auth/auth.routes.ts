import { Router } from "express";

import { validate } from "../../middlewares/validation.middleware.ts";
import { signInSchema, signUpSchema, resetPasswordSchema, refreshTokenSchema } from "./auth.validation.ts";
import { signInController, signUpController, resetPasswordController, refreshTokenController } from "./auth.controller.ts";

export const authRouter = Router();


//POST /api/v1/auth/signin
authRouter.post("/signin", validate(signInSchema), signInController);

//POST /api/v1/auth/signup
authRouter.post("/signup", validate(signUpSchema), signUpController);

//POST /api/v1/auth/resetPassword
authRouter.post("/resetPassword", validate(resetPasswordSchema), resetPasswordController);

//POST /api/v1/auth/refresh-token
authRouter.post("/refresh-token", validate(refreshTokenSchema), refreshTokenController);
