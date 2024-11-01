import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UnitComponent from "@/app/components/Unit";
import { generateMockProjects } from "@/app/mockData";

const mockProjects = generateMockProjects();

describe("UnitComponent", () => {
  const projectId = mockProjects[0].projectId; // Get the first project
  const unitNumber = mockProjects[0].units[0].unitNumber; // Get the first unit

  it("renders the correct owner information", async () => {
    render(<UnitComponent unitNumber={unitNumber} projectId={projectId} />);

    // Wait for the owner name to appear in the document
    await waitFor(() => {
      expect(screen.getByText(/LARRY JOHNSON/i)).toBeInTheDocument();
      expect(screen.getByText(/larryJ@hotmail.com/i)).toBeInTheDocument();
    });
  });

  it("renders the correct unit number", async () => {
    render(<UnitComponent unitNumber={unitNumber} projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText(/Unit 101/i)).toBeInTheDocument();
    });
  });

  it("renders the users", async () => {
    render(<UnitComponent unitNumber={unitNumber} projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText(/K. Long/i)).toBeInTheDocument();
    });
  });

  it("renders the correct tickets information", async () => {
    render(<UnitComponent unitNumber={unitNumber} projectId={projectId} />);

    await waitFor(() => {
      expect(
        screen.getByText((content, element) => {
          // Check if the element is not null and the content starts with '19'
          return (
            element !== null &&
            content.startsWith("19") &&
            element.tagName.toLowerCase() === "div"
          );
        })
      ).toBeInTheDocument();

      expect(screen.getByText(/Total/i)).toBeInTheDocument();
    });
  });

  it("renders the correct alerts", async () => {
    render(<UnitComponent unitNumber={unitNumber} projectId={projectId} />);

    await waitFor(() => {
      expect(screen.getByText(/water leak detected/i)).toBeInTheDocument();
    });
  });
});
