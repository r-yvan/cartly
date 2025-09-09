import { z } from "zod";

export const schema = z.object({
  name: z.string().min(3).max(30),
  category: z.enum([
    "electronics",
    "fashion",
    "furniture",
    "kitchen tools",
    "music instruments",
    "gardening tools",
    "automotive",
  ]),
  description: z.string(),
  price: z.number(),
  quantity: z.number(),
  seller_id: z.number(),
  image_url: z.string(),
});
