"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast, { showToastError, showToastSuccess } from "../components/Toast";
import LandingNavbar from "@/app/components/LandingNavbar";

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
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/; 
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
        const sendEmailResponse = await fetch(
          "http://localhost:3000/api/send-email",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              businessName,
              firstName,
              lastName,
              telephoneNumber,
              email,
              description,
            }),
          }
        );
        const sendEmailData = await sendEmailResponse.json();

        if (sendEmailResponse.ok) {
          showToastSuccess("Email sent successfully!");

          // store user email in database
          const storeEmailResponse = await fetch(
            "http://localhost:3000/api/store-start-project-data",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                businessName,
                firstName,
                lastName,
                telephoneNumber,
                email,
                description,
              }),
            }
          );
          const storeEmailData = await storeEmailResponse.json();

          if (storeEmailResponse.ok) {
            setTimeout(() => {
              router.push("/");
            }, 1000);
          } else {
            showToastError(
              storeEmailData.error || "Failed to store data. Please try again."
            );
          }
        } else {
          showToastError(
            sendEmailData.error || "Failed to send email. Please try again."
          );
        }
      } catch {
        showToastError("Server error. Please try again later.");
      }
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
                Start Your Project
              </h1>
            </div>

            <div>
              <h3 className="text-sm text-[#52525C] pt-10 pb-10 font-sequel-sans-regular">
                Please fill in required information
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
                  value={description}
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
