import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterComponent from "@/app/components/FilterList"; // Adjust the import based on your file structure

describe("FilterComponent", () => {
  const mockOnFilterChange = jest.fn(); // Mock function to track filter changes
  const filterOptions = ["Option 1", "Option 2", "Option 3"];

  beforeEach(() => {
    render(
      <FilterComponent
        onFilterChange={mockOnFilterChange}
        filterOptions={filterOptions}
      />
    );
  });

  it("renders the filter button", () => {
    const button = screen.getByRole("button"); // Find the button
    expect(button).toBeInTheDocument(); // Ensure it is in the document
  });

  it("opens the menu when the button is clicked", () => {
    const button = screen.getByRole("button");
    fireEvent.click(button); // Simulate button click
    expect(screen.getByText("Option 1")).toBeInTheDocument(); // Check if the first option is rendered
    expect(screen.getByText("Option 2")).toBeInTheDocument(); // Check if the second option is rendered
    expect(screen.getByText("Option 3")).toBeInTheDocument(); // Check if the third option is rendered
  });

  it("calls onFilterChange with the selected option", () => {
    const button = screen.getByRole("button");
    fireEvent.click(button); // Open the menu
    const option = screen.getByText("Option 1");
    fireEvent.click(option); // Simulate clicking the first option
    expect(mockOnFilterChange).toHaveBeenCalledWith("Option 1"); // Check if the mock function was called with the correct argument
  });

  it("closes the menu after an option is selected", () => {
    const button = screen.getByRole("button");
    fireEvent.click(button); // Open the menu
    expect(screen.getByText("Option 1")).toBeInTheDocument(); // Menu is open

    const option = screen.getByText("Option 1");
    fireEvent.click(option); // Simulate clicking the first option
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
