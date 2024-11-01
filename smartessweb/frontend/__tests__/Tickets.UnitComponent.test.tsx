import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Tickets from "@/app/components/UnitComponents/Tickets";

describe("Tickets Component", () => {
  const ticketsMock = {
    total: 10,
    pending: 3,
    open: 5,
    closed: 2,
  };

  it("renders the Tickets title correctly", () => {
    render(<Tickets tickets={ticketsMock} />);
    expect(screen.getByText("Tickets")).toBeInTheDocument();
  });

  it("displays the correct total ticket count", () => {
    render(<Tickets tickets={ticketsMock} />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
  });

  it("displays the correct open ticket count", () => {
    render(<Tickets tickets={ticketsMock} />);
    expect(screen.getByText(/5/)).toBeInTheDocument();
    expect(screen.getByText(/Open/i)).toBeInTheDocument();
  });

  it("displays the correct pending ticket count", () => {
    render(<Tickets tickets={ticketsMock} />);
    expect(screen.getByText(/3/)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  it("displays the correct closed ticket count", () => {
    render(<Tickets tickets={ticketsMock} />);
    expect(screen.getByText(/2/)).toBeInTheDocument();
    expect(screen.getByText(/Closed/i)).toBeInTheDocument();
  });
});
