// Alerts.test.tsx
import { render, screen } from "@testing-library/react";
import Alerts from "@/app/components/UnitComponents/Alerts";
import { Alert } from "@/app/mockData";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(), // Mock push function
  }),
}));

const mockAlerts: Alert[] = [
  {
    id: "1",
    projectId: "p1",
    unitNumber: "101",
    message: "Smoke Alarm Activated",
    timestamp: new Date(),
    resolved: false,
    icon: "icon1",
  },
  {
    id: "2",
    projectId: "p2",
    unitNumber: "102",
    message: "Water Leak Detected",
    timestamp: new Date(),
    resolved: false,
    icon: "icon2",
  },
  {
    id: "3",
    projectId: "p3",
    unitNumber: "103",
    message: "Thermostat > 25°C",
    timestamp: new Date(),
    resolved: false,
    icon: "icon3",
  },
];

describe("Alerts Component", () => {
  it("renders the Alerts component", () => {
    render(<Alerts alerts={mockAlerts} />);
    expect(screen.getByText("Alerts")).toBeInTheDocument();
  });

  it("displays the first two alerts correctly", () => {
    render(<Alerts alerts={mockAlerts} />);

    // Check if the first two alert messages are rendered
    expect(screen.getByText("SMOKE ALARM ACTIVATED")).toBeInTheDocument();
    expect(screen.getByText("WATER LEAK DETECTED")).toBeInTheDocument();

    // Check that only two alerts are displayed, even if more are provided
    const alertMessages = screen.getAllByText(/ACTIVATED|DETECTED|THERMOSTAT/i);
    expect(alertMessages).toHaveLength(2);
  });

  it('displays the "See All" button when there are alerts', () => {
    render(<Alerts alerts={mockAlerts} />);
    expect(screen.getByText("See All")).toBeInTheDocument();
  });

  it('shows "No alerts found" message when there are no alerts', () => {
    render(<Alerts alerts={[]} />);
    expect(screen.getByText("No alerts found")).toBeInTheDocument();
    expect(screen.queryByText("See All")).not.toBeInTheDocument();
  });

  it("capitalizes alert messages correctly", () => {
    render(<Alerts alerts={mockAlerts} />);

    // Verify that the messages are capitalized
    expect(screen.getByText("SMOKE ALARM ACTIVATED")).toBeInTheDocument();
    expect(screen.getByText("WATER LEAK DETECTED")).toBeInTheDocument();
  });
});
