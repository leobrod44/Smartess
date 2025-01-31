import ProfileCard from "@/app/components/ProfileComponents/ProfileCard";
import ProfileInfo from "@/app/components/ProfileComponents/ProfileInfo";

/*
  Current user is used for testing of Static UI
*/

export const currentUser = {
  userId: "12345",
  role: "master",
  address: ["123 Main St", "Suite 400"],
  firstName: "Admin",
  lastName: "Admina",
  email: "Admina@cs.smartess.ca",
  phoneNumber: "514-444-1234",
};

const ProfilePage = () => {
  return (
    <div className="border border-black rounded-lg p-6 mx-4 lg:mx-8">
      <div className="flex flex-col justify-between">
        <div className="flex flex-row ">
          <h2 className="text-left text-[#325a67] text-[30px] leading-10 tracking-tight pb-3">
            <h4>Profile</h4>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row justify-normal gap-4">
          {/* Right panel */}
          <ProfileCard currentUser={currentUser} />

          {/* Left panel */}
          <ProfileInfo currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
