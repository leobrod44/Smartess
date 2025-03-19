"use client";

import { CurrentUser, Unit } from "../../../../../mockData";
import HubOwner from "@/app/components/IndividualUnitComponents/HubOwner";
import HubUsers from "@/app/components/IndividualUnitComponents/HubUsers";
import Tickets from "@/app/components/IndividualUnitComponents/Tickets";
import Alerts from "@/app/components/IndividualUnitComponents/Alerts";
import BackArrowButton from "@/app/components/BackArrowBtn";
import { individualUnitApi } from "@/api/page";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UnitPage({
  params,
}: {
  params: { projectAddress: string; unit_id: string };
}) {
  const { projectAddress, unit_id } = params;

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [address, setAddress] = useState<string>("");
  const [unit, setUnit] = useState<Unit | undefined>(undefined);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const responseCurrentUser = await individualUnitApi.getCurrentUserApi(
          token
        );
        const tempCurrentUser = responseCurrentUser.currentUser;
        setCurrentUser({
          userId: tempCurrentUser.userId.toString(),
          role: tempCurrentUser.role,
          address: tempCurrentUser.address,
          firstName: tempCurrentUser.firstName,
          lastName: tempCurrentUser.lastName,
          email: tempCurrentUser.email,
          phoneNumber: tempCurrentUser.phoneNumber,
        });
      } catch (err) {
        console.error("Error fetching current user:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUnit = async () => {
      try {
        const decodedAddress = decodeURIComponent(projectAddress);
        const decodedUnitId = decodeURIComponent(unit_id);

        setAddress(decodedAddress);

        const response = await individualUnitApi.getIndividualUnit(
          decodedAddress,
          decodedUnitId,
          token
        );
        const fetchedUnit = response.unit;
        setUnit(fetchedUnit);
      } catch (err) {
        console.error("Error fetching unit:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchUnit();
  }, [router, projectAddress, unit_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!unit) {
    return <div>Unit not found</div>;
  }

  const isConnected = unit.cameraStatus === "live";

  return (
    <div>
      <div className="mx-4 lg:mx-8  min-h-screen flex flex-col">
        {/* Back Arrow Button */}
        <div className="flex items center justify-between mb-2">
          <h1 className="text-[#325a67] text-[35px] leading-10 tracking-tight">
            {address}
          </h1>
          <BackArrowButton />
        </div>
        <div className="relative flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[#729987] text-[25px] leading-10 tracking-tight">
              Unit {unit.unitNumber}
            </h1>
          </div>

          <div className="right-2 bg-white px-2 py-1 sm:px-3 sm:py-2 rounded-lg shadow flex items-center gap-2 border max-w-fit">
            <span className="text-xs sm:text-sm font-bold text-black">
              {isConnected ? "Live" : "Disconnected"}
            </span>
            <div
              className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
          </div>
        </div>

        {/* Render HubOwner Component with surrounding background */}
        <div className="my-4 rounded-lg bg-[#4b7d8d] p-2">
          <div className="bg-white rounded-lg p-4">
            <HubOwner owner={unit.owner} />
          </div>
        </div>
        {currentUser && (
          <div className=" my-4 rounded-lg bg-[#4b7d8d] p-2">
            <div className="bg-white rounded-lg p-4">
              <HubUsers
                hubUsers={unit.hubUsers}
                currentUserRole={currentUser.role}
              />
            </div>
          </div>
        )}

        <div className=" my-4 rounded-lg bg-[#4b7d8d] p-2">
          <div className="bg-white rounded-lg p-4">
            <Alerts alerts={unit.alerts} />
          </div>
        </div>

        <div className=" my-4 rounded-lg bg-[#4b7d8d] p-2">
          <div className="bg-white rounded-lg p-4">
            <Tickets tickets={unit.ticket} />
          </div>
        </div>
      </div>
    </div>
  );
}
