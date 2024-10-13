'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toast, { showToastError, showToastSuccess } from '../components/Toast';
import LandingNavbar from '@/components/LandingNavbar';

const StartProjectPage = () => {
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [telephoneNumber, setTelephoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async () => {
    if (
      !businessName ||
      !firstName ||
      !lastName ||
      !telephoneNumber ||
      !email ||
      !description
    ) {
      showToastError('Please fill in all required fields');
      return;
    } else if (!validateEmail(email)) {
      showToastError('Please enter a valid email address');
      return;
    } else {
      try {
        const response = await fetch('http://localhost:3000/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName,
            firstName,
            lastName,
            telephoneNumber,
            email,
            description,
          }),
        });
        const data = await response.json();
        if (response.ok) {
          showToastSuccess('Email sent successfully!');
          setTimeout(() => {
            router.push('/');
          }, 1000);
        } else {
          showToastError(
            data.error || 'Failed to send email. Please try again.'
          );
        }
      } catch {
        showToastError('Server error. Please try again later.');
      }
    }
  };

  return (
    <>
      <LandingNavbar />
      <Toast />
      <div className='flex h-screen items-center justify-center bg-grey'>
        <div className='w-full max-w-md space-y-6'>
          <h2 className='text-center text-xl font-semibold text-gray-800'>
            Start Project
          </h2>

          <input
            type='text'
            placeholder='Business Name'
            className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400'
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />

          <input
            type='text'
            placeholder='First Name'
            className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            type='text'
            placeholder='Last Name'
            className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            type='text'
            placeholder='Telephone Number'
            className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400'
            value={telephoneNumber}
            onChange={(e) => setTelephoneNumber(e.target.value)}
          />

          <input
            type='email'
            placeholder='Your Email'
            className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <textarea
            placeholder='Description'
            className='w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-gray-400'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <button
            className='w-full px-3 py-2 bg-black text-white rounded hover:bg-gray-900 focus:outline-none'
            onClick={handleSubmit}
          >
            Send Email
          </button>
        </div>
      </div>
    </>
  );
};

export default StartProjectPage;
