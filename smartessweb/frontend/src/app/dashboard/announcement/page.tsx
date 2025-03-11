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
import { useProjectContext } from "@/context/ProjectProvider";
import NoResultsFound from "@/app/components/NoResultsFound";

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
  user_id: number;
  author: string;
  description: string;
  date: Date;
  keyword: string;
  likes: number;
  files: { name: string; url: string }[];
  proj_id: number | null;
}

const AnnouncementPage = () => {
  const { selectedProjectId } = useProjectContext();
  const { userId } = useUserContext();

  const [isLoading, setIsLoading] = useState(true);

  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    AnnouncementItem[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 5;
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filterOptions = [
    "Most Likes",
    "Project Level",
    "Organization Level",
    "Posted by Me",
    "Refresh Filters",
  ];
  const handleAnnouncementAdded = async () => {
    try {
      const response = await announcementApi.getAnnouncements(userId);
      const fetchedAnnouncements: AnnouncementItem[] =
        response.announcements.map((ann: AnnouncementApiData) => ({
          id: ann.announcement_id,
          title: ann.org_name ?? ann.address ?? "",
          tag:
            ann.announcement_type === "organization"
              ? "Organization"
              : "Project",
          author: ann.name ?? "",
          description: ann.content,
          user_id: ann.user_id,
          date: new Date(ann.created_at),
          keyword: ann.keywords?.join(", ") || "",
          likes: ann.like_count || 0,
          files:
            ann.file_urls?.map((url, idx) => ({
              name: `File ${idx + 1}`,
              url,
            })) || [],
          proj_id: ann.proj_id || null,
        }));

      const sortedAnnouncements = fetchedAnnouncements.sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );

      setAnnouncements(sortedAnnouncements);
      setFilteredAnnouncements(sortedAnnouncements);
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

    if (!userId) return;

    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const response = await announcementApi.getAnnouncements(userId);
        const fetchedAnnouncements: AnnouncementItem[] =
          response.announcements.map((ann: AnnouncementApiData) => ({
            id: ann.announcement_id,
            title: ann.org_name ?? ann.address ?? "",
            tag:
              ann.announcement_type === "organization"
                ? "Organization"
                : "Project",
            author: ann.name ?? "",
            description: ann.content,
            date: new Date(ann.created_at),
            user_id: ann.user_id,
            keyword: ann.keywords?.join(", ") || "",
            likes: ann.like_count || 0,
            files:
              ann.file_urls?.map((url, idx) => ({
                name: `File ${idx + 1}`,
                url,
              })) || [],
            proj_id: ann.proj_id,
          }));

        const sortedAnnouncements = fetchedAnnouncements.sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );

        const projectFiltered = selectedProjectId
          ? sortedAnnouncements.filter(
              (announcement) =>
                announcement.proj_id === Number(selectedProjectId)
            )
          : sortedAnnouncements;

        setAnnouncements(projectFiltered);
        setFilteredAnnouncements(projectFiltered);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, [router, userId, selectedProjectId]);

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
    setQuery(query);
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
      case "Posted by Me":
        const myAnnouncements = announcements.filter(
          (announcement) => announcement.user_id === Number(userId)
        );
        sortedAnnouncements = myAnnouncements;
        break;

      case "Refresh Filters":
        sortedAnnouncements = announcements;
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
      <div className="mx-4 lg:mx-8 min-h-screen flex flex-col">
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

        <h2 className="text-left text-[#325a67] text-[16px] leading-2 tracking-tight pb-10">View the history of announcements that have been sent to tenants across your organization. Send your own announcement by clicking the plus button. </h2>
    

        <div className="flex flex-col gap-4">
          {isLoading ? (
            <p className="text-[#729987] text-xl font-sequel-sans-black text-left p-2">
              Loading ...
            </p>
          ) : announcements.length === 0 ? (
            // No announcements at all
            <div className="unit-container max-w-fit sm:max-w-full mx-auto text-center">
              <div className="bg-[#fff] rounded-[7px] w-full mt-4 mb-4 p-6">
                <p className="text-[#325a67] text-lg">
                  No announcements available.
                </p>
                <p className="text-gray-500">Be the first to post one!</p>
                <button
                  onClick={openModal}
                  className="mt-4 px-4 py-2 bg-[#254752] text-white rounded-lg hover:bg-[#14323B] transition duration-300"
                >
                  Create Announcement
                </button>
              </div>
            </div>
          ) : currentAnnouncements.length === 0 ? (
            //no filtered announcements
            <div className="unit-container max-w-fit sm:max-w-full mx-auto">
              <div className="bg-[#fff] rounded-[7px] w-full mt-4 mb-4">
                <NoResultsFound searchItem={query} />
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
