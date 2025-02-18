"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnitPage({
  params,
}: {
  params: { projectAddress: string; unit_id: string };
}) {
  const { projectAddress, unit_id } = params;

  const router = useRouter();
  const decodedAddress = decodeURIComponent(projectAddress);
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
      Individual Unit Surveillance Page for <br/> {decodedAddress} <br/>Unit {unit_id}
    </div>
  );
}