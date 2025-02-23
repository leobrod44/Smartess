import React from "react";
import { useState } from "react";
import { showToastError, showToastSuccess } from "../Toast";

const ManagePhoneNumberModal = ({
  isOpen,
  onClose,
  onResetPhoneNumber,
}: {
  isOpen: boolean;
  onClose: () => void;
  onResetPhoneNumber: (phoneNumber: string) => void;
}) => {
  const [newPhoneNumber, setnewPhoneNumber] = useState("");
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState("");

  const handleNewPhoneNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setnewPhoneNumber(value);
    // For backend and debugging
    console.log(value);
  };

  const handleConfirmNewPhoneNumberInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    // For backend and debugging
    setConfirmPhoneNumber(value);
  };

  // Submit Form for Phone number change
  const handleFormSubmission = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleReset();
  };

  const handleReset = () => {
    const phoneRegex = /^(\d{3}-\d{3}-\d{4}|\d{10})$/;

    if (!newPhoneNumber || !confirmPhoneNumber) {
      showToastError("Please fill in all required fields");
      return;
    }
    if (!phoneRegex.test(confirmPhoneNumber)) {
      showToastError("Please enter a valid 10-digit phone number");
      return;
    }

    if (newPhoneNumber !== confirmPhoneNumber) {
      showToastError("Phone numbers do not match.");
      return;
    }

    showToastSuccess("Phone number has been changed");
    onResetPhoneNumber(confirmPhoneNumber);
    setnewPhoneNumber("");
    setConfirmPhoneNumber("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <form onSubmit={handleFormSubmission}>
        <div className="bg-white rounded-xl shadow-lg p-10 w-[800px] h-[400px] relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition duration-300"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="flex justify-center">
            <h2 className="text-4xl text-[#30525E] pt-10 font-sequel-sans font-extrabold">
              Modify Phone Number
            </h2>
          </div>
          <div className="flex justify-center text-[#254752] text-xs mb-5">
            <h3 className="text-sm text-[red] pt-5 font-sequel-sans-regular">
              Please enter a valid new phone number.
            </h3>
          </div>

          <div className="w-5/6 mx-auto flex flex-col justify-center pb-10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="text-sm font-sequel-sans-regular text-right block">
                  New Phone number
                </label>
              </div>
              <input
                type="text"
                name="phonenumber"
                value={newPhoneNumber}
                onChange={handleNewPhoneNumberInput}
                className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 w-[290px]"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="w-1/3">
                <label className="text-sm font-sequel-sans-regular text-right block">
                  Confirm New Phone number
                </label>
              </div>
              <input
                type="text"
                name="phonenumber"
                value={confirmPhoneNumber}
                onChange={handleConfirmNewPhoneNumberInput}
                className="text-sm font-sequel-sans-regular border border-gray-400 rounded-lg px-3 py-1 w-[290px]"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex justify-around w-5/6">
              <button
                className="bg-[#ff5449] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#9b211b] transition duration-300"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="bg-[#4b7d8d] text-white text-xs w-[110px] py-2 rounded-md hover:bg-[#254752] transition duration-300"
                type="submit"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManagePhoneNumberModal;
