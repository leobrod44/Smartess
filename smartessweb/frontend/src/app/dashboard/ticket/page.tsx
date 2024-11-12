"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useEffect, useState } from "react";
import Link from "next/link";

const TicketPage = () => {
  const { selectedProjectId, selectedProjectAddress } = useProjectContext();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>Ticket Page</h1>
      {selectedProjectId ? (
        <>
          <p>Selected Project ID: {selectedProjectId}</p>
          <p>Project Address: {selectedProjectAddress}</p>
        </>
      ) : (
        <p>No project selected.</p>
      )}

      <Link href="../dashboard/individual-tickets">
        <button className="bg-[#4b7d8d] pl-2 text-white h-8 rounded-[20px] flex items-center justify-center hover:bg-[#266472] transition duration-300">
          Click here to go to individual ticket page
        </button>
      </Link>
    </div>
  );
};

export default TicketPage;
