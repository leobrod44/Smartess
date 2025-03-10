"use client";

import { useProjectContext } from "@/context/ProjectProvider";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { /*generateMockSurveillanceCameras, */ Project } from "../../mockData";
import { surveillanceApi } from "@/api/page";
import Searchbar from "@/app/components/Searchbar";
import { IconButton, Pagination } from "@mui/material";
import PlayArrow from "@mui/icons-material/PlayArrow";
import SurveillanceWidget from "@/app/components/SurveillanceComponents/SurveillanceWidget";
import Image from "next/image";
import NoResultsFound from "@/app/components/NoResultsFound";

const SurveillancePage = () => {
  const router = useRouter();
  // const videoFrames = Array(16).fill(null);
  // const mockData = generateMockSurveillanceCameras();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectImages, setProjectImages] = useState<{
    [projectId: string]: string;
  }>({});
  const { selectedProjectAddress } = useProjectContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [widgetFilter, setWidgetFilter] = useState<
    "all" | "live" | "disconnected"
  >("all");

  const unitsPerPage = 4;

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);

      try {
        const responseProjects = await surveillanceApi.getUserProjects(token);
        setProjects(responseProjects.projects);

        const responseImages = await surveillanceApi.getProjectImages(token);

        const imagesMap = responseImages.images.reduce((acc, imageUrl) => {
          const fileName = imageUrl.split("/").pop()?.split(".")[0];
          if (fileName) {
            acc[fileName] = imageUrl;
          }
          return acc;
        }, {} as { [projectId: string]: string });

        setProjectImages(imagesMap);
      } catch (error) {
        console.error("Error fetching surveillance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const allUnits = projects.flatMap((project) =>
    project.units.map((unit) => ({
      ...unit,
      projectAddress: project.address,
      pendingTickets: unit.tickets.pending,
    }))
  );

  const filteredUnitsByProject = allUnits.filter((unit) => {
    const effectiveProjectAddress = selectedProjectAddress || "ALL PROJECTS";
    const normalizedSearchQuery = searchQuery.toLowerCase().trim();

    const matchesProjectAddress =
      effectiveProjectAddress === "ALL PROJECTS" ||
      unit.projectAddress === effectiveProjectAddress;

    const matchesSearchQuery =
      unit.projectAddress.toLowerCase().includes(normalizedSearchQuery) ||
      String(unit.unitNumber).toLowerCase().includes(normalizedSearchQuery) ||
      `unit ${unit.unitNumber}`.toLowerCase().includes(normalizedSearchQuery);

    return matchesProjectAddress && matchesSearchQuery;
  });

  const filteredByCameraStatus = filteredUnitsByProject.filter((unit) => {
    if (widgetFilter === "all") return true;
    if (widgetFilter === "live" && unit.cameraStatus === "live") return true;
    if (widgetFilter === "disconnected" && unit.cameraStatus === "disconnected")
      return true;
    return false;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleViewIndividualUnitSurveillance = (
    projectAddress: string,
    unitNumber: string
  ) => {
    router.push(
      `../dashboard/individual-unit-surveillance/${projectAddress}/unit/${unitNumber}`
    );
  };

  const totalPages = Math.ceil(filteredByCameraStatus.length / unitsPerPage);

  const currentUnits =
    filteredByCameraStatus.length === 0
      ? []
      : filteredByCameraStatus.slice(
          (currentPage - 1) * unitsPerPage,
          currentPage * unitsPerPage
        );

  const liveCamerasCount = allUnits.filter(
    (unit) => unit.cameraStatus === "live"
  ).length;
  const inactiveCamerasCount = allUnits.filter(
    (unit) => unit.cameraStatus === "disconnected"
  ).length;

  const handleClickTotal = () => setWidgetFilter("all");
  const handleClickLive = () => setWidgetFilter("live");
  const handleClickDisconnected = () => setWidgetFilter("disconnected");

  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 min-h-screen">
        <div className="flex flex-row justify-between">
          <h2 className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight">
            Surveillance Page
          </h2>
          <div className="flex flex-row">
            <Searchbar onSearch={handleSearch} />
          </div>
        </div>

        {!isLoading && (
          <div className="flex justify-center px-4">
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-4 w-full max-w-[100%] mt-2">
              <SurveillanceWidget
                count={allUnits.length}
                label="Total Cameras"
                backgroundColor="bg-[#56798d]"
                onClick={handleClickTotal}
              />
              <SurveillanceWidget
                count={liveCamerasCount}
                label="Live Cameras"
                backgroundColor="bg-[#729987]"
                onClick={handleClickLive}
              />
              <SurveillanceWidget
                count={inactiveCamerasCount}
                label="Inactive Cameras"
                backgroundColor="bg-[#A6634F]"
                onClick={handleClickDisconnected}
              />
            </div>
          </div>
        )}
        {isLoading ? (
          <p className="text-[#729987] text-xl font-sequel-sans-black text-center p-2">
            Loading surveillance data...
          </p>
        ) : currentUnits.length === 0 ? (
          <div className="unit-container max-w-fit sm:max-w-full mx-auto mt-10">
            <NoResultsFound searchItem={searchQuery}/>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mt-3">
            {currentUnits.slice(0, unitsPerPage).map((unit) => (
              <div
                key={unit.unitNumber}
                className="border p-2 bg-[#4b7d8d] rounded-lg cursor-pointer relative"
                onClick={() =>
                  handleViewIndividualUnitSurveillance(
                    unit.projectAddress,
                    unit.unitNumber
                  )
                }
              >
                <div className="relative">
                  {projectImages[unit.projectId.toString()] && (
                    <Image
                      src={projectImages[unit.projectId.toString()]}
                      alt={`Project ${unit.projectId}`}
                      width={300}
                      height={300}
                      unoptimized={true}
                      className="w-full h-auto"
                    />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconButton
                      sx={{
                        backgroundColor: "rgba(55, 65, 81, 0.5)",
                        borderRadius: "50%",
                        padding: "12px",
                      }}
                    >
                      <PlayArrow sx={{ color: "white", fontSize: "48px" }} />
                    </IconButton>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-white">
                  <p className="text-sm">{unit.projectAddress}</p>
                  <p className="text-sm flex items-center">
                    Unit {unit.unitNumber}
                    <span
                      className={`w-3 h-3 rounded-full ml-2 ${
                        unit.cameraStatus === "live"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <Pagination
            className="custom-pagination"
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      </div>
    </div>
  );
};

export default SurveillancePage;
