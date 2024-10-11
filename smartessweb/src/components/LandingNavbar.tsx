'use client';

import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/public/images/logo.png';

const LandingNavbar = () => {
  return (
    <Disclosure
      as='nav'
      className='bg-white shadow'
    >
      {({ open }) => (
        <>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
            <div className='flex h-16 justify-between items-center'>
              <div className='flex'>
                <Link href='/'>
                  <Image
                    className='h-8 w-auto'
                    src={logo}
                    alt='Logo'
                    width={32}
                    height={32}
                  />
                </Link>
                <div className='hidden sm:flex sm:space-x-8 ml-10'>
                  <Link
                    href='/'
                    className='text-[#266472] hover:text-gray-700 px-3 py-2 text-sm font-medium'
                  >
                    Home
                  </Link>
                  <Link
                    href='/about'
                    className='text-[#266472] hover:text-gray-700 px-3 py-2 text-sm font-medium'
                  >
                    About Us
                  </Link>
                  <Link
                    href='/start-project'
                    className='text-[#266472] hover:text-gray-700 px-3 py-2 text-sm font-medium'
                  >
                    Start a Project
                  </Link>
                </div>
              </div>
              <div className='hidden sm:flex sm:items-center'>
                <Link
                  href='/sign-in'
                  className='text-[#266472] border border-black hover:bg-[#266472] hover:text-white px-4 py-2 rounded-md text-sm font-medium'
                >
                  Sign In
                </Link>
              </div>
              <div className='-mr-2 flex sm:hidden'>
                <Disclosure.Button className='inline-flex items-center justify-center p-2 rounded-md text-[#266472] hover:text-gray-500 hover:bg-gray-100 focus:outline-none'>
                  <span className='sr-only'>Open main menu</span>
                  {open ? (
                    <XMarkIcon
                      className='block h-6 w-6'
                      aria-hidden='true'
                    />
                  ) : (
                    <Bars3Icon
                      className='block h-6 w-6'
                      aria-hidden='true'
                    />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className='sm:hidden'>
            <div className='space-y-1 px-2 pb-3 pt-2'>
              <Disclosure.Button
                as={Link}
                href='/'
                className='block text-[#266472] hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
              >
                Home
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                href='/about'
                className='block text-[#266472] hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
              >
                About Us
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                href='/start-project'
                className='block text-[#266472] hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium'
              >
                Start a Project
              </Disclosure.Button>
              <Disclosure.Button
                as={Link}
                href='/sign-in'
                className='block border border-black text-[#266472] hover:bg-[#266472] hover:text-white px-3 py-2 rounded-md text-base font-medium mt-2'
              >
                Sign In
              </Disclosure.Button>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default LandingNavbar;
