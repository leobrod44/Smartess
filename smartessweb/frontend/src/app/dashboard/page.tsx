"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectComponent from "../components/ProjectComponent";

const DashboardPage = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
    }
  }, [router]);

  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
      <div className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight">
        Welcome to Your Dashboard
      </div>

      {/* Widgets go here */}

      <div className=" pt-4 w-[306px] h-[66px] text-[#325a67] text-[30px]  leading-10 tracking-tight">
        Your Projects
      </div>
      <ProjectComponent />
    </div>
  );
};

export default DashboardPage;
