"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnnouncementComponent from "@/app/components/AnnouncementComponents/AnnouncementComponent";
import AnnouncementFormModal from "@/app/components/AnnouncementComponents/AnnouncementFormModal";
import { announcementApi } from "@/api/dashboard/announcement/page";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import { Pagination } from "@mui/material";
import { useUserContext } from "@/context/UserProvider";

interface AnnouncementApiData {
  announcement_id: number;
  announcement_type: "organization" | "project";
  user_id: number;
  name: string | null;
  org_id: number | null;
  org_name: string | null;
  proj_id: number | null;
  address: string | null;
  content: string;
  keywords: string[] | null;
  file_urls: string[] | null;
  like_count: number;
  created_at: string;
}

interface AnnouncementItem {
  id: number;
  title: string;
  tag: "Organization" | "Project";
  author: string;
  description: string;
  date: Date;
  keyword: string;
  likes: number;
  files: { name: string; url: string }[];
}

const AnnouncementPage = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    AnnouncementItem[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 5;

  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const filterOptions = ["Most Likes", "Project Level", "Organization Level"];

  // Pull userId from context
  const { userId } = useUserContext();

  const handleAnnouncementAdded = async () => {
    try {
      // Trigger a re-fetch of announcements after adding a new one
      const response = await announcementApi.getAnnouncements(userId);
      const fetchedAnnouncements: AnnouncementItem[] =
        response.announcements.map(
          (ann: AnnouncementApiData): AnnouncementItem => {
            return {
              id: ann.announcement_id,
              title: ann.org_name ?? ann.address ?? "",
              tag:
                ann.announcement_type === "organization"
                  ? "Organization"
                  : "Project",
              author: ann.name ?? "",
              description: ann.content,
              date: new Date(ann.created_at),
              keyword: ann.keywords?.join(", ") || "",
              likes: ann.like_count || 0,
              files:
                ann.file_urls?.map((url, idx) => ({
                  name: `File ${idx + 1}`,
                  url,
                })) || [],
            };
          }
        );

      setAnnouncements(fetchedAnnouncements);
      setFilteredAnnouncements(fetchedAnnouncements);
    } catch (error) {
      console.error("Error re-fetching announcements after adding:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }

    // If userId is not yet loaded, skip fetching
    if (!userId) return;

    const fetchAnnouncements = async () => {
      try {
        // Fetch announcements
        const response = await announcementApi.getAnnouncements(userId);

        // Transform data for AnnouncementComponent
        const fetchedAnnouncements: AnnouncementItem[] =
          response.announcements.map(
            (ann: AnnouncementApiData): AnnouncementItem => {
              return {
                id: ann.announcement_id,
                title: ann.org_name ?? ann.address ?? "",
                tag:
                  ann.announcement_type === "organization"
                    ? "Organization"
                    : "Project",
                author: ann.name ?? "",
                description: ann.content,
                date: new Date(ann.created_at),
                keyword: ann.keywords?.join(", ") || "",
                likes: ann.like_count || 0,
                files:
                  ann.file_urls?.map((url, idx) => ({
                    name: `File ${idx + 1}`,
                    url,
                  })) || [],
              };
            }
          );

        setAnnouncements(fetchedAnnouncements);
        setFilteredAnnouncements(fetchedAnnouncements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
    setIsMounted(true);
  }, [router, userId]);

  if (!isMounted) {
    return <p>Loading...</p>;
  }

  const handleSearch = (query: string) => {
    const filtered = announcements.filter((announcement) => {
      const titleMatch = announcement.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const keywordMatch = announcement.keyword
        .toLowerCase()
        .includes(query.toLowerCase());
      const authorMatch = announcement.author
        .toLowerCase()
        .includes(query.toLowerCase());
      const descriptionMatch = announcement.description
        .toLowerCase()
        .includes(query.toLowerCase());
      const tagMatch = announcement.tag
        .toLowerCase()
        .includes(query.toLowerCase());

      return (
        titleMatch ||
        keywordMatch ||
        authorMatch ||
        descriptionMatch ||
        tagMatch
      );
    });
    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterValue: string) => {
    let sortedAnnouncements = [...announcements];

    switch (filterValue) {
      case "Most Likes":
        sortedAnnouncements.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case "Project Level":
        sortedAnnouncements = sortedAnnouncements.filter(
          (a) => a.tag === "Project"
        );
        break;
      case "Organization Level":
        sortedAnnouncements = sortedAnnouncements.filter(
          (a) => a.tag === "Organization"
        );
        break;
      default:
        break;
    }
    setFilteredAnnouncements(sortedAnnouncements);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(
    filteredAnnouncements.length / announcementsPerPage
  );
  const currentAnnouncements = filteredAnnouncements.slice(
    (currentPage - 1) * announcementsPerPage,
    currentPage * announcementsPerPage
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8 min-h-screen flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-[#325a67] text-[30px] leading-10 tracking-tight">
            Announcements
          </div>
          <div className="flex items-center pt-2">
            <FilterComponent
              onFilterChange={handleFilterChange}
              filterOptions={filterOptions}
            />
            <Searchbar onSearch={handleSearch} />
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-10">
          {currentAnnouncements.length === 0 ? (
            <div className="unit-container max-w-fit sm:max-w-full mx-auto">
              <div className="bg-[#fff] rounded-[7px] w-full mt-4 mb-4">
                <p className="text-[#729987] text-xl font-sequel-sans-black text-center p-2">
                  No results found.
                  <br />
                  Please adjust your filters or search criteria.
                </p>
              </div>
            </div>
          ) : (
            currentAnnouncements.map((announcement) => (
              <AnnouncementComponent
                key={announcement.id}
                keyword={announcement.keyword}
                title={announcement.title}
                date={announcement.date}
                tag={announcement.tag}
                author={announcement.author}
                description={announcement.description}
                likes={announcement.likes}
                files={announcement.files}
              />
            ))
          )}
        </div>
      </div>
      <button
        onClick={openModal}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#254752] text-white text-2xl font-bold shadow-lg hover:bg-[#14323B] transition duration-300"
      >
        +
      </button>
      <AnnouncementFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAnnouncementAdded={handleAnnouncementAdded}
      />
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
  );
};

export default AnnouncementPage;
