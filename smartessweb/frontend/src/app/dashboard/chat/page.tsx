"use client";

import BackArrowButton from "@/app/components/BackArrowBtn";

const ChatPage = () => {
  return (
    <div className="relative h-screen ">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4">
          <div className="pt-4 w-[306px] h-[66px] text-[#325a67] text-[30px] leading-2 tracking-tight">
            Chat Page
          </div>
          <BackArrowButton />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-white to-[#1f505e]">
        <p className="text-sm text-gray-300 mb-2">This feature is</p>
        <h2 className="text-4xl font-bold text-white">Coming Soon</h2>
      </div>
    </div>
  );
};

export default ChatPage;
