import prisma from "@/prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { schema } from "../schema";

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const neededProduct = await prisma.products.findUnique({
      where: { id: Number(params.id) },
    });
    if (neededProduct) return NextResponse.json(neededProduct);
    else
      return NextResponse.json(
        { error: "The product was not found!!" },
        { status: 404 }
      );
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong!!" });
  }
};

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }
    const product = await prisma.products.findUnique({
      where: { id: Number(params.id) },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const updatedProduct = await prisma.products.update({
      where: { id: Number(params.id) },
      data: {
        name: body.name,
        price: body.price,
        category: body.category,
        description: body.description,
        quantity: body.quantity,
        seller_id: body.seller_id,
        image_url: body.image_url,
      },
    });
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: err, message: "Something went wrong!!" },
      { status: 400 }
    );
  }
};

export const PATCH = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const body = await request.json();
    const product = await prisma.products.findUnique({
      where: { id: Number(params.id) },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const { name, ...updateData } = body;
    const updatedProduct = await prisma.products.update({
      where: { id: Number(params.id) },
      data: updateData,
    });
    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: err, message: "Something went wrong!!" },
      { status: 400 }
    );
  }
};
