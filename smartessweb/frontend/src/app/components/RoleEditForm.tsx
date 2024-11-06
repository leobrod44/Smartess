// RoleEditForm.tsx
import React, { useState } from "react";

interface RoleEditFormProps {
  currentRole: "admin" | "basic" | "master";
  onRoleChange: (newRole: "admin" | "basic" | "master") => void;
}

function RoleEditForm({ currentRole, onRoleChange }: RoleEditFormProps) {
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "basic" | "master"
  >(currentRole);

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRole = event.target.value as "admin" | "basic" | "master";
    setSelectedRole(newRole);
    onRoleChange(newRole); // Call the parent function to update the role
  };

  return (
    <div className="mt-4">
      <p className="text-[#30525E] text-lg font-sequel-sans-medium mb-2">
        Change Role:
      </p>
      <div className="flex gap-4">
        <label className="flex items-center hover:text-[#30525E] transition duration-200">
          <input
            type="radio"
            name="role"
            value="admin"
            checked={selectedRole === "admin"}
            onChange={handleRoleChange}
            className="mr-2 form-radio text-black hover:ring-2 hover:ring-[#30525E] transition duration-200" // Hover effect
          />
          Admin
        </label>
        <label className="flex items-center hover:text-[#30525E] transition duration-200">
          <input
            type="radio"
            name="role"
            value="basic"
            checked={selectedRole === "basic"}
            onChange={handleRoleChange}
            className="mr-2 form-radio text-black hover:ring-2 hover:ring-[#30525E] transition duration-200" // Hover effect
          />
          Basic
        </label>
      </div>
    </div>
  );
}

export default RoleEditForm;
