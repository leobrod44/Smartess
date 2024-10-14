"use client";
import LandingNavbar from "@/components/LandingNavbar";
import { useState } from "react";
import Toast, { showToastError, showToastSuccess } from "../components/Toast";

const StartProjectPage = () => {
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [aditionalInfo, setAditionalInfo] = useState("");

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailPattern.test(email);
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^\d{10}$/; // Simple 10-digit phone number validation
    return phoneRegex.test(phoneNumber);
  };

  const handleStartProject = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lastName || !telephoneNumber) {
      showToastError("Please fill in all required fields");
      return;
    } else if (!validatePhoneNumber(telephoneNumber)) {
      showToastError("Please enter a valid 10-digit phone number");
      return;
    } else if (!validateEmail(email)) {
      showToastError("Please enter an valid email address");
      return;
    }
    showToastSuccess("Submission successful!");
  };

  return (
    <>
      <LandingNavbar />
      <Toast />
      <main>
        <section className="flex flex-col items-center justify-center">
          <div>
            <h1 className="text-4xl text-[#30525E] pt-20 font-sequel-sans font-extrabold">
              Start Your Project
            </h1>
          </div>

          <div>
            <h3 className="text-sm text-[#52525C] pt-10 pb-10 font-sequel-sans-regular">
              Please fill in required information
            </h3>
          </div>
        </section>

        <form className="flex flex-col items-center justify-center">
          <section className="flex flex-col justify-center sm:flex-row mb-10 font-sequel-sans-regular">
            {/* Left hand side card for user input */}
            <div className="flex flex-col text-sm text-[#52525C] pl-5 pr-5">
              <label className="pb-2 pt-2">Business name</label>
              <input
                type="businessName"
                className="border border-gray-400 rounded-lg  px-3 py-1 w-80"
                placeholder=""
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              <label className="pb-2 pt-2">Name</label>
              <input
                type="name"
                className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                placeholder="Required"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <label className="pb-2 pt-2">Last name</label>
              <input
                type="lastName"
                className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                placeholder="Required"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />

              <label className="pb-2 pt-2">Telephone Number</label>
              <input
                type="phoneNumber"
                className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                placeholder="Required"
                value={telephoneNumber}
                onChange={(e) => setTelephoneNumber(e.target.value)}
              />
            </div>

            {/* Right hand side card for user input */}
            <div className="flex flex-col font-light text-sm text-[#52525C]  pl-5 pr-5">
              <label className="pb-2 pt-2">Email</label>
              <input
                type="email"
                className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                placeholder="Required"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label className="pb-2 pt-2">Additional information</label>
              <textarea
                placeholder=""
                className="border border-gray-400 rounded-lg  px-2 py-1.5 resize-none h-40  w-80"
                name="AditionalInfo"
                rows={10}
                cols={20}
                value={aditionalInfo}
                onChange={(e) => setAditionalInfo(e.target.value)}
              />
            </div>
          </section>

          {/* Start your project button */}
          <section>
            <button
              className="font-sequel-sans text-sm text-white bg-[#254752] px-6 py-2.5 rounded-[20px] border-none text-base hover:bg-[#266472]"
              onClick={handleStartProject}
            >
              Start your Project
            </button>
          </section>
        </form>
      </main>
    </>
  );
};

export default StartProjectPage;
