"use client";

import BackArrowButton from "@/app/components/BackArrowBtn";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Replay5Icon from '@mui/icons-material/Replay5';
import Forward5Icon from '@mui/icons-material/Forward5';

export default function UnitPage({
  params,
}: {
  params: { projectAddress: string; unit_id: string };
}) {
  const { projectAddress, unit_id } = params;

  const router = useRouter();
  const decodedAddress = decodeURIComponent(projectAddress);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState("Connected.");

//   const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }
    setConnectionStatus("Connected");
  }, [router]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="text-[#14323B] text-lg">Loading unit surveillance page...</div>
//       </div>
//     );
//   }

return (
  <div>
    <div className="flex-1 border border-black rounded-lg p-6 mx-4 lg:mx-8 min-h-screen flex flex-col">
      {/* Back Arrow Button */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-[#325a67] text-[35px] leading-10 tracking-tight">
          {decodedAddress}
        </h1>
        <BackArrowButton />
      </div>
      <h1 className="text-[#729987] text-[25px] leading-10 tracking-tight">
        Unit {unit_id}
      </h1>

      {/* Video Section */}
      <div className="my-5 flex justify-center">
        <div className="rounded-lg bg-[#4b7d8d] p-2 w-full max-w-2xl">
          <div className="bg-white rounded-lg p-2 flex flex-col items-center w-full">
            
            {/* Video (Full Width) */}
            <video 
              ref={videoRef} 
              className="w-full border border-gray-300 rounded-lg"
              controls 
              autoPlay 
              playsInline 
            />

            {/* Controls & Status Row */}
            <div className="mt-3 w-full flex justify-center relative">
              
              {/* Centered Buttons */}
              <div className="flex gap-4">
                <button className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition cursor-pointer">
                  <Replay5Icon fontSize="large" />
                </button>
                
                <button className="p-3 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition cursor-pointer">
                  <Forward5Icon fontSize="large" />
                </button>
              </div>

              {/* Status Widget (Far Right) */}
              <div className="absolute right-2 bg-white px-3 py-1 rounded-lg shadow flex items-center gap-2 border">
                <span className="text-sm font-bold">
                  {connectionStatus === "Connected" ? "Connected" : "Disconnected"}
                </span>
                <div 
                  className={`w-3.5 h-3.5 rounded-full ${connectionStatus === "Connected" ? "bg-green-500" : "bg-red-500"}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-black rounded-lg mt-4 bg-[#4b7d8d]">
        <div className="grid grid-cols-2 gap-4 h-full">
          {/* Speed Section */}
          <div className="rounded-lg p-2 cursor-pointer hover:bg-[#325a67] flex min-h-[150px]">
            <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center w-full h-full">
              <h2 className="text-xl font-bold">Speed</h2>
              <p className="text-lg">0 kbps</p>
            </div>
          </div>

          {/* Buffer Health Section */}
          <div className="rounded-lg p-2 cursor-pointer hover:bg-[#325a67] flex min-h-[150px]">
            <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center w-full h-full">
              <h2 className="text-xl font-bold">Buffer Health</h2>
              <p className="text-lg">0 sec</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
);

}