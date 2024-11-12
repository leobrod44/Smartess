import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";

function TicketHeader() {
  const [showFullText, setShowFullText] = useState(false);
  const [isTextShort, setIsTextShort] = useState(false);

  const fullText = `It is really cold inside, please come and fix my window. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
  const textRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkTextHeight = () => {
      if (textRef.current) {
        const isShort =
          textRef.current.scrollHeight <= textRef.current.clientHeight;
        setIsTextShort(isShort);
      }
    };
    checkTextHeight(); 
    window.addEventListener("resize", checkTextHeight); 

    return () => {
      window.removeEventListener("resize", checkTextHeight); 
    };
  }, [fullText]);


  const handleToggle = () => {
    setShowFullText((prev) => !prev);
  };

  return (
    <div className="w-full px-2.5 bg-white rounded-[38px] shadow border-2 border-[#254752]/30 shadow-xl">
      <div className="w-full px-[13px] pt-6 flex items-center justify-between">
        <div className="flex flex-col items-start">
          <div className="text-[#254752] text-[30px] font-sequel-sans-black">
            Unit 103
          </div>
          <div className="text-[#254752] text-[20px] font-sequel-sans ">
            1000 de la Gauchetiere
          </div>
        </div>

        <div className=" px-5 bg-[#729987] rounded-[20px] flex justify-center items-center text-center text-white text-s font-sequel-sans">
          Open
        </div>
      </div>

      <div className="w-full pt-6 px-4 flex flex-col items-start">
        <div className="text-[#14323b] text-l font-bold font-sequel-sans-light leading-8">
          Ticket ID: 1
        </div>
        <div className="text-[#14323b] text-l font-bold font-sequel-sans-light leading-8">
          Ticket Type: REPAIR
        </div>
        <div className="flex justify-start items-start gap-8">
          <div className="text-[#14323b] text-l font-bold font-sequel-sans-light leading-8">
            Submitted by: Larry Johnson
          </div>
          <button className="px-[17px] py-2 bg-[#729987] rounded-[20px] flex justify-center items-center hover:bg-[#5C7A6B] transition duration-300">
            <div className="text-center text-white text-m font-sequel-sans leading-3">
              Contact
            </div>
          </button>
        </div>
      </div>

      <div className="w-[full] h-[3px] my-7 bg-[#a0bfca] rounded-[5px]"></div>

      <div className="w-full px-4 flex flex-col items-start gap-[7px]">
        <div className="w-full flex justify-between items-end">
          <div className="text-[#14323b] text-2xl font-sequel-sans">
            My Window is Broken
          </div>
          <div className="text-black text-l font-normal font-['Sequel Sans']">
            April 13, 2024
          </div>
        </div>

        <div
          ref={textRef}
          className={`text-black text-s font-normal font-sequel-sans leading-[30px] pb-6 ${
            showFullText ? "" : "line-clamp-2"
          }`}
        >
          {fullText}
        </div>

        {!isTextShort && (
          <div className="flex justify-end w-full mb-6">
            <button
              className="bg-[#4b7d8d] pl-2 text-white h-8 rounded-[20px] flex items-center justify-center hover:bg-[#266472] transition duration-300"
              onClick={handleToggle}
            >
              {showFullText ? "See Less" : "See More"}
              {showFullText ? (
                <ChevronUpIcon className="w-5 h-5 ml-2" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 ml-2" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TicketHeader;
