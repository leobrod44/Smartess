"use client";
import Image from "next/image";
import building_straight from "../../public/images/building_straight.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast, { showToastError, showToastSuccess } from "../components/Toast";
import { signInApi } from "@/api/sign-in/sign-in";
import Logo from "../../public/images/logo.png";
import { IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useUserContext } from "@/context/UserProvider";
import { userApi } from "@/api/components/DashboardNavbar";

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { setUserEmail, setUserFirstName, setUserLastName, setUserType } =
    useUserContext();

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
      setUserEmail(user.email);
      setUserFirstName(user.first_name);
      setUserLastName(user.last_name);
      setUserType(user.type);
      showToastSuccess("Login successful!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
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
    <div className="flex h-screen bg-white">
      <Toast />

      {/* Left side content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-5">
        <div className="w-full max-w-lg h-auto mb-10 text-center md:text-left">
          <span className="font-sequel-sans-black text-[#30525e] text-[32px]">
            Smart Living at Scale
            <br />
          </span>
          <span className="font-sequel-sans-light text-[#30525e] text-[24px]">
            Welcome back to your Smartess account
          </span>
        </div>

        {/* Email field */}
        <div className="h-[102px] w-full max-w-lg pr-0.5 pt- pb-5 flex-col justify-center items-center gap-2.5 flex">
          <div className="self-stretch px-2.5 justify-start items-center gap-2.5 inline-flex">
            <div className="text-[#266472] text-[20px] font-sequel-sans-regular">
              Email
            </div>
          </div>
          <div className="self-stretch">
            <input
              type="email"
              placeholder="Your email"
              className="w-full text-[#266472] text-xl font-sequel-sans-regular self-stretch px-5 py-3 bg-[#898888]/20 rounded-[20px] items-center gap-2.5 inline-flex focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Password field */}
        <div className="h-[102px] w-full max-w-lg pr-0.5 pt-10 flex-col justify-center items-center gap-2.5 flex">
          <div className="self-stretch px-2.5 justify-start items-center gap-2.5 inline-flex">
            <div className="text-[#266472] text-[20px] font-sequel-sans-regular">
              Password
            </div>
          </div>
          <div className="relative self-stretch">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Your Password"
              className="w-full self-stretch px-5 py-3 bg-[#898888]/20 rounded-[20px] text-[#266472] text-xl font-sequel-sans-regular focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <IconButton
              type="button"
              onClick={() => setShowPassword(!showPassword)} // Toggle visibility
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#266472]"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </div>
        </div>

        {/* Forgot password link */}
        <div className="max-w-lg pl-[266px] md:pl-0 justify-end items-center inline-flex pt-10 w-full">
          <a
            href="/forgot-password/path"
            className="text-center text-[#266472]/40 text-xl font-light font-sequel-sans-light underline hover:text-[#30525e] custom-transition-length-1s whitespace-nowrap"
          >
            Forgot your password?
          </a>
        </div>

        {/* Login button */}
        <div className="h-[102px] w-full max-w-lg py-5 flex flex-col justify-center items-center gap-2.5">
          <button
            className="self-stretch px-[149px] py-[13px] bg-[#30525e] opacity-40 rounded-[20px] shadow justify-center items-center gap-2.5 inline-flex transition-opacity hover:opacity-100 custom-transition-length-1s text-center text-white text-lg font-sequel-sans-regular"
            onClick={handleLogin}
          >
            Login
          </button>
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
  );
};

export default SignInPage;
