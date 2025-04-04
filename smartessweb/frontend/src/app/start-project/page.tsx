"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast, { showToastError, showToastSuccess } from "../components/Toast";
import LandingNavbar from "@/app/components/LandingNavbar";
import Logo from "../../public/images/logo.png";
import Image from "next/image";
import { startProjectApi } from "@/api/start-project/start-project";

const StartProjectPage = () => {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [telephoneNumber, setTelephoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firstName || !lastName || !telephoneNumber || !email) {
      showToastError("Please fill in all required fields");
      return;
    } else if (!validatePhoneNumber(telephoneNumber)) {
      showToastError("Please enter a valid 10-digit phone number");
      return;
    } else if (!validateEmail(email)) {
      showToastError("Please enter a valid email address");
      return;
    } else {
      try {
        // send email response to user
        await startProjectApi.sendEmail(businessName, firstName, lastName, telephoneNumber, email, description);
        // store user email in database
        await startProjectApi.storeStartProjectData(businessName, firstName, lastName, telephoneNumber, email, description);
      } catch {
        showToastError("Server error. Please try again later.");
      }
      setTimeout(() => {
        router.push("/");
      }, 1000);
      showToastSuccess("Email sent successfully!");
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <LandingNavbar />
        <Toast />
        <main className="flex-grow">
          <section className="flex flex-col items-center justify-center">
            <div>
              <h1 className="text-4xl text-[#30525E] pt-20 font-sequel-sans font-extrabold">
                Start A Project With Us
              </h1>
            </div>

            <h4 className="pt-3 font-sequel-sans text-[#266472]">
              {" "}
              Want to implement the{" "}
              <Image
                src={Logo}
                alt="Smartess Logo"
                width={100}
                height={100}
                className="inline ml-1"
              />
              system in your organization?{" "}
            </h4>

            <h5 className=" font-sequel-sans text-[#266472]">
              {" "}
              Fill out your details and we will get back to you as soon as
              possible.
            </h5>
            <div>
              <h3 className="text-sm text-[#52525C] pt-10 pb-4 font-sequel-sans-regular">
                Please fill in all required fields
              </h3>
            </div>
          </section>

          <form
            className="flex flex-col items-center justify-center"
            onSubmit={handleSubmit}
          >
            <section className="flex flex-col justify-center md:flex-row mb-10 font-sequel-sans-regular">
              {/* Left hand side card for user input */}
              <div className="flex flex-col text-sm text-[#52525C] pr-2 pl-2 w-full md:w-1/2">
                <label className="pb-2 pt-2">Business name</label>
                <input
                  type="text"
                  className="border border-gray-400 rounded-lg  px-3 py-1 w-80"
                  placeholder="Required"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                <label className="pb-2 pt-2">Name</label>
                <input
                  type="text"
                  className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                  placeholder="Required"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />

                <label className="pb-2 pt-2">Last name</label>
                <input
                  type="text"
                  className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                  placeholder="Required"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />

                <label className="pb-2 pt-2">Telephone Number</label>
                <input
                  type="tel"
                  className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                  placeholder="Required : xxx-xxx-xxxx"
                  value={telephoneNumber}
                  onChange={(e) => setTelephoneNumber(e.target.value)}
                />
                <label className="pb-2 pt-2">Email</label>
                <input
                  type="email"
                  className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                  placeholder="Required"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Right hand side card for user input */}
                <div className="flex flex-col font-light text-sm text-[#52525C] pr-2 pl-2 w-full md:w-1/2">
                <label className="pb-2 pt-2">Additional information</label>
                <textarea
                  placeholder=""
                  className="border border-gray-400 rounded-lg  px-2 py-1.5 resize-none h-full  w-80"
                  name="Description"
                  rows={10}
                  cols={20}
                  value={description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                />
                </div>
            </section>

            {/* Start your project button */}
            <section>
              <div className="pb-10">
                <button
                  type="submit"
                  className="mt-6 px-6 py-3 bg-[#266472] text-white rounded-full hover:bg-[#1f505e] transition duration-300"
                >
                  Start Your Project
                </button>
              </div>
            </section>
          </form>
        </main>
        <footer className="w-full bg-[#266472] h-32"></footer>
      </div>
    </>
  );
};

export default StartProjectPage;
