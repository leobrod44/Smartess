import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HubUsers from "@/app/components/UnitComponents/HubUsers";
import { HubUser } from "@/app/mockData";

describe("HubUsers Component", () => {
  const usersMock: HubUser[] = [
    { tokenId: "1", firstName: "Michael", lastName: "Johnson", role: "basic" },
    { tokenId: "2", firstName: "Sarah", lastName: "Smith", role: "admin" },
    { tokenId: "3", firstName: "David", lastName: "Williams", role: "basic" },
    { tokenId: "4", firstName: "Alice", lastName: "Brown", role: "admin" },
  ];
  
  it("renders the hub users title correctly", () => {
    render(<HubUsers hubUsers={usersMock} />);
    expect(screen.getByText("Hub Users")).toBeInTheDocument();
  });

  it("displays the first three users with formatted names", () => {
    render(<HubUsers hubUsers={usersMock} />);

    // Check if the formatted names for the first three users are displayed
    expect(screen.getByText("M. Johnson")).toBeInTheDocument();
    expect(screen.getByText("S. Smith")).toBeInTheDocument();
    expect(screen.getByText("D. Williams")).toBeInTheDocument();
  });

  it("does not display more than three users", () => {
    render(<HubUsers hubUsers={usersMock} />);

    // Check that the fourth user's name is not displayed
    expect(screen.queryByText("A. Brown")).not.toBeInTheDocument();
  });

  it("renders correctly when there are no users", () => {
    render(<HubUsers hubUsers={[]} />);

    // Check if there are no user names displayed
    expect(screen.queryByText(/^[A-Z]\.\s[A-Za-z]+$/)).not.toBeInTheDocument();
  });

  it("formats names correctly to 'First Initial. Last Name'", () => {
    render(
      <HubUsers
        hubUsers={[
          { tokenId: "5", firstName: "Emily", lastName: "Clark", role: "basic" },
        ]}
      />
    );

    // Check formatted name
    expect(screen.getByText("E. Clark")).toBeInTheDocument();
  });
});
