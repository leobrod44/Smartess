import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HubOwner from "@/app/components/UnitComponents/HubOwner";

describe("HubOwner Component", () => {
  const ownerMock = {
    firstName: "john",
    lastName: "doe",
    email: "johndoe@example.com",
  };

  it("renders the hub owner title correctly", () => {
    render(<HubOwner owner={ownerMock} />);
    expect(screen.getByText("Hub Owner")).toBeInTheDocument();
  });

  it("renders the owner's formatted name and email when owner exists", () => {
    render(<HubOwner owner={ownerMock} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("johndoe@example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /contact/i })
    ).toBeInTheDocument();
  });

  it("renders 'No hub owner found' message when owner is null", () => {
    render(<HubOwner owner={null} />);
    expect(screen.getByText("No hub owner found")).toBeInTheDocument();
  });

  it("formats names correctly with capitalized first letters", () => {
    const { container } = render(<HubOwner owner={ownerMock} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("does not render email or button if owner properties are missing", () => {
    const incompleteOwner = { firstName: "", lastName: "", email: "" };
    render(<HubOwner owner={incompleteOwner} />);
    expect(screen.getByText("No hub owner found")).toBeInTheDocument();
  });
});
