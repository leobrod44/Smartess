import { generateMockProjects, Unit } from "../../../../../mockData";
import HubOwner from "@/app/components/IndividualUnitComponents/HubOwner";
import HubUsers from "@/app/components/IndividualUnitComponents/HubUsers";
import BackArrowButton from "@/app/components/BackArrowBtn";

export default function UnitPage({
  params,
}: {
  params: { projectAddress: string; unit_id: string };
}) {
  const { projectAddress, unit_id } = params;

  // Decode the project address to match the mock data format
  const decodedAddress = decodeURIComponent(projectAddress);

  // Fetch the mock data and locate the project
  const projects = generateMockProjects();
  const project = projects.find((p) => p.address === decodedAddress);

  if (!project) {
    return <div>Project not found</div>;
  }

  // Locate the specific unit in the project
  const unit: Unit | undefined = project.units.find(
    (u) => u.unit_id === unit_id
  );

  if (!unit) {
    return <div>Unit not found</div>;
  }

  return (
    <div>
      <div className="flex-1 border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
        {/* Back Arrow Button */}
        <div className="flex justify-end mb-4">
          <BackArrowButton />
        </div>
        <h1 className="text-2xl text-[#4b7d8d] font-bold">{decodedAddress}</h1>
        <h1 className="text-2xl text-[#325a67] font-bold">
          Unit {unit.unitNumber}
        </h1>

        {/* Render HubOwner Component with surrounding background */}
        <div className="my-4 rounded-lg bg-[#4b7d8d] p-2">
          <div className="bg-white rounded-lg p-4">
            <HubOwner owner={unit.owner} />
          </div>
        </div>

        <div className=" rounded-lg bg-[#4b7d8d] p-2">
          <div className="bg-white rounded-lg p-4">
            <HubUsers hubUsers={unit.hubUsers} />
          </div>
        </div>
      </div>
    </div>
  );
}
