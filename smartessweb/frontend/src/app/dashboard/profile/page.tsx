import ProfileCard from "@/app/components/ProfileComponents/ProfileCard";
import ProfileInfo from "@/app/components/ProfileComponents/ProfileInfo";

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
          {/* Right pannel */}
          <ProfileCard />

          {/* Left pannel */}
          <ProfileInfo />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
