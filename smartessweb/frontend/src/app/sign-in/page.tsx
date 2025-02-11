"use client";
import Image from "next/image";
import building_straight from "../../public/images/building_straight.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast, { showToastError } from "../components/Toast";
import { signInApi } from "@/api/sign-in/sign-in";
import Logo from "../../public/images/logo.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import { useUserContext } from "@/context/UserProvider";
import { userApi } from "@/api/components/DashboardNavbar";
import ForgotPasswordModal from "../components/ForgotPassword/ForgotPasswordModal";
import LandingNavbar from "@/app/components/LandingNavbar";

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const handleOpenModal = () => {
    setForgotPasswordOpen(true);
  };

  const handleCloseModal = () => {
    setForgotPasswordOpen(false);
  };

  const handlePassworReset = () => {
    setForgotPasswordOpen(false);
  };

  const {
    setUserId,
    setUserEmail,
    setUserFirstName,
    setUserLastName,
    setUserType,
  } = useUserContext();

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleLogin(); // Trigger login on Enter key press
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 576);
    };

    handleResize(); // Run initially
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = async () => {
    // Form validation
    if (!email || !password) {
      showToastError("Please fill in all required fields");
      return;
    }

    if (!validateEmail(email)) {
      showToastError("Please enter a valid email address");
      return;
    }

    // API call
    try {
      const data = await signInApi.signIn({ email, password });
      localStorage.setItem("token", data.token);
      const user = await userApi.getUserInfo(data.token);
      setUserId(user.user_id);
      setUserEmail(user.email);
      setUserFirstName(user.first_name);
      setUserLastName(user.last_name);
      setUserType(user.type);
      setTimeout(() => {
        router.push("/dashboard");
      });
    } catch (error) {
      showToastError(
        error instanceof Error
          ? error.message
          : "Server error. Please try again later."
      );
    }
  };

  if (isSmallScreen) {
    return (
      <div className="flex items-center justify-center h-screen bg-white text-center">
        <div className="flex flex-col items-center">
          <Image
            className="w-[300px] mb-4"
            src={Logo}
            alt=" Smartess Company Logo"
          />
          <p className="text-[#30525e] text-2xl font-sequel-sans-regular p-3">
            This website is not available on mobile devices. Please use a
            computer to sign in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <LandingNavbar />
      <Toast />
      <div className="flex flex-1">
        {/* Left side content */}
        <div className="flex flex-col items-center pt-[5%] w-full md:w-1/2 ">
          <div className="flex flex-col items-center text-center">
            <span className=" font-sequel-sans-black text-[#30525e] text-[32px]">
              Smart Living at Scale
              <br />
            </span>
            <span className=" px-2 font-sequel-sans-light text-[#30525e] text-[24px] mb-5">
              Welcome back to your Smartess account
            </span>
            <h3 className="text-sm text-[#52525C]  font-sequel-sans-regular mb-12">
              Please fill in all required fields (*)
            </h3>
          </div>

          <div className="w-full max-w-lg flex flex-col gap-3  px-6 md:px-3">
            <div className="w-full max-w-lg flex-col  gap-1.5 flex">
              <label className=" px-1 text-[#266472] text-[15px] font-sequel-sans-regular">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                className="w-full  self-stretch text-[#266472] text-l font-sequel-sans-regular  rounded-lg focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className=" w-full  flex-col gap-1.5 flex">
              <label className=" px-1 text-[#266472] text-[15px] font-sequel-sans-regular">
                Password *
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full rounded-lg text-[#266472] text-l font-sequel-sans-regular focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)} // Toggle visibility
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#266472] hover:text-[#1f505e] transition duration-300"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-6 w-6" />
                  ) : (
                    <EyeIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="max-w-lg pl-[266px] md:pl-0 justify-end items-center inline-flex pt-5 w-full">
              <a
                className="text-center text-[#266472]/40 text-xl font-light font-sequel-sans-light underline hover:text-[#30525e] custom-transition-length-1s whitespace-nowrap cursor-pointer"
                onClick={handleOpenModal}
              >
                Forgot your password?
              </a>
              {/* Forgot Password Modal Component */}
              <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={handleCloseModal}
                onReset={handlePassworReset}
              />
            </div>

            <div className=" w-full max-w-lg py-5 flex flex-col justify-center items-center  gap-1.5">
              <button
                className="w-full px-[149px] py-[13px] bg-[#266472] rounded-xl shadow justify-center items-center  gap-1.5 inline-flex hover:bg-[#1f505e] transition duration-300 text-center text-white text-lg font-sequel-sans-regular"
                onClick={handleLogin}
              >
                Login
              </button>
            </div>
          </div>
        </div>
        {/* Right side with image */}
        <div className="hidden md:block md:w-1/2">
          <Image
            className="w-full h-full object-cover"
            src={building_straight}
            alt="Building"
            width={835}
            height={1117}
          />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
