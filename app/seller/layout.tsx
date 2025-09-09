import SideNavigationBar from "@/components/SideNavigationBar";
import React from "react";
import {
  IconLayoutDashboard,
  IconListDetails,
  IconPackage,
} from "@tabler/icons-react";
import profile from "@/public/unreal-me-2.png"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/prisma/client";
import { redirect } from "next/navigation";

const SellerInterfaceLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  const user = await prisma.users.findUnique({
    where: { id: parseInt(session.user.id) },
    include: {
      profile: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const pages = [
    {
      pageUrl: "dashboard",
      pageLabel: "Dashboard",
      pageIcon: <IconLayoutDashboard />,
    },
    {
      pageUrl: "cart",
      pageLabel: "Cart",
      pageIcon: <IconPackage />,
    },
    {
      pageUrl: "orders",
      pageLabel: "Orders",
      pageIcon: <IconListDetails />,
    },
  ];

  return (
    <div className="flex flex-row w-screen h-screen bg-[#050505]">
      <SideNavigationBar
        username={user.username}
        profileImage={profile}
        pages={pages}
        userRole={user.role}
      />
      <div>{children}</div>
    </div>
  );
};

export default SellerInterfaceLayout;
