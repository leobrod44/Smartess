import React, { useState } from "react";
import { FilterList } from "@mui/icons-material";
import { Menu, MenuItem, Button } from "@mui/material";

interface FilterComponentProps {
  onFilterChange: (filterValue: string) => void; // Type for the filter change handler
  filterOptions: string[];
}

const FilterComponent = ({
  onFilterChange,
  filterOptions,
}: FilterComponentProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null); // State for controlling the dropdown

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget); // Set the dropdown anchor
  };

  const handleClose = () => {
    setAnchorEl(null); // Close the dropdown
  };

  const handleFilterSelection = (filterValue: string) => {
    onFilterChange(filterValue); // Pass the selected filter back to the parent
    handleClose(); // Close the dropdown after selection
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        className="bg-transparent text-[#14323b] hover:bg-[#14323b] hover:text-white transition duration-300"
      >
        <FilterList className="h-6 w-6" />
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)} // Check if the dropdown is open
        onClose={handleClose}
      >
        {filterOptions.map((option, index) => (
          <MenuItem key={index} onClick={() => handleFilterSelection(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default FilterComponent;
