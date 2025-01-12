"use client";
import React from "react";
import AnnouncementComponent from "@/app/components/AnnouncementComponent";
import { generateMockAnnouncements } from "@/app/mockData";

const AnnouncementPage = () => {
  const mockAnnouncements = generateMockAnnouncements();

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
    </div>
  );
};

export default AnnouncementPage;
