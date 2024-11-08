// RoleEditForm.tsx
import React, { useState } from "react";
import { Button } from "@mui/material";

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
      <div className="ml-auto">
        <Button
          onClick={onSave}
          variant="contained"
          sx={{
            backgroundColor: "#30525E",
            borderRadius: "30px",
            color: "#ffffff",
            fontWeight: "bold",
            padding: "5px 10px",
            "&:hover": {
              backgroundColor: "#b3b3b3",
              borderColor: "#b3b3b3",
            },
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default RoleEditForm;
