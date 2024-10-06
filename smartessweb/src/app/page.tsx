import Image from 'next/image';


export default function Home() {
    return (
      <main className="flex flex-col items-center justify-center">
       
        <section className="text-center p-8">
          <h1 className="text-4xl font-bold">The Future of Smart Living is Here</h1>
          <p className="mt-4 text-lg">First all-in-one smart home platform for residential communities</p>
          <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full">
            Start Your Project
          </button>
        </section>

      {/* Resident Mobile App Section */}
      <section className="flex flex-col md:flex-row items-center mt-16">
        <div className="md:w-1/2 p-4">
          <h2 className="text-2xl font-bold">Resident Mobile App</h2>
          <p className="mt-4 text-lg">
            Control your smart devices as soon as you move in and from anywhere in the world. 
            Track your energy usage and receive alerts before disasters happen. Interact with 
            other tenants, book amenities, and make service requests for your unit.
          </p>
        </div>
        <div className="md:w-1/2">
          <Image
            src="/images/hub.png" 
            alt="Resident Mobile App"
            width={400}
            height={600}
            className="mx-auto"
          />
        </div>
      </section>

      {/* Owner Web App Section */}
      <section className="flex flex-col md:flex-row items-center mt-16">
        <div className="md:w-1/2 p-4">
          <Image
            src="/images/desktop.png" 
            alt="Owner Web App"
            width={600}
            height={400}
            className="mx-auto"
          />
        </div>
        <div className="md:w-1/2 p-4">
          <h2 className="text-2xl font-bold">Owner Web App</h2>
          <p className="mt-4 text-lg">
            A centralized system that aggregates information from an owner’s units into a unified web platform.
            This platform offers invaluable insights, like the energy usage of each unit, and helps structure management processes.
          </p>
        </div>
      </section>
    </main>
  );
}