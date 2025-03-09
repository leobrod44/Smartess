import React from "react";
import { useState } from "react";
import { showToastError, showToastSuccess } from "../Toast";
import { passwordResetApi } from "@/api/components/ForgotPassword/ForgotPasswordModal"; 

const ForgotPasswordModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const validEmail = e.target.value;
    setEmail(validEmail);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = async () => {
    if (!email) {
      showToastError("Please fill in all required fields");
      return;
    }
    
    if (!validateEmail(email)) {
      showToastError("Please enter a valid email.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Using the dedicated API module
      await passwordResetApi.requestReset({ email });
      
      showToastSuccess("Reset email has been sent");
      setEmail("");
      onClose();
    } catch (error) {
      console.error("Password reset error:", error);
      showToastError(
        error instanceof Error 
          ? error.message 
          : "An error occurred while sending the reset email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" 
         onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-full max-h-full relative"
           onClick={(e) => e.stopPropagation()}>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          type="button"
        >
          ✕
        </button>
        <div className="flex justify-center">
          <h2 className="text-4xl text-[#30525E] pt-10 font-sequel-sans font-extrabold">
            Forgot Password?
          </h2>
        </div>
        <div className="flex justify-center text-[#254752] text-xs mb-5">
          <h3 className="text-sm text-[#52525C] pt-10 pb-2 font-sequel-sans-regular">
            A link will be sent to the provided email address with password reset instructions.
          </h3>
        </div>
        <div className="flex flex-col justify-center pb-10">
          <div className="flex items-center justify-center gap-4">
            <label className="text-sm font-sequel-sans-regular">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailInput}
              className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 w-2/4"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleReset();
                }
              }}
            />
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex justify-around w-4/5">
            <button
              className="bg-[#ff5449] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#9b211b] transition duration-300"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleReset();
              }}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Reset"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;