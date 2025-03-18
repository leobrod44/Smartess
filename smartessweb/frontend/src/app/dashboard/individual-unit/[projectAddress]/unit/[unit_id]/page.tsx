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
        <h1 className="text-[#729987] text-[25px] leading-10 tracking-tight">
          Unit {unit.unitNumber}
        </h1>

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
