import { ZodError } from "zod";

export function formatZodError(err: ZodError): string {
  return err.errors.map((e) => {
    const field = e.path.length > 0 ? e.path.join(".") + ": " : "";
    return `${field}${e.message}`;
  }).join("; ");
}
