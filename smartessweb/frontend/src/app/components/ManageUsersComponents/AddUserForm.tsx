"use client";

import React, { useState, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { generateMockProjects } from "../../mockData";

type AddUserProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddUserModal({ isOpen, onClose }: AddUserProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("basic");

  useEffect(() => {
    const mockProjects = generateMockProjects();
    setProjects(mockProjects);
  }, []);

  const resetForm = () => {
    setEmail("");
    setRole("basic");
    setSelectedProject(projects[0]?.address || "");
  };

  function classNames(...classes: string[]): string {
    return classes.filter(Boolean).join(" ");
  }

  const selectedProjectObj = projects.find(
    (p: any) => p.address === selectedProject
  );
  const dropdownLabel = selectedProjectObj
    ? selectedProjectObj.address
    : "Select Project";

  const handleSelectProject = (projectAddress: string) => {
    setSelectedProject(projectAddress);
    setIsOpenDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-xl bg-white shadow-lg p-8">
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
            Add a new user to your organization
          </h2>

          <form className="mt-8 space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-base focus:ring-[#254752] focus:border-[#254752]"
                placeholder="Enter user's email"
              />
            </div>

            {/* Role Dropdown */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-900"
              >
                Assign Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-base focus:ring-[#254752] focus:border-[#254752]"
              >
                <option value="basic">basic</option>
                <option value="admin">admin</option>
              </select>
            </div>

            {/* Project Dropdown */}
            <div>
              <label
                htmlFor="project-dropdown"
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
                      {projects.map((project: any) => (
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

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-x-4">
              <button
                type="button"
                className="flex-1 rounded-md bg-[#254752] px-4 py-2 font-medium text-white shadow-sm hover:bg-[#14323B]"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
