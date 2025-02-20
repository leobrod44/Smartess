"use client";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

const BackArrowButton = () => {
  const router = useRouter();

  const handleBackClick = () => {
    router.back();
  };
  return (
    <div
      className="p-2 rounded-[50px] bg-[#266472] inline-flex items-center justify-center text-[#ffffff] font-sequel-sans-light px-3 hover:bg-[#254752] transition duration-300"
      onClick={handleBackClick}
      style={{ cursor: "pointer" }}
    >
      <ArrowBack className="text-[#ffffff] w-[25px] h-[25px]" />
      Back
    </div>
  );
};

export default BackArrowButton;
