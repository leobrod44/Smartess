"use client";
import React, { useState, useEffect } from "react";
import AnnouncementComponent from "@/app/components/AnnouncementComponents/AnnouncementComponent";
import AnnouncementFormModal from "@/app/components/AnnouncementComponents/AnnouncementFormModal";
import { Announcement, generateMockAnnouncements } from "@/app/mockData";
import Searchbar from "@/app/components/Searchbar";
import FilterComponent from "@/app/components/FilterList";

const AnnouncementPage = () => {
  const mockAnnouncements = generateMockAnnouncements();
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(mockAnnouncements);
  const [filteredAnnouncements, setFilteredAnnouncements] =
    useState<Announcement[]>(mockAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const filterOptions = [
    "Newest",
    "Most Likes",
    "Tag: Project",
    "Tag: Organization",
  ];

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
      return titleMatch || keywordMatch || authorMatch || descriptionMatch;
    });
    setFilteredAnnouncements(filtered);
  };

  const handleFilterChange = (filterValue: string) => {
    let sortedAnnouncements = [...filteredAnnouncements];

    switch (filterValue) {
      case "Newest":
        sortedAnnouncements.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case "Most Likes":
        sortedAnnouncements.sort((a, b) => b.likes - a.likes);
        break;
      case "Tag: Project":
        sortedAnnouncements = announcements.filter((a) => a.tag === "Project");
        break;
      case "Tag: Organization":
        sortedAnnouncements = announcements.filter(
          (a) => a.tag === "Organization"
        );
        break;
      default:
        break;
    }
    setFilteredAnnouncements(sortedAnnouncements);
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
          {filteredAnnouncements.map((announcement, index) => (
            <AnnouncementComponent
              key={index}
              keyword={announcement.keyword}
              title={announcement.title}
              date={announcement.date}
              tag={announcement.tag}
              author={announcement.author}
              description={announcement.description}
              likes={announcement.likes}
              files={announcement.files}
            />
          ))}
        </div>
      </div>
      <button
        onClick={openModal}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#254752] text-white text-2xlfont-bold shadow-lg hover:bg-[#14323B] transition duration-300"
      >
        +
      </button>
      <AnnouncementFormModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
};

export default AnnouncementPage;
