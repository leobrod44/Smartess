import { Search } from "@mui/icons-material";
import { useState } from "react";

interface SearchbarProps {
  onSearch: (query: string) => void;
}

export default function Searchbar({ onSearch }: SearchbarProps) {
  const [query, setQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 rounded-md">
        <div className="relative flex-grow">
          <input
            id="search"
            name="search"
            value={query}
            onChange={handleInputChange}
            className="block w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-[#14323b] placeholder:text-[#254752] ring-1 ring-inset ring-[#14323b] focus:outline-none focus:ring-[#14323b] sm:text-sm sm:leading-6"
            placeholder="Search"
            type="text"
          />
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#14323b]" aria-hidden="true" />
          </div>
        </div>
      </div>
    </>
  );
}
