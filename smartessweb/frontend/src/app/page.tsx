import Image from "next/image";
import desktop from "../public/images/desktop.png";
import hub from "../public/images/hub.png";
import building from "../public/images/building.png";
import Link from "next/link";
import Head from "next/head";
import LandingNavbar from "@/app/components/LandingNavbar";

export default function Home() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <LandingNavbar />
      <main className="flex-col items-left justify-left space-y-16 pt-10">
        <section className="text-center p-4 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            The Future of Smart Living is Here
          </h1>
          <p className="mt-4 text-base md:text-lg">
            First all-in-one smart home platform for residential communities
          </p>
          <Link href="/start-project">
            <button className="mt-6 px-6 py-3 bg-[#266472] text-white rounded-full hover:bg-[#1f505e] transition duration-300">
              Start Your Project
            </button>
          </Link>
        </section>

        <div className="relative w-full">
          <section className="relative w-full h-[500px] flex flex-col md:flex-row justify-between items-center px-4 md:px-8 mt-16">
            <div
              className="absolute inset-0 bg-[#489ba7] z-10 h-full"
              style={{ top: "85px" }}
            ></div>

            <div className="hidden md:hidden lg:flex justify-end pt-20 lg:pt-2 lg:pb-[110px] z-30 w-full absolute right-0">
              <Image
                src={building}
                alt="Building"
                layout="intrinsic"
                width={800}
              />
            </div>
          </section>
        </div>

        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center w-full px-4 md:px-10 pb-10 pt-10"
          style={{ marginTop: "150px", marginBottom: "50px" }}
        >
          {/* Left Section: Management Web App */}
          <div className="bg-[#F7FAFC] p-10 rounded-lg shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-[#266472] pb-5">
              Management Web App
            </h2>
            <p className="text-base md:text-lg text-[#266472] pb-6">
              A centralized system that aggregates information from an owner’s
              units into a unified web platform. This platform offers invaluable
              insights, like the energy usage of each unit, and helps structure
              management processes.
            </p>
            <div className="hidden md:hidden lg:flex justify-center">
              <div className="relative w-[400px] h-[300px] md:w-[450px] md:h-[320px] bg-[#E2E8F0] rounded-[10px] p-6 flex justify-center items-center">
                <Image
                  src={desktop}
                  alt="Owner Web App"
                  width={450}
                  height={350}
                  layout="intrinsic"
                />
                {/* Laptop bottom */}
                <div className="absolute bottom-[-12px] w-[100%] h-[12px] bg-gray-300 rounded-b-[10px] shadow-lg"></div>
              </div>
            </div>
          </div>

          {/* Right Section: Resident Mobile App */}
          <div className="bg-[#F7FAFC] p-8 rounded-lg shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-[#266472] pb-5">
              Resident Mobile App
            </h2>
            <p className="text-base md:text-lg text-[#266472] pb-6">
              Control your smart devices as soon as you move in and from
              anywhere in the world. Track your energy usage and receive alerts
              before disasters happen. Interact with other tenants, book
              amenities, and make service requests for your unit.
            </p>
            <div className="hidden md:hidden lg:flex justify-center">
              <div className="relative w-[200px] h-[300px] md:w-[200px] md:h-[400px] bg-[#E2E8F0] rounded-[30px] p-2 flex justify-center items-center">
                <Image
                  src={hub}
                  alt="Resident Mobile App"
                  className="rounded-[20px]"
                  width={180}
                  height={360}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
