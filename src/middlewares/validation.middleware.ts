import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Factory that returns an Express middleware which validates `req.body`
 * against the provided Zod schema.
 *
 * On failure it responds 422 with a list of field-level errors.
 * On success it calls `next()`.
 */
export function validate(schema: ZodTypeAny): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(422).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }

    // Replace body with the parsed (and coerced/stripped) data
    req.body = result.data;
    next();
  };
}
