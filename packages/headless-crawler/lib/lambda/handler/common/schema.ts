import z from "zod";

export const jobNumber = z.string().regex(/^\d{5}-\d{4,8}$/);
