import Image from "next/image";
import desktop from "../public/images/desktop.png";
import hub from "../public/images/hub.png";
import building from "../public/images/building.png";
import logo from "../public/images/logo.png";
import Link from "next/link";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {/* Temporary Header with just the logo - replace it with actual */}
      <header className="w-full py-4 bg-[#FFF] flex justify-left md:justify-left items-center px-4 md:px-8">
        <Link href="/">
          <Image src={logo} alt="Smartess Logo" width={100} height={40} />
        </Link>
      </header>

      <main className="flex-col items-left justify-left space-y-16 pt-10">
        <section className="text-center p-4 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            The Future of Smart Living is Here
          </h1>
          <p className="mt-4 text-base md:text-lg">
            First all-in-one smart home platform for residential communities
          </p>
          <Link href="/start-project">
            <button className="mt-6 px-6 py-3 bg-[#266472] text-white rounded-full">
              Start Your Project
            </button>
          </Link>
        </section>

        <div className="relative w-full">
          <section className="relative w-full h-[300px] flex flex-col md:flex-row justify-between items-center px-4 md:px-8 mt-16">
            <div
              className="absolute inset-0 bg-[#489ba7] z-10 h-full"
              style={{ top: "85px" }}
            ></div>
            <div className=" hidden md:block mx-auto relative w-[200px] h-[300px] md:w-[200px] md:h-[400px] bg-[#E2E8F0] rounded-[30px] p-2 flex justify-center items-center mt-[-50px] z-20">
              <Image
                src={hub}
                alt="Resident Mobile App"
                className="hidden md:block mx-auto rounded-[20px]"
                width={180}
                height={360}
              />
            </div>

            <div className="relative z-20 text-center md:text-left flex-1 px-4 mt-10 text-white pt-20 ">
              <h2 className="text-xl md:text-2xl font-bold text-[#FFF]">
                Resident Mobile app{" "}
              </h2>
              <p className="mt-5 text-sm md:text-lg z-40 ">
                Control your smart devices as soon as you <br />
                move in and from anywhere in the world.
                <br />
                Track your energy usage and receive alerts <br />
                before disasters happen. Interact with <br />
                other tenants, book amenities, and make
                <br />
                service requests for your unit.
              </p>
            </div>

            <div className="hidden lg:flex justify-end pt-20 lg:pt-20 z-30 w-full absolute right-0">
              <Image
                src={building}
                alt="Building"
                layout="intrinsic"
                width={400}
                height={400}
              />
            </div>
          </section>
        </div>

        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-1 items-center w-full px-2 md:px-10 "
          style={{ marginTop: "150px", marginBottom: "50px" }}
        >
          {/* Text section: On the left for larger screens, stacked on smaller screens */}
          <div className="order-2 md:order-1">
            <h2 className="text-xl md:text-2xl font-bold text-[#266472]">
              Owner Web App
            </h2>
            <p className="mt-4 text-base md:text-lg text-[#266472]">
              A centralized system that aggregates information from an owner’s
              units into a unified web platform. This platform offers invaluable
              insights, like the energy usage of each unit, and helps structure
              management processes.
            </p>
          </div>

          {/* Laptop mockup  */}
          <div className="flex justify-center md:justify-end order-1 md:order-2">
            <div className="relative w-[300px] h-[200px] md:w-[280px] md:h-[180px] bg-[#E2E8F0] rounded-[10px] p-3  flex justify-center items-center z-20 order-1 md:order-2">
              <Image
                src={desktop}
                alt="Owner Web App"
                width={280}
                height={180}
                layout="intrinsic"
              />
              {/* laptop bottom */}
              <div className="absolute bottom-[-10px] w-[100%] h-[10px] bg-gray-300 rounded-b-[10px] shadow-lg"></div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
