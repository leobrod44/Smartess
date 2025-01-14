"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AnnouncementComponent from "@/app/components/AnnouncementComponents/AnnouncementComponent";
import AnnouncementFormModal from "@/app/components/AnnouncementComponents/AnnouncementFormModal";
import { Announcement, generateMockAnnouncements } from "@/app/mockData";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";
import { Pagination } from "@mui/material";

const AnnouncementPage = () => {
  //sort the announcements we get by date to ensure that they are presented from most recent- oldest
  const mockAnnouncements = generateMockAnnouncements().sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(mockAnnouncements);
  const [filteredAnnouncements, setFilteredAnnouncements] =
    useState<Announcement[]>(mockAnnouncements);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 5;

  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  const filterOptions = ["Most Likes", "Tag: Project", "Tag: Organization"];

  //setting up the skeleton for getting the announcements from backens
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/sign-in");
      return;
    }
    const fetchData = async () => {
      // const responseAnnouncements = await announcementsApi.getAnnouncements(token);
      // const fetchedAnnouncements = responseAnnouncements;
      // setAnnouncements(fetchedAnnouncements);
    };
    fetchData();
    setIsMounted(true);
  }, [router]);

  if (!isMounted) {
    return <p>Loading...</p>;
  }

  const handleSearch = (query: string) => {
    const filtered = mockAnnouncements.filter((announcement) => {
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
      return titleMatch || keywordMatch || authorMatch || descriptionMatch;
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
      case "Tag: Project":
        sortedAnnouncements = sortedAnnouncements.filter(
          (a) => a.tag === "Project"
        );
        break;
      case "Tag: Organization":
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

  return (
    <div>
      <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8  min-h-screen flex flex-col">
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

        <div className="flex flex-col gap-4 mt-10 ">
          {currentAnnouncements.length === 0 ? (
            <div className="unit-container max-w-fit sm:max-w-full mx-auto">
              <div className="bg-[#fff] rounded-[7px] w-full mt-4 mb-4 shadow-xl">
                <p className="text-[#729987] text-xl font-sequel-sans-black text-center p-2">
                  No results found.
                  <br />
                  Please adjust your filters or search criteria.
                </p>
              </div>
            </div>
          ) : (
            currentAnnouncements.map((announcement, index) => (
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
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#254752] text-white text-2xlfont-bold shadow-lg hover:bg-[#14323B] transition duration-300"
      >
        +
      </button>
      <AnnouncementFormModal isOpen={isModalOpen} onClose={closeModal} />
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
