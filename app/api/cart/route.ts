import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { getToken } from "next-auth/jwt";

const SECRET = process.env.NEXTAUTH_SECRET;

export const GET = async (request: NextRequest) => {
  try {
    const token = await getToken({ req: request, secret: SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = token.sub as string;

    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } , include: { items: true } });
    }

    const mapped = {
      id: cart.id,
      items: cart.items.map((it: any) => ({
        id: it.id,
        productId: it.productId,
        quantity: it.quantity,
        product: it.product
          ? {
              id: it.product.id,
              name: it.product.name,
              price: Number(it.product.price?.toString?.() ?? it.product.price ?? 0),
            }
          : null,
      })),
    };

    return NextResponse.json(mapped);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const token = await getToken({ req: request, secret: SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = token.sub as string;

    const body = await request.json();
    const { productId, quantity = 1, variantId, selectedOptions } = body;
    if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

    // find or create cart
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });

    // check existing item for same product+variant
    const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId, variantId } });
    if (existing) {
      const updated = await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + Number(quantity) } });
      return NextResponse.json(updated, { status: 200 });
    }

    const created = await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity: Number(quantity), variantId, selectedOptions } });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
};

export const PATCH = async (request: NextRequest) => {
  try {
    const token = await getToken({ req: request, secret: SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { itemId, quantity } = body;
    if (!itemId || typeof quantity !== "number") return NextResponse.json({ error: "itemId and quantity required" }, { status: 400 });

    const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const token = await getToken({ req: request, secret: SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
  }
};
