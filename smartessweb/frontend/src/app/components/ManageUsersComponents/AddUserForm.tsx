"use client";

import React, { useState, useEffect } from "react";
import { generateMockProjects, Project } from "../../mockData";
import ProjectAddressMenu from "./ProjectAddressMenu";
import DeleteIcon from "@mui/icons-material/Delete";
import Toast, { showToastError } from "../Toast";

type AddUserProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddUserModal({ isOpen, onClose }: AddUserProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("basic");

  useEffect(() => {
    const mockProjects = generateMockProjects();
    setProjects(mockProjects);
  }, []);

  const resetForm = () => {
    setEmail("");
    setRole("basic");
    setSelectedProjects([]);
    setSelectedProjectIds([]);
  };

  const handleProjectSelect = (project: {
    projectId: number;
    address: string;
  }) => {
    if (!selectedProjects.includes(project.address)) {
      setSelectedProjects((prev) => [...prev, project.address]);
      setSelectedProjectIds((prev) => [...prev, project.projectId]);
    }
  };

  const handleRemoveProject = (address: string) => {
    setSelectedProjects((prev) => prev.filter((a) => a !== address));

    const project = projects.find((proj) => proj.address === address);
    if (project) {
      setSelectedProjectIds((prev) =>
        prev.filter((id) => id !== Number(project.projectId))
      );
    }
    console.log("Selected Project IDs:", selectedProjectIds);
  };

  const unlinkedProjects = projects
    .filter((project) => !selectedProjects.includes(project.address))
    .map((project) => ({
      projectId: Number(project.projectId),
      address: project.address,
    }));

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendInvitation = () => {
    if (!email) {
      showToastError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      showToastError("Invalid email format");
      return;
    }

    if (selectedProjects.length === 0) {
      showToastError("At least one project must be selected");
      return;
    }

    // Logic to send the invitation goes here
    resetForm();
    onClose();
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
                className="block text-sm font-medium text-[#30525E]"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-md border-gray-300 bg-white px-3 py-2 text-base focus:ring-[#254752] focus:border-[#254752]"
                placeholder="email@example.com"
              />
            </div>

            {/* Role Dropdown */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-[#30525E]"
              >
                Assign Role <span className="text-red-500">*</span>
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

            {/* Always Open Project Selection */}
            <div className="mt-4">
              <p className="block text-sm font-medium text-[#30525E]">
                Select Projects <span className="text-red-500">*</span>
              </p>
              <ProjectAddressMenu
                unlinkedProjects={unlinkedProjects}
                onSelectProject={handleProjectSelect}
              />
              {/* Render Selected Projects */}
              <div className="flex flex-col gap-2 mt-4">
                {selectedProjects.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border p-2 rounded-md shadow-sm"
                  >
                    <span>{address}</span>
                    <DeleteIcon
                      onClick={() => handleRemoveProject(address)}
                      className="text-red-600 hover:text-red-800"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-x-4">
              <button
                type="button"
                onClick={handleSendInvitation}
                className="flex-1 rounded-md bg-[#254752] px-4 py-2 font-medium text-white shadow-sm hover:bg-[#14323B]"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
      <Toast />
    </div>
  );
}
