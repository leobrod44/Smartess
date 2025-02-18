"use client";
import Image from "next/image";
import building_straight from "../../public/images/building_straight.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Toast, { showToastError, showToastSuccess } from "../components/Toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import LandingNavbar from "@/app/components/LandingNavbar";
import { registrationApi } from "@/api/registration/registration";

const RegistrationPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstname, setUserFirstName] = useState("");
  const [lastname, setUserLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = window.location.search.slice(1);

        if (!token) {
          setTokenError("No registration token found");
          showToastError("Invalid registration link");
          return;
        }

        const data = await registrationApi.verifyToken(token);
        setEmail(data.email);
      } catch (error) {
        setTokenError("Failed to verify registration token");
        showToastError("Failed to verify registration link");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async () => {
    if (!firstname || !lastname || !phone || !password || !confirmPassword) {
      showToastError("Please fill in all required fields");
      return;
    } else if (!validatePhoneNumber(phone)) {
      showToastError("Please enter a valid 10-digit phone number");
      return;
    } else if (password !== confirmPassword) {
      showToastError("Password and confirm password do not match");
      return;
    } else if (!passwordRegex.test(password)) {
      showToastError(
        "Password must be at least 8 characters long, include one capital letter, and one special character."
      );
      return;
    }

    try {
      const token = window.location.search.slice(1);

      if (!token) {
        showToastError("Invalid registration link");
        return;
      }

      await registrationApi.register({
        token,
        firstName: firstname,
        lastName: lastname,
        phone,
        password,
        email
      });

      showToastSuccess("Registered successfully!");
      setTimeout(() => {
        router.push("/sign-in");
      }, 1000);
    } catch (error) {
      showToastError(error instanceof Error ? error.message : "Server error. Please try again later.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <LandingNavbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#266472]"></div>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex flex-col h-screen">
        <LandingNavbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-red-500 text-center">
            <p className="text-xl font-semibold mb-2">Registration Error</p>
            <p>{tokenError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <LandingNavbar />
      <Toast />
      <div className="flex flex-1">
        <div className="flex flex-col items-center pt-[5%] w-full md:w-1/2 ">
          <div className="flex flex-col items-center text-center">
            <span className="font-sequel-sans-black text-[#30525e] text-[32px]">
              Welcome to Smartess!
              <br />
            </span>
            <span className="px-2 font-sequel-sans-light text-[#30525e] text-[24px] mb-5">
              Complete the registration process to access your dashboard
            </span>
            <h3 className="text-sm text-[#52525C] font-sequel-sans-regular mb-12">
              Please fill in all required fields (*)
            </h3>
          </div>

          <form
            role="form"
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-lg flex flex-col gap-3 px-6 md:px-3"
          >
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-col gap-1.5 flex w-full">
                <label
                  htmlFor="firstname"
                  className="px-1 text-[#266472] text-[15px] font-sequel-sans-regular"
                >
                  First name *
                </label>
                <input
                  id="firstname"
                  type="text"
                  placeholder="First name"
                  className="w-full self-stretch text-[#266472] text-l font-sequel-sans-regular rounded-lg focus:outline-none"
                  value={firstname}
                  onChange={(e) => setUserFirstName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Enter your first name"
                  aria-required="true"
                  aria-invalid={!firstname ? "true" : "false"}
                />
              </div>

              <div className="flex-col gap-1.5 flex w-full">
                <label
                  htmlFor="lastname"
                  className="px-1 text-[#266472] text-[15px] font-sequel-sans-regular"
                >
                  Last name *
                </label>
                <input
                  id="lastname"
                  type="text"
                  placeholder="Last name"
                  className="w-full self-stretch text-[#266472] text-l font-sequel-sans-regular rounded-lg focus:outline-none"
                  value={lastname}
                  onChange={(e) => setUserLastName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Enter your last name"
                  aria-required="true"
                  aria-invalid={!lastname ? "true" : "false"}
                />
              </div>
            </div>

            <div className="w-full max-w-lg flex-col gap-1.5 flex">
              <label
                htmlFor="email"
                className="px-1 text-[#266472] text-[15px] font-sequel-sans-regular"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                placeholder="Email address"
                disabled
                className="w-full rounded-lg text-[#266472] bg-[#266472]/20 text-l font-sequel-sans-regular focus:outline-none"
                aria-label="Email address"
                aria-disabled="true"
              />
            </div>

            <div className="w-full max-w-lg flex-col gap-1.5 flex">
              <label
                htmlFor="phone"
                className="px-1 text-[#266472] text-[15px] font-sequel-sans-regular"
              >
                Phone number *
              </label>
              <input
                id="phone"
                type="tel"
                name="tel"
                placeholder="Phone number"
                className="w-full rounded-lg text-[#266472] text-l font-sequel-sans-regular focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Enter your phone number"
                aria-required="true"
                aria-invalid={!validatePhoneNumber(phone) ? "true" : "false"}
              />
            </div>

            <div className="w-full flex-col gap-1.5 flex">
              <label
                htmlFor="password"
                className="px-1 text-[#266472] text-[15px] font-sequel-sans-regular"
              >
                Password *
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full rounded-lg text-[#266472] text-l font-sequel-sans-regular focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Enter your password"
                  aria-required="true"
                  aria-invalid={!passwordRegex.test(password) ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#266472] hover:text-[#1f505e] transition duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-6 w-6" />
                  ) : (
                    <EyeIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            <div className="w-full flex-col gap-1.5 flex">
              <label
                htmlFor="confirm-password"
                className="px-1 text-[#266472] text-[15px] font-sequel-sans-regular"
              >
                Confirm Password *
              </label>
              <div className="relative w-full">
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full self-stretch rounded-lg text-[#266472] text-l font-sequel-sans-regular focus:outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label="Confirm your password"
                  aria-required="true"
                  aria-invalid={password !== confirmPassword ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#266472] hover:text-[#1f505e] transition duration-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-6 w-6" />
                  ) : (
                    <EyeIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>

            <div className="w-full max-w-lg py-5 flex flex-col justify-center items-center gap-1.5">
              <button
                className="w-full px-[149px] py-[13px] bg-[#266472] rounded-xl shadow justify-center items-center gap-1.5 inline-flex hover:bg-[#1f505e] transition duration-300 text-center text-white text-lg font-sequel-sans-regular"
                onClick={handleSubmit}
                aria-label="Register"
              >
                Register
              </button>
            </div>
          </form>
        </div>

        <div className="w-full hidden md:block md:w-1/2">
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

export default RegistrationPage;