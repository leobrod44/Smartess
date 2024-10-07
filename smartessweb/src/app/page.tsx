import Image from "next/image";
import desktop from "../public/images/desktop.png";
import hub from "../public/images/hub.png";
import building from "../public/images/building.png";
import logo from "../public/images/logo.png";

export default function Home() {
  return (
    <>
      {/* Temporary Headerwith just the logo should be changed once our navbar is complete */}
      <header className="w-full py-4 bg-[#FFF] flex justify-left items-left px-8">
        <Image src={logo} alt="Logo" width={100} height={40} />
      </header>

      <main className="flex flex-col items-center justify-center space-y-16">
        <section className="text-center p-8">
          <h1 className="text-4xl font-bold">
            The Future of Smart Living is Here
          </h1>
          <p className="mt-4 text-lg">
            First all-in-one smart home platform for residential communities
          </p>
          <button className="mt-6 px-6 py-3 bg-[#266472] text-white rounded-full">
            Start Your Project
          </button>
        </section>

        <div className="relative w-full mt-24">
          <section className="relative w-full h-[300px] flex justify-between items-center px-8 mt-16">
            <div
              className="absolute inset-0 bg-[#489ba7] z-10 h-full"
              style={{ top: "85px" }}
            ></div>
            <div className="relative w-[200px] h-[400px] bg-[#E2E8F0] rounded-[30px] p-2 flex justify-center items-center mt-[-50px] z-20">
              <Image
                src={hub}
                alt="Resident Mobile App"
                className="rounded-[20px]"
                width={180}
                height={360}
              />
              <div className="absolute top-1 w-8 h-0.5 bg-gray-400 rounded-full"></div>
            </div>

            <div className="relative z-20 text-center md:text-left flex-1 px-4 mt-28 text-white">
              <h2 className="text-3xl font-bold">Resident Mobile App</h2>
              <p className="mt-5 text-lg">
                Control your smart devices as soon as you <br />
                move in and from anywhere in the world.
                <br />
                Track your energy usage and receive alerts <br />
                before disasters happen. Interact with <br />
                other tenants, book amenities, and make
                <br />
                service requests for your unit.
                <br />
              </p>
            </div>

            <div
              className="absolute right-0 top-[64%]  z-30"
              style={{ transform: "translateY(-50%)" }}
            >
              <Image
                src={building}
                alt="Building"
                layout="intrinsic"
                width={400}
                height={400}
                className="object-cover"
              />
            </div>
          </section>
        </div>
        <section
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center w-full px-8"
          style={{ marginTop: "200px", marginBottom: "100px" }}
        >
          <div className="order-2 md:order-1">
            <h2 className="text-2xl font-bold">Owner Web App</h2>
            <p className="mt-4 text-lg">
              A centralized system that aggregates information from an owner’s
              units into a unified web platform. This platform offers invaluable
              insights, like the energy usage of each unit, and helps structure
              management processes.
            </p>
          </div>
          <div className="flex justify-center order-1 md:order-2">
            <Image
              src={desktop}
              alt="Owner Web App"
              width={600}
              height={400}
              className="mx-auto"
            />
          </div>
        </section>
      </main>
    </>
  );
}
