import { generateMockProjects, Unit } from "../../../../../mockData";

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

  // Wrap the content with ProjectProvider
  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 mt-6 min-h-screen flex flex-col">
        <h1 className="text-2xl font-bold">Unit Details</h1>
        <p>
          <strong>Project Address:</strong> {decodedAddress}
        </p>
        <p>
          <strong>Unit ID:</strong> {unit.unit_id}
        </p>
        <p>
          <strong>Unit Number:</strong> {unit.unitNumber}
        </p>
        <p>
          <strong>Owner:</strong> {unit.owner.firstName} {unit.owner.lastName}
        </p>
      </div>
    </div>
  );
}
