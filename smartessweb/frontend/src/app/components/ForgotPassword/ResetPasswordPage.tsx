"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import Toast, { showToastError, showToastSuccess } from "../Toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";

const ResetPasswordPage = () => {
  const [newPassword, setnewPassword] = useState("");
  const [confirmNewPassword, setconfirmNewPassword] = useState("");
  const [showNewPassword, setshowNewPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!newPassword || !confirmNewPassword) {
      showToastError("Please fill in all required fields");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      showToastError(
        "Password must be at least 8 characters long, include one capital letter, and one special character."
      );
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showToastError("Passwords do not match");
      return;
    }

    showToastSuccess("Password reset successful!");
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen">
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

      <div className="flex-grow">
        <form
          className="flex flex-row items-center justify-center"
          onSubmit={handleSubmit}
        >
          <section className="">
            <div>
              <h1 className="text-4xl text-[#30525E] pt-20 font-sequel-sans font-extrabold text-center">
                Reset Password
              </h1>
            </div>

            <div>
              <h3 className="text-sm text-[red] pt-5 pb-5 font-sequel-sans-regular text-center">
                Must be 8 characters long, include one capital letter, <br />
                and one special character.
              </h3>
            </div>

            <div className="flex flex-col w-full  pb-2">
              <div className="flex flex-col text-sm text-[#52525C]">
                <div className="relative w-96">
                  <label
                    htmlFor="new-password"
                    className="pb-4 pt-4 block text-sm text-[#52525C]"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    className="border border-gray-400 rounded-lg px-3 py-1 w-full pr-10"
                    placeholder="Required"
                    value={newPassword}
                    onChange={(e) => setnewPassword(e.target.value)}
                  />
                </div>
                <label htmlFor="confirm-password" className="pb-4 pt-4">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type={showNewPassword ? "text" : "password"}
                  className="border border-gray-400 rounded-lg px-3 py-1 w-96"
                  placeholder="Required"
                  value={confirmNewPassword}
                  onChange={(e) => setconfirmNewPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-start pt-2">
                <IconButton
                  type="button"
                  onClick={() => setshowNewPassword(!showNewPassword)}
                  className="text-[#266472]"
                >
                  {showNewPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center pt-6">
              <button
                type="submit"
                className="px-6 py-3 bg-[#266472] text-white rounded-full hover:bg-[#1f505e] transition duration-300"
              >
                Reset Password
              </button>
            </div>
          </section>
        </form>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#266472] h-32"></footer>
    </div>
  );
};

export default ResetPasswordPage;
