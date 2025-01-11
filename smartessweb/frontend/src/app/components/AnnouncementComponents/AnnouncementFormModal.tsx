"use client";

import React, { useEffect, useState } from "react";
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
  const [selectedProject, setSelectedProject] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
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
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, [router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-lg p-8 max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
          >
            ✕
          </button>

          {/* Modal Title */}
          <h2 className="text-center text-lg font-semibold text-gray-900">
            Send An Announcement
          </h2>

          {/* Announcement Type Section */}
          <div className="mt-8">
            <fieldset>
              <legend className="text-sm font-semibold text-gray-900">
                Announcement Type
              </legend>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-x-3">
                  <input
                    id="organization"
                    name="announcementType"
                    type="radio"
                    className="h-4 w-4 rounded-full border-gray-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="organization"
                    className="text-sm font-medium text-gray-900"
                  >
                    Organization
                  </label>
                </div>
                <div className="flex items-center gap-x-3">
                  <input
                    id="project"
                    name="announcementType"
                    type="radio"
                    className="h-4 w-4 rounded-full border-gray-300 bg-white checked:bg-indigo-600 checked:border-indigo-600 focus:ring-indigo-600"
                  />
                  <label
                    htmlFor="project"
                    className="text-sm font-medium text-gray-900"
                  >
                    Project
                  </label>
                </div>
              </div>
            </fieldset>
          </div>

          {/* Select Project Dropdown */}
          <div className="mt-10">
            <label
              htmlFor="project-dropdown"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Select Project
            </label>
            <select
              id="project-dropdown"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 text-base text-gray-900 shadow-sm focus:ring-indigo-600 focus:border-indigo-600 transition-all"
            >
              {projects.map((project) => (
                <option
                  key={project.projectId}
                  value={project.projectId}
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  {project.address}
                </option>
              ))}
            </select>
          </div>

          {/* Form Section */}
          <form className="mt-10 space-y-10">
            {/* Content Input */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-900"
              >
                Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={4}
                className="mt-2 block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 border-gray-300 placeholder:text-gray-400 focus:ring-indigo-600 focus:border-indigo-600"
                placeholder="Write your content here..."
              />
            </div>

            {/* Cover Photo Input */}
            <div>
              <label
                htmlFor="cover-photo"
                className="block text-sm font-medium text-gray-900"
              >
                Cover Photo
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" />
                  <div className="mt-4 flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-x-4">
              <button
                type="button"
                onClick={onClose}
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
