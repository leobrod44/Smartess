"use client";

import BackArrowButton from "@/app/components/BackArrowBtn";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function UnitPage({
  params,
}: {
  params: { projectAddress: string; unit_id: string };
}) {
  const { projectAddress, unit_id } = params;

  const router = useRouter();
  const decodedAddress = decodeURIComponent(projectAddress);

  const videoRef = useRef<HTMLVideoElement>(null);
//   const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }
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
      </div>
      <h1 className="text-[#729987] text-[25px] leading-10 tracking-tight">
        Unit {unit_id}
      </h1>
      <BackArrowButton />
      {/* Video Section */}
      <div className="my-5 flex justify-center">
        <div className="rounded-lg bg-[#4b7d8d] p-2 w-full max-w-2xl relative">
          <div className="bg-white rounded-lg p-2">
            <video 
              ref={videoRef} 
              className="w-full border border-gray-300 rounded-lg"
              controls 
              autoPlay 
              playsInline 
            />
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