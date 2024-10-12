"use client"
import Image from 'next/image';
import building_straight from '../../public/images/building_straight.png';
import { useState } from 'react';
import Toast, { showToastError, showToastSuccess } from '../components/Toast';

const SignInPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex
    return emailPattern.test(email);
  };

  const handleLogin = () => {
    if (!email || !password) {
      showToastError('Please fill in all required fields');
    }
    else if (!validateEmail(email)) {
      showToastError('Please enter a valid email address');
      return;
    } 
    else
    {
      // Proceed with login logic
      showToastSuccess('Login successful!');
    }
  };


  return (
    <div className="flex h-screen bg-white">
    <Toast />

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
        <div className="self-stretch">
          <input
          type= "email"
          placeholder='Your email'
          className="w-full text-[#266472] text-xl font-sequel-sans-regular self-stretch px-5 py-3 bg-[#898888]/20 rounded-[20px] items-center gap-2.5 inline-flex focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      {/* Password field */}
      <div className="h-[102px]  w-full max-w-lg pr-0.5 pt-10  flex-col justify-center items-center gap-2.5 flex">
        <div className="self-stretch px-2.5 justify-start items-center gap-2.5 inline-flex">
          <div className="text-[#266472] text-[20px] font-sequel-sans-regular">Password</div>
        </div>
        <div className="self-stretch">
        <input
           type="password"
           placeholder="Your Password"
           className=" w-full self-stretch px-5 py-3 bg-[#898888]/20 rounded-[20px] text-[#266472] text-xl font-sequel-sans-regular focus:outline-none"
           value={password}
           onChange={(e) => setPassword(e.target.value)}
         />
        </div>
      </div>

      {/* Forgot password link */}
      <div className="pl-[266px] justify-end items-center inline-flex pt-10 ">
        <a 
        href="/forgot-password/path"
        className="text-center text-[#266472]/40 text-xl font-light font-sequel-sans-light underline hover:text-[#30525e] custom-transition-length-1s">
          Forgot your password?
        </a>
      </div>

      {/* Login button */}
      <div className='h-[102px] w-full max-w-lg py-5 flex flex-col justify-center items-center gap-2.5 flex '>
        <button 
        className=" self-stretch px-[149px] py-[13px] bg-[#30525e] opacity-40 rounded-[20px] shadow justify-center items-center gap-2.5 inline-flex transition-opacity hover:opacity-100 custom-transition-length-1s text-center text-white text-lg font-sequel-sans-regular"
        onClick={handleLogin} 
        >
          Login
        </button>
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
