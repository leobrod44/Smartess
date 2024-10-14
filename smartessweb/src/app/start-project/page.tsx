import LandingNavbar from "@/components/LandingNavbar";

const StartProjectPage = () => {
  return (
    <>
      <LandingNavbar />
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
              />
              <label className="pb-2 pt-2">Name</label>
              <input
                type="name"
                className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                placeholder=""
              />

              <label className="pb-2 pt-2">Lastname</label>
              <input
                type="lastName"
                className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                placeholder=""
              />

              <label className="pb-2 pt-2">Telephone Number</label>
              <input
                type="phoneNumber"
                className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                placeholder=""
              />
            </div>

            {/* Right hand side card for user input */}
            <div className="flex flex-col font-light text-sm text-[#52525C]  pl-5 pr-5">
              <label className="pb-2 pt-2">Email</label>
              <input
                type="email"
                className="border border-gray-400 rounded-lg  px-3 py-1  w-80"
                placeholder=""
              />
              <label className="pb-2 pt-2">Aditionnal information</label>
              <textarea
                placeholder=""
                className="border border-gray-400 rounded-lg  px-2 py-1.5 resize-none h-40  w-80"
                name="AditionalInfo"
                rows={10}
                cols={20}
              />
            </div>
          </section>

          {/* Start your project button */}
          <section>
            <button className="font-sequel-sans text-sm text-white bg-[#254752] px-6 py-2.5 rounded-[20px] border-none text-base hover:bg-[#266472] hover:text-whit">
              Start your Project
            </button>
          </section>
        </form>
      </main>
    </>
  );
};

export default StartProjectPage;
