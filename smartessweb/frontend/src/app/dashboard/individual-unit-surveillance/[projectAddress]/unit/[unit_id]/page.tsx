"use client";

import BackArrowButton from "@/app/components/BackArrowBtn";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Replay5Icon from '@mui/icons-material/Replay5';
import Forward5Icon from '@mui/icons-material/Forward5';
import ConnectionSpeedModal from "@/app/components/IndividualUnitSurveillanceComponents/ConnectionSpeedModal";
import LatencyModal from "@/app/components/IndividualUnitSurveillanceComponents/LatencyModal";

export default function IndividualUnitSurveillancePage({
  params,
}: {
  params: { projectAddress: string; unit_id: string };
}) {
  const { projectAddress, unit_id } = params;

  const router = useRouter();
  const decodedAddress = decodeURIComponent(projectAddress);

  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [connectionStatus, setConnectionStatus] = useState("Connected.");

  // speed graph --------------------------------------------------------------
  const [isConnectionSpeedModalOpen, setConnectionSpeedModalOpen] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [speedData, setSpeedData] = useState<{ time: string; value: number }[]>([]);
  //const lastChunkSizeRef = useRef<number>(0);
  //const lastChunkTimeRef = useRef<number>(Date.now());
  //const SAMPLING_INTERVAL = 3000; // 3 seconds between data points
  //const lastSpeedUpdateRef = useRef<number>(0);
  // ------------------------------------------------------------------------------
  // latency --------------------------------------------------------------
  const [isLatencyModalOpen, setLatencyModalOpen] = useState(false);
  const [currentLatency, setCurrentLatency] = useState(0);
  const [latencyData, setLatencyData] = useState<{ time: string; value: number }[]>([]);
  //const lastLatencyUpdateRef = useRef<number>(0);
  // ------------------------------------------------------------------------------


// -ESLINT -------
setCurrentLatency(Math.floor(Math.random() * 200) + 50);  // Random latency between 50 and 250 ms
setLatencyData([
  { time: "00:00", value: Math.floor(Math.random() * 200) + 50 },
  { time: "00:01", value: Math.floor(Math.random() * 200) + 50 },
  { time: "00:02", value: Math.floor(Math.random() * 200) + 50 },
]);  // Random latency data

setCurrentSpeed(Math.floor(Math.random() * 1000) + 100);  // Random speed between 100 and 1100 kbps
setSpeedData([
  { time: "00:00", value: Math.floor(Math.random() * 1000) + 100 },
  { time: "00:01", value: Math.floor(Math.random() * 1000) + 100 },
  { time: "00:02", value: Math.floor(Math.random() * 1000) + 100 },
]);  // Random speed data

setIsConnected(Math.random() > 0.5);
//-------------------------------



  // const [loading, setLoading] = useState(true);
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

  const handleOpenConnectionSpeedModal = () => {
    setConnectionSpeedModalOpen(true);
  };

  const handleCloseConnectionSpeedModal = () => {
    setConnectionSpeedModalOpen(false);
  };  

  const handleOpenLatencyModal = () => {
    setLatencyModalOpen(true);
  };

  const handleCloseLatencyModal = () => {
    setLatencyModalOpen(false);
  };

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
              <div className="mt-3 w-full flex justify-center relative items-center">
                {/* Power Off Button */}
                {/* {connectionStatus === "Connected" && (
                  <button 
                    className="p-3 absolute left-2 bg-red-600 bg-opacity-50 text-white rounded-full hover:bg-opacity-75 transition cursor-pointer"
                    onClick={handlePowerOff}
                  >
                    <PowerSettingsNewIcon fontSize="large" />
                  </button>
                )} */}
                
                {/* Centered Buttons */}
                <div className="flex gap-4 ml-4">
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

        {/* Title & Description */}
        {!isConnected && (
          <>
            <div className="text-center text-black mb-2">
              <h2 className="text-2xl font-bold">Data Overview - Click to view graphs</h2>
            </div>
            <div className="rounded-lg bg-[#4b7d8d] max-w-[550px] w-full mx-auto max-h-[100px]">
              <div className="grid grid-cols-2 gap-1 h-full text-black">
                {/* Speed Section */}
                <div
                  className="rounded-lg p-2 cursor-pointer hover:bg-[#325a67] flex max-h-[100px]"
                  onClick={() => handleOpenConnectionSpeedModal()}
                >
                  <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center w-full h-full">
                    <h2 className="text-xl font-bold">Connection Speed</h2>
                    <p className="text-lg">{currentSpeed} kbps</p>
                  </div>
                </div>

                {/* Buffer Health Section */}
                <div
                  className="rounded-lg p-2 cursor-pointer hover:bg-[#325a67] flex max-h-[100px]"
                  onClick={handleOpenLatencyModal}
                >
                  <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center w-full h-full">
                    <h2 className="text-xl font-bold">Latency</h2>
                    <p className="text-lg">{currentLatency} ms</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Graph Modal */}
        {isConnectionSpeedModalOpen && (
          <ConnectionSpeedModal
            data={speedData}
            onClose={handleCloseConnectionSpeedModal}
          />
        )}

        {/* Latency Modal */}
        {isLatencyModalOpen && (
          <LatencyModal
            data={latencyData}
            onClose={handleCloseLatencyModal}
          />
        )}
      </div>
    </div>
  );
}