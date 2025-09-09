import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { schema } from "./schema";

export const GET = async () => {
  try {
    const result = await prisma.products.findMany();
    return NextResponse.json(result);
  } catch (err) {
    console.log(err);
  }
};

export const GETBYID = async (id: string) => {
  try {
    const neededProduct = await prisma.products.findUnique({
      where: { id: Number(id) },
    });
    if (neededProduct) return NextResponse.json(neededProduct);
    else
      return NextResponse.json(
        { error: "The product was not found!!" },
        { status: 404 }
      );
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong!!" },
      { status: 404 }
    );
  }
};
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validationResult = schema.safeParse(body);
    if (!validationResult.success)
      return NextResponse.json({
        error: validationResult.error,
      });
    const productFromDb = await prisma.products.findUnique({
      where: { name: body.name },
    });

    if (productFromDb)
      return NextResponse.json(
        {
          error: "Product already exists",
        },
        { status: 400 }
      );
    else {
      const newProduct = await prisma.products.create({
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
      return NextResponse.json(newProduct, { status: 200 });
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: err, message: "Something went wrong!!" },
      { status: 400 }
    );
  }
};

export const PUT = async (request: NextRequest) => {
  try {
    const body = await request.json();
    // Validate full product update
    const validationResult = schema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error },
        { status: 400 }
      );
    }
    // Find product by name (or change to id if needed)
    const product = await prisma.products.findUnique({
      where: { name: body.name },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const updatedProduct = await prisma.products.update({
      where: { name: body.name },
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

export const PATCH = async (request: NextRequest) => {
  try {
    const body = await request.json();
    // Find product by name (or change to id if needed)
    const product = await prisma.products.findUnique({
      where: { name: body.name },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    // Remove name from data to avoid changing unique field if not provided
    const { name, ...updateData } = body;
    const updatedProduct = await prisma.products.update({
      where: { name: body.name },
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
