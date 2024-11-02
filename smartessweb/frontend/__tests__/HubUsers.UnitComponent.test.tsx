import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HubUsers from "@/app/components/UnitComponents/HubUsers";

describe("HubUsers Component", () => {
  const usersMock = [
    { firstName: "Michael", lastName: "Johnson" },
    { firstName: "Sarah", lastName: "Smith" },
    { firstName: "David", lastName: "Williams" },
    { firstName: "Alice", lastName: "Brown" },
  ];

  it("renders the hub users title correctly", () => {
    render(<HubUsers users={usersMock} />);
    expect(screen.getByText("Hub users")).toBeInTheDocument();
  });

  it("displays the first three users with formatted names", () => {
    render(<HubUsers users={usersMock} />);

    // Check if the formatted names for the first three users are displayed
    expect(screen.getByText("M. Johnson")).toBeInTheDocument();
    expect(screen.getByText("S. Smith")).toBeInTheDocument();
    expect(screen.getByText("D. Williams")).toBeInTheDocument();
  });

  it("does not display more than three users", () => {
    render(<HubUsers users={usersMock} />);

    // Check that the fourth user's name is not displayed
    expect(screen.queryByText("A. Brown")).not.toBeInTheDocument();
  });

  it("renders correctly when there are no users", () => {
    render(<HubUsers users={[]} />);

    // Check if there are no user names displayed
    expect(screen.queryByText(/^[A-Z]\.\s[A-Za-z]+$/)).not.toBeInTheDocument();
  });

  it("formats names correctly to 'First Initial. Last Name'", () => {
    render(<HubUsers users={[{ firstName: "Emily", lastName: "Clark" }]} />);

    // Check formatted name
    expect(screen.getByText("E. Clark")).toBeInTheDocument();
  });
});
