import { z } from "zod";

export const addCartSchema = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive().optional().default(1),
});

export const updateCartSchema = z.object({
  quantity: z.number().int().positive(),
});