"use client";

import React, { useEffect, useState, useCallback } from "react";
import { showToastSuccess, showToastError } from "../Toast";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { projectApi } from "@/api/page";
import { Project } from "../../mockData";
import { announcementApi } from "@/api/dashboard/announcement/page";
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

type AnnouncementFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAnnouncementAdded: (newAnnouncement: AnnouncementApiData) => void;
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AnnouncementFormModal({
  isOpen,
  onClose,
  onAnnouncementAdded,
}: AnnouncementFormModalProps) {
  const router = useRouter();
  const { userId } = useUserContext(); // Fetch user ID from context

  // State variables for managing form data and UI states
  const [projects, setProjects] = useState<Project[]>([]);
  const [type, setType] = useState<"organization" | "project">("organization");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [content, setContent] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);

  // Fetch user's projects when the modal is open
  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token"); // Fetch token from local storage
      if (!token) {
        router.push("/sign-in"); // Redirect if not authenticated
        return;
      }
      const response = await projectApi.getUserProjects(token); // Fetch projects
      setProjects(response.projects); // Update projects state
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  }, [router]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects(); // Fetch projects on modal open
    }
  }, [isOpen, fetchProjects]);

  // Reset form to its initial state
  const resetForm = () => {
    setKeywords([]);
    setNewKeyword("");
    setType("organization");
    setSelectedProject("");
    setContent("");
    setFiles([]);
  };

  // Add a new keyword
  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]); // Update keywords list
      setNewKeyword(""); // Clear input
    }
  };

  // Remove a keyword
  const handleRemoveKeyword = (keyword: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    selectedFiles.forEach((file) => {
      if (file.size <= 10 * 1024 * 1024) {
        setFiles((prev) => [...prev, file]); // Add file if within size limit
      } else {
        console.error(`File "${file.name}" exceeds 10MB limit.`);
        showToastError(`File "${file.name}" exceeds 10MB limit.`);
      }
    });
  };

  // Remove a file from the list
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      showToastError("Please enter announcement content.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("type", type); // Add type to form data
      formData.append("user_id", userId); // Add user ID
      formData.append("content", content); // Add content

      // Additional logic for organization or project type
      if (type === "organization") {
        const orgResponse = await announcementApi.getOrgId(userId);
        formData.append("org_id", orgResponse.orgId);
      } else {
        const selProjObj = projects.find((p) => p.address === selectedProject);
        if (!selProjObj) {
          showToastError("Please select a valid project.");
          return;
        }
        formData.append("proj_id", selProjObj.projectId.toString());
      }

      // Append keywords and files
      if (keywords.length) {
        formData.append("keywords", JSON.stringify(keywords));
      }
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await announcementApi.postAnnouncement(formData); // Post announcement
      const newAnnouncement = response.announcements[0]; // Fetch new announcement

      await onAnnouncementAdded(newAnnouncement); // Notify parent

      // Notify recipients (organization or project-specific emails)
      let fetchedEmails: string[] = [];
      if (type === "organization") {
        const orgResponse = await announcementApi.getOrgId(userId);
        const emailResponse = await announcementApi.getEmailsInOrg(
          orgResponse.orgId
        );
        fetchedEmails = emailResponse.emails;
      } else {
        const selProjObj = projects.find((p) => p.address === selectedProject);
        if (selProjObj) {
          const emailResponse = await announcementApi.getEmailsInProject(
            selProjObj.projectId
          );
          fetchedEmails = emailResponse.emails;
        }
      }

      if (fetchedEmails.length > 0) {
        const emailForm = new FormData();
        emailForm.append("emailList", JSON.stringify(fetchedEmails));
        emailForm.append("type", type);
        emailForm.append("content", content);

        if (type === "project") {
          emailForm.append("selectedAddress", selectedProject);
        }
        if (keywords.length) {
          emailForm.append("keywords", JSON.stringify(keywords));
        }
        files.forEach((file) => emailForm.append("files", file));

        await announcementApi.sendAnnouncement(emailForm); // Send emails
      }

      showToastSuccess("Announcement posted successfully!");
      resetForm();
      onClose();

      setTimeout(() => {
        router.push("/dashboard/announcement"); // Redirect after success
      }, 1000);
    } catch (err) {
      console.error("Failed to post announcement:", err);
      showToastError("Failed to post announcement.");
    }
  };

  // Dropdown label
  const selectedProjectObj = projects.find(
    (p) => p.address === selectedProject
  );
  const dropdownLabel = selectedProjectObj
    ? selectedProjectObj.address
    : "Select Project";

  // Handle project selection
  const handleSelectProject = (projectAddress: string) => {
    setSelectedProject(projectAddress);
    setIsOpenDropdown(false); // Close dropdown
  };

  // If modal is not open, render nothing
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-lg p-8 max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
          >
            ✕
          </button>

          <h2 className="text-center text-lg font-semibold text-gray-900">
            Send An Announcement
          </h2>

          {/* The Form */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-8"
          >
            {/* Announcement Type */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900">
                Announcement Type
              </legend>
              <div className="mt-2 space-y-2">
                {(["organization", "project"] as const).map((option) => (
                  <div
                    key={option}
                    className="flex items-center gap-x-3"
                  >
                    <input
                      id={option}
                      name="announcementType"
                      type="radio"
                      checked={type === option}
                      onChange={() => setType(option)}
                      className="h-4 w-4 rounded-full border-gray-300 focus:ring-[#254752]"
                    />
                    <label
                      htmlFor={option}
                      className="text-sm font-medium text-gray-900"
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Project dropdown (if type=project) */}
            {type === "project" && (
              <div className="w-full">
                <label
                  htmlFor="address-dropdown"
                  className="block text-sm font-medium text-gray-900"
                >
                  Select Project
                </label>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenDropdown(!isOpenDropdown)}
                    className="inline-flex w-full justify-between items-center gap-x-1.5 rounded-md bg-[#254752] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3b5c6b]"
                  >
                    {dropdownLabel}
                    {isOpenDropdown ? (
                      <ChevronUpIcon
                        className="-mr-1 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronDownIcon
                        className="-mr-1 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {isOpenDropdown && (
                    <div className="mt-2 max-h-60 overflow-y-auto rounded-md bg-white shadow-lg">
                      <div className="py-1">
                        {projects.map((project) => (
                          <button
                            key={project.projectId}
                            type="button"
                            onClick={() => handleSelectProject(project.address)}
                            className={classNames(
                              selectedProject === project.address
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700 hover:bg-gray-200 hover:text-gray-900",
                              "block w-full text-left px-4 py-2 text-sm"
                            )}
                          >
                            {project.address}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-900"
              >
                Content
              </label>
              <textarea
                id="content"
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-base focus:ring-[#254752] focus:border-[#254752]"
                placeholder="Write your content here..."
              />
            </div>

            {/* Keywords */}
            <div>
              <label className="block text-sm font-medium text-gray-900">
                Keywords
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Enter a keyword..."
                  className="flex-1 rounded-md border-gray-300 bg-white px-3 py-2 focus:ring-[#254752] focus:border-[#254752]"
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="rounded-md bg-[#254752] px-4 py-2 text-sm text-white hover:bg-[#14323B]"
                >
                  Add
                </button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="flex items-center gap-2 rounded-full bg-[#254752]/10 px-3 py-1 text-sm text-[#254752]"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(keyword)}
                      className="text-[#254752] hover:text-[#14323B]"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium text-gray-900"
              >
                Files
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-1 text-sm text-gray-500">
                    Drag & drop or{" "}
                    <span className="text-[#254752] cursor-pointer underline">
                      upload
                    </span>
                  </p>
                  <label
                    htmlFor="file-upload"
                    className="relative mt-4 inline-block rounded-md bg-[#254752] px-4 py-2 text-sm font-medium text-white hover:bg-[#14323B] cursor-pointer"
                  >
                    Select Files
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>

                  {/* Display Selected Files */}
                  {!!files.length && (
                    <div className="mt-6 text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Attached Files:
                      </p>
                      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                        {files.map((file, idx) => {
                          const fileURL = URL.createObjectURL(file);
                          const isImage = file.type.startsWith("image/");
                          return (
                            <li
                              key={`${file.name}-${idx}`}
                              className="relative flex items-center gap-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm"
                            >
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(idx)}
                                className="absolute top-1 right-1 rounded-full bg-white text-gray-400 hover:text-red-600"
                              >
                                ✕
                              </button>

                              {isImage ? (
                                <img
                                  src={fileURL}
                                  alt={file.name}
                                  className="h-12 w-12 object-cover rounded"
                                />
                              ) : (
                                <PhotoIcon className="h-12 w-12 text-gray-300" />
                              )}
                              <span className="text-sm text-gray-600 truncate max-w-[8rem]">
                                {file.name}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <p className="mt-2 text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-x-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                className="flex-1 rounded-md bg-gray-400 px-4 py-2 font-medium text-white hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 rounded-md bg-[#254752] px-4 py-2 font-medium text-white shadow-sm hover:bg-[#14323B]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
