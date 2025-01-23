import React, { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";
import {
  Download as DownloadIcon,
  ThumbUp as ThumbUpIcon,
} from "@mui/icons-material";
import "swiper/css";
import ImageCarousel from "../ImageCarousel";

interface AnnouncementComponentProps {
  title: string;
  keyword: string;
  date: Date;
  tag: "Project" | "Organization";
  author: string;
  description: string;
  likes: number;
  files: { name: string; url: string }[];
}

function AnnouncementComponent({
  title,
  keyword,
  date,
  tag,
  author,
  description,
  likes,
  files,
}: AnnouncementComponentProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isTextShort, setIsTextShort] = useState(false);
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  // Format the date to a readable format
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  //handling the see more option
  useEffect(() => {
    const checkTextHeight = () => {
      if (descriptionRef.current) {
        const isShort =
          descriptionRef.current.scrollHeight <=
          descriptionRef.current.clientHeight;
        setIsTextShort(isShort);
      }
    };
    checkTextHeight();
    window.addEventListener("resize", checkTextHeight);

    return () => {
      window.removeEventListener("resize", checkTextHeight);
    };
  }, [description]);

  const handleToggleDescription = () => {
    setShowFullDescription((prev) => !prev);
  };

  const downloadAllFiles = () => {
    files.forEach((file) => {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleToggleLike = () => {
    if (isLiked) {
      setLikeCount((prevCount) => prevCount - 1);
    } else {
      setLikeCount((prevCount) => prevCount + 1);
    }
    setIsLiked((prev) => !prev);
  };

  const imageFiles = files.filter((file) =>
    file.name.match(/\.(jpg|jpeg|png|gif|bmp)$/i)
  );

  return (
    <div className="w-full rounded-md px-3 pt-4 flex-col justify-start items-start gap-3 inline-flex shadow border-2 border-[#254752]/20 shadow-xl">
      <div className="w-full justify-between items-center inline-flex">
        <div className="text-black text-xl font-sequel-sans-black">{title}</div>
        <div className="text-black text-xs font-sequel-sans">
          {formattedDate}
        </div>
      </div>

      <div className="w-full justify-between items-center inline-flex">
        <div className="justify-start items-start gap-2 inline-flex">
          <div
            className={`px-3 py-1 rounded-[10px] flex items-center justify-center ${
              tag === "Project" ? "bg-[#729987]" : "bg-[#4B7D8D]"
            }`}
          >
            <span className="text-white text-xs font-sequel-sans">{tag}</span>
          </div>
          <div className="px-3 py-1 text-black text-xs font-sequel-sans">
            {author}
          </div>
        </div>
        <div className=" text-[#254752] text-md font-sequel-sans-black">
          {keyword}
        </div>
      </div>

      <div className="w-full px-3">
        <div
          ref={descriptionRef}
          className={`text-black text-base font-sequel-sans-light ${
            showFullDescription ? "block" : "text-truncate"
          }`}
        >
          {description}
        </div>
        {!isTextShort && (
          <button
            onClick={handleToggleDescription}
            className="text-black/70 font-sequel-sans hover:text-black transition-colors duration-300"
          >
            {showFullDescription ? "See Less..." : "See More..."}
          </button>
        )}
      </div>

      {/* Display image carousel if there are multiple image files */}
      {imageFiles.length > 1 ? (
        <div className="w-full flex justify-center my-3 px-3">
          <ImageCarousel files={imageFiles} />
        </div>
      ) : (
        // Display single image if only one image is found
        imageFiles.length === 1 && (
          <div className="w-full flex justify-center my-3 px-3">
            <img
              src={imageFiles[0].url}
              alt={imageFiles[0].name}
              className="w-full shadow-lg object-contain"
            />
          </div>
        )
      )}

      {files.length > 0 && (
        <div className="my-2 px-3">
          <h4 className="text-black text-sm font-sequel-sans">Files:</h4>
          <ul>
            {files.map((file) => (
              <li key={file.name}>
                <a
                  href={file.url}
                  download={file.name}
                  className="text-blue-600 hover:underline text-sm hover:text-black transition-colors duration-300"
                >
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="px-3 pb-3 justify-start items-center inline-flex">
        <div className="flex justify-start items-center gap-4">
          <Button
            variant="text"
            color="inherit"
            startIcon={<ThumbUpIcon />}
            sx={{
              padding: "4px",
              fontSize: "15px",
              textTransform: "none",
              backgroundColor: "transparent",
              color: isLiked ? "#0073e6" : "#575757",
              "&:hover": { color: "#0073e6" },
            }}
            onClick={handleToggleLike}
          >
            {likeCount}
          </Button>

          {files.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              onClick={downloadAllFiles}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "14px",
                padding: "6px 12px",
                "&:hover": { backgroundColor: "#0073e6" },
              }}
            >
              Download Files
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AnnouncementComponent;
