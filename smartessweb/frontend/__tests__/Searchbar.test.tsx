// Searchbar.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Searchbar from "@/app/components/Searchbar"; // Adjust the import based on your file structure

describe("Searchbar", () => {
  const mockOnSearch = jest.fn(); // Mock function to track search calls

  beforeEach(() => {
    render(<Searchbar onSearch={mockOnSearch} />);
  });

  it("renders the input field", () => {
    const input = screen.getByPlaceholderText("Search"); // Find the input by its placeholder
    expect(input).toBeInTheDocument(); // Ensure it is in the document
  });

  it("updates the query state and calls onSearch when input changes", () => {
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement;
    const query = "test query";

    fireEvent.change(input, { target: { value: query } }); // Simulate input change
    expect(input.value).toBe(query); // Check if the input value is updated
    expect(mockOnSearch).toHaveBeenCalledWith(query); // Check if the mock function was called with the correct argument
  });

  it("calls onSearch with an empty string when the input is cleared", () => {
    const input = screen.getByPlaceholderText("Search");

    fireEvent.change(input, { target: { value: "some query" } }); // Simulate entering text
    fireEvent.change(input, { target: { value: "" } }); // Simulate clearing the input
    expect(mockOnSearch).toHaveBeenCalledWith(""); // Check if the mock function was called with an empty string
  });
});
