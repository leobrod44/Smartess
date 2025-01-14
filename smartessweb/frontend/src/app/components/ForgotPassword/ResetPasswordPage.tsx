"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import Toast, { showToastError, showToastSuccess } from "../Toast";
import { IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { useState } from "react";

const ResetPasswordPage = () => {
  const [newPassword, setnewPassword] = useState("");
  const [confirmNewPassword, setconfirmNewPassword] = useState("");

  const [showNewPassword, setshowNewPassword] = useState(false);
  const [showConfirmedPassword, setConfirmedPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      showToastError("Please fill in all required fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToastError("Passwords do not match");
      return;
    }

    // If validation passes
    showToastSuccess("Password reset successful!");

    console.log("New password: " + newPassword);
    console.log("New confirmed password: " + confirmNewPassword);
  };

  return (
    <>
      <Toast />
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex">
            <Link href="/">
              <Image
                className="h-8 w-auto"
                src={logo}
                alt="Logo"
                width={100}
                height={40}
              />
            </Link>
          </div>
        </div>
      </div>

      <form
        className="flex flex-col items-center justify-center"
        onSubmit={handleSubmit}
      >
        <section className="flex flex-col items-center justify-center">
          <div>
            <h1 className="text-4xl text-[#30525E] pt-20 font-sequel-sans font-extrabold">
              Reset Password
            </h1>
          </div>

          <div>
            <h3 className="text-sm text-[#52525C] pt-5 pb-5 font-sequel-sans-regular">
              Please create a new password.
            </h3>
          </div>
        </section>

        <section className="flex flex-row">
          <div className="flex flex-col w-full items-center pb-2">
            <div className="flex flex-col text-sm text-[#52525C]">
              <label htmlFor="new-password" className="pb-4 pt-4">
                New Password
              </label>
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                className="border border-gray-400 rounded-lg px-3 py-1 w-80"
                placeholder="Required"
                value={newPassword}
                onChange={(e) => setnewPassword(e.target.value)}
              />
              <label htmlFor="confirm-password" className="pb-4 pt-4">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type={showConfirmedPassword ? "text" : "password"}
                className="border border-gray-400 rounded-lg px-3 py-1 w-80"
                placeholder="Required"
                value={confirmNewPassword}
                onChange={(e) => setconfirmNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col font-light text-sm text-[#52525C] pr-2 pl-2 w-full md:w-1/2 ">
            <div className="pt-12">
              <IconButton
                type="button"
                onClick={() => setshowNewPassword(!showNewPassword)}
                className="flex flex-col items-center color-[#266472]"
              >
                {showNewPassword ? (
                  <VisibilityOff className="text-[#266472]" />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </div>
            <div className="pt-12">
              <IconButton
                type="button"
                onClick={() => setConfirmedPassword(!showConfirmedPassword)}
                className="flex flex-col items-center color-[#266472]"
              >
                {showConfirmedPassword ? (
                  <VisibilityOff className="text-[#266472]" />
                ) : (
                  <Visibility />
                )}
              </IconButton>
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-col items-center justify-center">
            <button
              type="submit"
              className="mt-6 px-6 py-3 bg-[#266472] text-white rounded-full hover:bg-[#1f505e] transition duration-300"
            >
              Reset Password
            </button>
          </div>
        </section>
      </form>
    </>
  );
};

export default ResetPasswordPage;
