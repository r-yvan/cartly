"use client";
import { Bars } from "react-loader-spinner";
import React, { useState } from "react";
import svg from "@/public/upt.png";
import Image from "next/image";
import {
  IconHeart,
  IconHeartFilled,
  IconShoppingCartPlus,
} from "@tabler/icons-react";

interface Props {
  image: string;
  likes: number;
  name: string;
  description: string;
  price: number;
}

const ProductCard = ({ image, likes, name, description, price }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="relative overflow-hidden">
      <div className="lighter relative flex flex-col gap-3 h-[420px] w-80 p-2 bg-[#0f0f0f] rounded-xl border border-white border-opacity-5">
        <div className="relative w-fit rounded-lg overflow-hidden">
          <Image src={image} alt="" width={300} height={300} className="w-80" />
          <div className="absolute top-1 right-1 opacity-50 w-fit h-fit bg-[#151515] p-1 rounded-full">
            <IconHeart size={20} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-1 px-2 py-1 bg-[#151515] w-fit rounded-full">
            <IconHeartFilled size={20} color="#F54254" />
            <p className="text-sm opacity-50">{likes}</p>
          </div>
          <div>
            <p className="text-lg font-bold">{name}</p>
          </div>
          <div className="h-12">
            <p className="opacity-50 text-sm">{description}</p>
          </div>
          <div className="bg-[#151515] w-fit px-3 py-1 rounded-full">
            <p className="text-xl text-white">$ {price}</p>
          </div>
        </div>
        <div className="flex w-40 px-3 py-2 justify-center items-center bg-violet-700 rounded-lg">
          <button
            className="w-full flex items-center justify-center"
            onClick={async () => {
              try {
                setIsLoading(true);
                await fetch("/api/cart", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ productId: image /* placeholder: component doesn't receive id yet */ }),
                });
                // simple feedback
                console.log("Added to cart");
              } catch (err) {
                console.error("Failed to add to cart", err);
              } finally {
                setIsLoading(false);
              }
            }}
          >
          {isLoading ? (
            <Bars
              height="24"
              width="20"
              color="#FFFFFF"
              ariaLabel="bars-loading"
              wrapperStyle={{}}
              wrapperClass=""
              visible={true}
            />
          ) : (
            <div className="flex flex-row gap-2">
              <IconShoppingCartPlus />
              <p>Add to Cart</p>
            </div>
          )}
          </button>
        </div>
        <Image
          src={svg}
          alt=""
          className="absolute bottom-1 right-1 opacity-50"
        />
      </div>
    </div>
  );
};

export default ProductCard;
