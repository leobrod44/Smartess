import Image from 'next/image';
import building_straight from '../../public/images/building_straight.png';

const SignInPage = () => {
  return (
    <div className="flex h-screen bg-white">

    {/* Left side content */}
    <div className=" w-full md:w-1/2 flex flex-col justify-center items-center p-5">

      <div className="w-full max-w-lg h-auto mb-10 text-center md:text-left">
        <span className="font-sequel-sans-black text-[#30525e] text-[32px]">
          Smart Living at Scale
          <br />
        </span>
        <span className="font-sequel-sans-light text-[#30525e] text-[24px]">
          Welcome back to your Smartess account
        </span>
      </div>

      {/* Email field */}
      <div className="h-[102px] w-full max-w-lg pr-0.5 pt- pb-5 flex-col justify-center items-center gap-2.5 flex">
        <div className="self-stretch px-2.5  justify-start items-center gap-2.5 inline-flex">
          <div className="text-[#266472] text-[20px] font-sequel-sans-regular">Email</div>
        </div>
        <div className="self-stretch px-5 py-3 bg-[#898888]/20 rounded-[20px] justify-start items-center gap-2.5 inline-flex">
          <div className="w-[148px] text-[#266472]/20 text-xl font-sequel-sans-regular">Your email</div>
        </div>
      </div>

      {/* Password field */}
      <div className="h-[102px]  w-full max-w-lg pr-0.5 pt-10  flex-col justify-center items-center gap-2.5 flex">
        <div className="self-stretch px-2.5 justify-start items-center gap-2.5 inline-flex">
          <div className="text-[#266472] text-[20px] font-sequel-sans-regular">Password</div>
        </div>
        <div className="self-stretch px-5 py-3 bg-[#898888]/20 rounded-[20px] justify-start items-center gap-2.5 inline-flex">
          <div className="text-[#266472]/20 text-xl font-sequel-sans-regular">Your Password</div>
        </div>
      </div>

      {/* Forgot password link */}
      <div className="pl-[266px] justify-end items-center inline-flex pt-10 ">
        <div className="text-center text-[#266472]/40 text-xl font-light font-sequel-sans-light underline hover:text-[#30525e] custom-transition-length-1s">
          Forgot your password?
        </div>
      </div>

      {/* Login button */}
      <div className='h-[102px] w-full max-w-lg py-5 flex flex-col justify-center items-center gap-2.5 flex '>
        <div className="self-stretch px-[149px] py-[13px] bg-[#30525e] opacity-40 rounded-[20px] shadow justify-center items-center gap-2.5 inline-flex transition-opacity hover:opacity-100 custom-transition-length-1s ">
          <div className="text-center text-white text-lg font-sequel-sans-regular">Login</div>
        </div>
      </div>
    </div>

    {/* Right side with image */}
    <div className="hidden md:block md:w-1/2">
      <Image
        className="w-full h-full object-cover"
        src={building_straight}
        alt="Building"
        width={835}
        height={1117}
      />
    </div>
  </div>
    
  );
};

export default SignInPage;
