import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import ProjectInfo from "@/app/components/ProjectComponent"; 
import { Project } from "@/app/mockData"; 

describe("ProjectInfo", () => {
  const mockProjects: Project[] = [
    {
      projectId: "1",
      address: "123 Main St",
      units: [
        { unitNumber: "101",
          users:[{ tokenId: "2", firstName: "Mary", lastName: "Johnson", role: "basic"}, {tokenId: "3", firstName: "Ken", lastName: "Long", role: "basic"} ],
          owner:{ tokenId: "1", firstName: "LARRY", lastName: "JOHNSON", email: "larryJ@hotmail.com"}, 
          tickets:{ total: 12,open: 6,pending: 2,closed: 4},
          alerts: [{message: "Smoke Alarm Activated",}]
        }, 
        { unitNumber: "102",
          users:[{ tokenId: "3", firstName: "Sierra", lastName: "Mist", role: "basic"}, {tokenId: "10", firstName: "Penny", lastName: "Wise", role: "basic"} ],
          owner:{ tokenId: "124", firstName: "Mark", lastName: "Dominican", email: "markDommyboy@hotmail.com"}, 
          tickets:{ total: 19,open: 10,pending: 7,closed: 3},
          alerts: [{message: "Smoke Alarm Activated",}]
         }
      ],
      adminUsers: 9,
      hubUsers: 1,
      pendingTickets: 16,
    },
    {
      projectId: "2",
      address: "456 Elm St",
      units: [
        { unitNumber: "201",
          users:[{ tokenId: "4", firstName: "Yen", lastName: "Larrion", role: "basic"}, {tokenId: "3", firstName: "Ken", lastName: "Long", role: "basic"} ],
          owner:{ tokenId: "6", firstName: "Pen", lastName: "King", email: "pk12456@hotmail.com"}, 
          tickets:{ total:24,open: 8,pending: 14,closed: 16},
          alerts: [{message: "Smoke Alarm Activated",}]
        }, 
      ],
      adminUsers: 30,
      hubUsers: 32,
      pendingTickets: 39,
    },
  ];

  it("renders project addresses correctly", () => {
    render(<ProjectInfo projects={mockProjects} />);
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
    expect(screen.getByText("456 Elm St")).toBeInTheDocument();
  });

  it("displays the correct counts of admin and hub users", () => {
    render(<ProjectInfo projects={mockProjects} />);
    
    // Assert the admin users
    expect(screen.getByText("9")).toBeInTheDocument(); // Admin users for 123 Main St
    expect(screen.getByText("30")).toBeInTheDocument(); // Admin users for 456 Elm St
    
    // Assert the hub users
    const hubUserCounts = screen.getAllByText("1");
    expect(hubUserCounts[0]).toBeInTheDocument(); // Hub users for 123 Main St
    expect(hubUserCounts[1]).toBeInTheDocument(); // Hub users for 456 Elm St
  });

  it("displays the correct number of pending tickets", () => {
    render(<ProjectInfo projects={mockProjects} />);
    expect(screen.getByText("2")).toBeInTheDocument(); // Pending tickets for 123 Main St
    expect(screen.getAllByText("1")[1]).toBeInTheDocument(); // Pending tickets for 456 Elm St
  });

  it("toggles unit display when the 'More' button is clicked", () => {
    render(<ProjectInfo projects={mockProjects} />);

    // Check that the units are not initially visible
    expect(screen.queryByText("Unit 101")).not.toBeInTheDocument();

    // Click the "More" button for the first project
    fireEvent.click(screen.getAllByRole("button", { name: "More" })[0]);

    // Check that the units are now visible
    waitFor(() => expect(screen.getByText("Unit 101")).toBeInTheDocument());
    waitFor(() => expect(screen.getByText("Unit 102")).toBeInTheDocument());

    // Click the "More" button again to hide the units
    fireEvent.click(screen.getAllByRole("button", { name: "More" })[0]);

    // Check that the units are no longer visible
    expect(screen.queryByText("Unit 101")).not.toBeInTheDocument();
  });
});
