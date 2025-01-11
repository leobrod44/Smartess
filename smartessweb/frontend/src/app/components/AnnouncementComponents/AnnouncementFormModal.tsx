"use client";

import React, { useEffect, useState, useCallback } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { projectApi } from "@/api/page";
import { Project } from "../../mockData";

type AnnouncementFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AnnouncementFormModal({
  isOpen,
  onClose,
}: AnnouncementFormModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>("");
  const [type, setType] = useState<"organization" | "project">("organization");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/sign-in");
        return;
      }
      const response = await projectApi.getUserProjects(token);
      setProjects(response.projects);

      if (response.projects.length > 0) {
        setSelectedProject(response.projects[0].projectId);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  }, [router]);

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
    }
  }, [isOpen, fetchProjects]);

  const resetForm = () => {
    setKeywords([]);
    setNewKeyword("");
    setType("organization");
    setSelectedProject(projects[0]?.projectId || "");
    setContent("");
    setFiles([]);
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords((prev) => [...prev, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords((prev) => prev.filter((k) => k !== keyword));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach((file) => {
        if (file.size <= 10 * 1024 * 1024) {
          setFiles((prev) => [...prev, file]);
        } else {
          console.error(
            `File "${file.name}" exceeds 10MB limit or invalid type.`
          );
        }
      });
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const announcementData = {
      type,
      selectedProject,
      content,
      keywords,
      files,
    };

    console.log("Submitting Announcement Data:", announcementData);
    resetForm();
    onClose();
  };

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

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-8"
          >
            {/* Announcement Type */}
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900">
                Announcement Type
              </legend>
              <div className="mt-4 space-y-4">
                {["organization", "project"].map((option) => (
                  <div
                    key={option}
                    className="flex items-center gap-x-3"
                  >
                    <input
                      id={option}
                      name="announcementType"
                      type="radio"
                      checked={type === option}
                      onChange={() =>
                        setType(option as "organization" | "project")
                      }
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

            {/* Project Dropdown */}
            {type === "project" && (
              <div>
                <label
                  htmlFor="project-dropdown"
                  className="block text-sm font-medium text-gray-900"
                >
                  Select Project
                </label>
                <select
                  id="project-dropdown"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:ring-[#254752] focus:border-[#254752]"
                >
                  {projects.map((project) => (
                    <option
                      key={project.projectId}
                      value={project.projectId}
                    >
                      {project.address}
                    </option>
                  ))}
                </select>
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
                      upload files
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
                  {files.length > 0 && (
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
                              {/* Remove file button */}
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
