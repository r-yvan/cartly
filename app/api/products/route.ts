import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export const GET = async () => {
  try {
    // Use the existing client property used in the project (products)
    const products = await prisma.products.findMany({ take: 100 });

    const mapped = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price?.toString?.() ?? p.price ?? 0),
      quantity: p.quantity ?? 0,
  image: "/shoes1.jpg",
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
};
