"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/public/images/logo.png";
import Toast, { showToastError, showToastSuccess } from "../components/Toast";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconButton } from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
import { resetPasswordApi } from "@/api/resetPassword/page"; // Update this path as needed

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [token, setToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const searchParams = useSearchParams();

  // Verify token when component mounts
  useEffect(() => {
    // Get the raw query string without the '?'
    const rawQuery = window.location.search.substring(1);
    
    let tokenFromUrl = searchParams.get("token");
    
    // If there's no token parameter but there is a query string,
    // use the entire query string as the token
    if (!tokenFromUrl && rawQuery) {
      tokenFromUrl = rawQuery;
    }
    
    if (!tokenFromUrl) {
      setIsLoading(false);
      setIsValid(false);
      setErrorMessage("Invalid reset link. Token is missing.");
      return;
    }

    setToken(tokenFromUrl);
    verifyToken(tokenFromUrl);
  }, [searchParams]);

  const verifyToken = async (tokenValue: string) => {
    try {
      setIsLoading(true);
      const data = await resetPasswordApi.verifyToken(tokenValue);
      setUserEmail(data.email);
      setIsValid(true);
    } catch (error) {
      console.error("Token verification error:", error);
      setIsValid(false);
      setErrorMessage(error instanceof Error 
        ? error.message 
        : "Failed to verify reset link");
    } finally {
      setIsLoading(false);
    }
  };

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

    try {
      setIsLoading(true);
      const data = await resetPasswordApi.updatePassword({
        token,
        email: userEmail,
        password: newPassword,
      });

      showToastSuccess(data.message || "Password reset successful!");
      // Clear form after successful reset
      setNewPassword("");
      setConfirmNewPassword("");
      setIsValid(false);
      setErrorMessage("Password has been reset successfully. You can close this page.");
    } catch (error) {
      console.error("Password reset error:", error);
      showToastError(
        error instanceof Error 
          ? error.message 
          : "An error occurred while resetting your password"
      );
    } finally {
      setIsLoading(false);
    }
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

      <div className="flex-grow flex items-center justify-center">
        {isLoading ? (
          <div className="text-center">
            <p className="text-lg text-gray-600">Verifying your reset link...</p>
            {/* You can add a loading spinner here if desired */}
          </div>
        ) : isValid ? (
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

              <div className="flex flex-col w-full pb-2">
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
                      onChange={(e) => setNewPassword(e.target.value)}
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
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-start pt-2">
                  <IconButton
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[#266472]"
                  >
                    {showNewPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center pt-6">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#266472] text-white rounded-full hover:bg-[#1f505e] transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Reset Password"}
                </button>
              </div>
            </section>
          </form>
        ) : (
          <div className="text-center max-w-lg p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl text-[#30525E] font-bold mb-4">
              {errorMessage.includes("successfully") ? "Success" : "Invalid Reset Link"}
            </h2>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <Link 
              href="/" 
              className="px-6 py-2 bg-[#266472] text-white rounded-full hover:bg-[#1f505e] transition duration-300"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#266472] h-32"></footer>
    </div>
  );
};

export default ResetPasswordPage;