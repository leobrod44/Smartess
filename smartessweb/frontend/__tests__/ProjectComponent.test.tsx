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
        { 
          projectId: "1",
          unit_id: "1",
          ticket: [
            {
              ticket_id: "1",
              unit_id: "1",
              unit_number: "101",
              project_address: "123 Main St",
              submitted_by_email: "mary.johnson@email.com",
              submitted_by_firstName: "Mary",
              submitted_by_lastName: "Johnson",
              title: "Smoke Alarm Activated",
              description: "The smoke alarm in unit 101 has been triggered.",
              status: "open",
              created_at: new Date(),
              type: "alert",
              assigned_employees: [], 
            },
          ],
          unitNumber: "101",
          hubUsers:[{ tokenId: "2", firstName: "Mary", lastName: "Johnson", role: "basic"}, {tokenId: "3", firstName: "Ken", lastName: "Long", role: "basic"} ],
          owner:{ tokenId: "1", firstName: "LARRY", lastName: "JOHNSON", email: "larryJ@hotmail.com", telephone: "123-456-7890"}, 
          tickets:{ total: 12,open: 6,pending: 2,closed: 4},
          alerts: [
            {
              id: "alert-1",
              projectId: "1",
              unitNumber: "101",
              timestamp: new Date(),
              message: "Smoke Alarm Activated",
              resolved: false, 
              icon: "x",
            },
          ]
        }, 
        { 
          projectId: "1",
          unit_id: "2",
          ticket: [
            {
              ticket_id: "2",
              unit_id: "2",
              unit_number: "102",
              project_address: "123 Main St",
              submitted_by_email: "sierra.mist@email.com",
              submitted_by_firstName: "Sierra",
              submitted_by_lastName: "Mist",
              title: "Smoke Alarm Activated",
              description: "The smoke alarm in unit 102 has been triggered.",
              status: "open",
              created_at: new Date(),
              type: "alert",
              assigned_employees: [],  
            },
          ],
          unitNumber: "102",
          hubUsers:[{ tokenId: "3", firstName: "Sierra", lastName: "Mist", role: "basic"}, {tokenId: "10", firstName: "Penny", lastName: "Wise", role: "basic"} ],
          owner:{ tokenId: "124", firstName: "Mark", lastName: "Dominican", email: "markDommyboy@hotmail.com", telephone: "333-344-5555"}, 
          tickets:{ total: 19,open: 10,pending: 7,closed: 3},
          alerts: [
            {
              id: "alert-2",
              projectId: "1",
              unitNumber: "102",
              timestamp: new Date(),
              message: "Smoke Alarm Activated",
              resolved: false, 
              icon: "y",
            },
          ],
         }
      ],
      adminUsersCount: 9,
      hubUsersCount: 1,
      pendingTicketsCount: 16,
      projectUsers: [],
    },
    {
      projectId: "2",
      address: "456 Elm St",
      units: [
        { 
          projectId: "2",
          unit_id: "3",
          ticket: [
            {
              ticket_id: "3",
              unit_id: "3",
              unit_number: "201",
              project_address: "456 Elm St",
              submitted_by_email: "yen.larrion@email.com",
              submitted_by_firstName: "Yen",
              submitted_by_lastName: "Larrion",
              title: "Window Opened",
              description: "The window in unit 201 is left open.",
              status: "open",
              created_at: new Date(),
              type: "alert",
              assigned_employees: [],
            },
          ],
          unitNumber: "201",
          hubUsers:[{ tokenId: "4", firstName: "Yen", lastName: "Larrion", role: "basic"}, {tokenId: "3", firstName: "Ken", lastName: "Long", role: "basic"} ],
          owner:{ tokenId: "6", firstName: "Pen", lastName: "King", email: "pk12456@hotmail.com", telephone: "111-222-3333"}, 
          tickets:{ total:24,open: 8,pending: 14,closed: 16},
          alerts: [
            {
              id: "alert-3",
              projectId: "2",
              unitNumber: "201",
              timestamp: new Date(),
              message: "Window Opened",
              resolved: false, 
              icon: "z",
            },
          ],
        }, 
      ],
      adminUsersCount: 30,
      hubUsersCount: 32,
      pendingTicketsCount: 39,
      projectUsers: [],
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
