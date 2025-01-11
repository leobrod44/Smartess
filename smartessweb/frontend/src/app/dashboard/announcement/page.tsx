"use client";
import React, { useState } from "react";
import AnnouncementComponent from "@/app/components/AnnouncementComponents/AnnouncementComponent";
import AnnouncementFormModal from "@/app/components/AnnouncementComponents/AnnouncementFormModal";
import { generateMockAnnouncements } from "@/app/mockData";

const AnnouncementPage = () => {
  const mockAnnouncements = generateMockAnnouncements();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div>
      <h1>Announcement Page</h1>
      <div className="flex flex-col gap-4 mt-10 mx-10">
        {mockAnnouncements.map((announcement, index) => (
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

      <button
        onClick={openModal}
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#254752] text-white text-2xlfont-bold shadow-lg hover:bg-[#14323B] transition duration-300"
      >
        +
      </button>

      <AnnouncementFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default AnnouncementPage;
