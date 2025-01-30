import React, { useState } from "react";

interface RoleEditFormProps {
  currentRole: "admin" | "basic" | "master";
  onRoleChange: (newRole: "admin" | "basic" | "master") => void;
  onSave: () => void; // Add a callback for Save action
}

function RoleEditForm({
  currentRole,
  onRoleChange,
  onSave,
}: RoleEditFormProps) {
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "basic" | "master"
  >(currentRole);

  const handleRoleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRole = event.target.value as "admin" | "basic" | "master";
    setSelectedRole(newRole);
    onRoleChange(newRole);
    onSave(); // Trigger save and close form on role change
  };

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <label className="flex items-center hover:text-[#30525E] transition duration-200">
        <input
          type="radio"
          name="role"
          value="admin"
          checked={selectedRole === "admin"}
          onChange={handleRoleChange}
          className="mr-2 form-radio text-black hover:ring-2 hover:ring-[#30525E] transition duration-200"
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
          className="mr-2 form-radio text-black hover:ring-2 hover:ring-[#30525E] transition duration-200"
        />
        Basic
      </label>
    </div>
  );
}

export default RoleEditForm;
