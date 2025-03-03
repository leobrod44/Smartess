"use client";

import LandingNavbar from "@/app/components/LandingNavbar";
import Image from "next/image";
import residential from "../../public/images/residential.png";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import dashboard from "../../public/images/smartessdash.png";
import mobile from "../../public/images/hub.png";
const products = [
  {
    title: "Centralized Management Web Application",
    description:
      "A centralized management platform with visual dashboards, user management access, alert tracking, ticket management, and more.",
    image: dashboard,
  },
  {
    title: "Resident Mobile Application",
    description:
      "Smartly control your home from your phone. Manage your home devices, control your smart devices, receive alerts, and more.",
    image: mobile,
  },
];

const AboutPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar />

      <div className="relative h-[50vh] w-full">
        <Image
          src={residential}
          alt="Modern Residential Buildings"
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 text-center p-4">
          <h1 className="text-white text-3xl font-sequel-sans-black">
            Smart Living at Scale
          </h1>
          <p className="text-white text-xl font-sequel-sans-regular mt-4">
            Smartess is an all-in-one smart home
          </p>
          <p className="text-white text-xl font-sequel-sans-regular">
            platform made for residential
          </p>
          <p className="text-white text-xl font-sequel-sans-regular">
            communities, implementable at scale
          </p>
        </div>
      </div>

      {/* Mission & Vision Section */}
      <div className="flex flex-row items-start justify-center py-20 text-left px-8 gap-32">
        {/* Mission Section */}
        <div className="flex flex-col max-w-lg">
          <h1 className="text-[#30525e] text-4xl font-sequel-sans-black">
            Mission
          </h1>
          <div className="w-20 h-1 bg-[#30525e] mt-2"></div>
          <p className="text-2xl font-sequel-sans-regular mt-6">
            <span className="text-4xl font-sequel-sans-black text-[#30525e]">
              “
            </span>
            We believe in the power of technology to enhance everyday life. That
            is why we make it our mission to make smart home technology
            accessible at scale, and to be long-term partners for both residents
            and owners in smarter living.
            <span className="text-4xl font-sequel-sans-black text-[#30525e]">
              ”
            </span>
          </p>
        </div>

        {/* Vision Section */}
        <div className="flex flex-col max-w-lg">
          <h1 className="text-[#30525e] text-4xl font-sequel-sans-black">
            Vision
          </h1>
          <div className="w-20 h-1 bg-[#30525e] mt-2"></div>
          <p className="text-2xl font-sequel-sans-regular mt-6">
            <span className="text-4xl font-sequel-sans-black text-[#30525e]">
              “
            </span>
            The widespread adoption of smart home technology promises to
            fundamentally transform how individuals interact with their living
            spaces. Envisioning a future where these innovations serve as the
            cornerstone for more intelligent communities and cities, we aim to
            pave the way toward a globally smarter society.
            <span className="text-4xl font-sequel-sans-black text-[#30525e]">
              ”
            </span>
          </p>
        </div>
      </div>

      {/* Swipable Carousel */}
      <div className="relative w-full flex flex-col items-center py-16 px-8">
        <h1 className="text-[#30525e] text-4xl font-sequel-sans-black mb-4">
          Solutions
        </h1>
        <div className="w-20 h-1 bg-[#30525e] mb-6"></div>

        <div className="relative w-full md:w-[1200px] overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out transform"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {products.map((product, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full text-center p-6 bg-gray-100 rounded-lg"
              >
                <Image
                  src={product.image}
                  alt={product.title}
                  width={600}
                  height={300}
                  className="mx-auto h-[250px] max-h-[300px] object-contain"
                />
                <h2 className="text-2xl text-[#30525e] font-sequel-sans-black mt-4">
                  {product.title}
                </h2>
                <p className="text-lg text-[#4b7d8d]  font-sequel-sans-regular mt-2">
                  {product.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <button
          className="absolute top-1/2 transform -translate-y-1/2 left-10 cursor-pointer"
          onClick={prevSlide}
        >
          <FaChevronLeft size={30} className="text-[#30525e]" />
        </button>
        <button
          className="absolute top-1/2 transform -translate-y-1/2 right-10 cursor-pointer"
          onClick={nextSlide}
        >
          <FaChevronRight size={30} className="text-[#30525e]" />
        </button>
      </div>
    </div>
  );
};

export default AboutPage;
