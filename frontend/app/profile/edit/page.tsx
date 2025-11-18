"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, MultiSelect, Input } from "rizzui";
import toast from "react-hot-toast";
import Link from "next/link";
import Form from "@/components/shared/form/form";
import TextEditor from "@/components/shared/text-editor";
import ImagePicker from "@/components/shared/image-picker";
import {
  EXPERTISE_AREAS,
  TECHNICAL_SKILLS,
  EXPERIENCE_LEVELS,
  INVESTING_EXPERIENCE,
  GENDERS,
  COUNTRIES,
} from "@/data/constants";
import { useProfile } from "@/hooks/use-profile";
import AuthController from "@/api/AuthController";

export default function ProfileEditPage() {
  const router = useRouter();
  const { handleGetMyProfile, handleUpdateProfile } = useProfile();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<any>(null);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [country, setCountry] = useState<any>(null);
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // Role-specific fields
  const [expertise, setExpertise] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<any>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [investingExperience, setInvestingExperience] = useState<any[]>([]);

  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const token = AuthController.getSession();
    if (!token) {
      router.push("/signin");
      return;
    }

    // Fetch existing profile
    handleGetMyProfile()
      .then((response) => {
        if (response.status === 200) {
          const profile = response.data.data.profile;
          const user = response.data.data.user;

          setUserRole(user.registerAs);

          // Populate form with existing data
          setFirstName(profile.firstName || "");
          setLastName(profile.lastName || "");
          setBio(profile.bio || "");
          setProfileImage(profile.profileImage || "");
          setPhoneNo(profile.phoneNo || "");
          setCity(profile.city || "");
          setDateOfBirth(
            profile.dateOfBirth
              ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
              : ""
          );

          // Set gender
          if (profile.gender) {
            const genderOption = GENDERS.find((g) => g.value === profile.gender);
            setGender(genderOption || null);
          }

          // Set country
          if (profile.country) {
            const countryOption = COUNTRIES.find((c) => c.value === profile.country);
            setCountry(countryOption || null);
          }

          // Set experience level
          if (profile.experienceLevel) {
            const expLevel = EXPERIENCE_LEVELS.find(
              (e) => e.value === profile.experienceLevel
            );
            setExperienceLevel(expLevel || null);
          }

          // Role-specific fields
          if (profile.expertise) {
            const expertiseOptions = EXPERTISE_AREAS.filter((e) =>
              profile.expertise.includes(e.value)
            );
            setExpertise(expertiseOptions);
          }

          if (profile.skills) {
            const skillsOptions = TECHNICAL_SKILLS.filter((s) =>
              profile.skills.includes(s.value)
            );
            setSkills(skillsOptions);
          }

          setOrganizationName(profile.organizationName || "");

          if (profile.investingExperience) {
            const investExp = INVESTING_EXPERIENCE.filter((i) =>
              profile.investingExperience.includes(i.value)
            );
            setInvestingExperience(investExp);
          }
        } else {
          router.push("/dashboard");
        }
      })
      .catch(() => {
        router.push("/signin");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function getImageUrl(url: any) {
    setProfileImage(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!firstName) {
      toast.error("First name is required");
      return;
    }

    if (!bio || bio.length < 50) {
      toast.error("Bio must be at least 50 characters long");
      return;
    }

    setIsSaving(true);

    try {
      const profileData: any = {
        firstName,
        lastName,
        gender: gender?.value,
        dateOfBirth,
        phoneNo,
        country: country?.value,
        city,
        bio,
        profileImage,
        experienceLevel: experienceLevel?.value,
      };

      // Add role-specific fields
      if (userRole === "innovator") {
        profileData.expertise = expertise.map((e) => e.value);
        profileData.skills = skills.map((s) => s.value);
      } else if (userRole === "expert") {
        profileData.expertise = expertise.map((e) => e.value);
      } else if (userRole === "investor") {
        profileData.organizationName = organizationName;
        profileData.investingExperience = investingExperience.map((i) => i.value);
      }

      const response = await handleUpdateProfile(profileData);

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        router.push("/dashboard");
      } else {
        const errorMessage =
          response.data?.message || "Failed to update profile";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Edit Profile</h1>
          <Link href="/dashboard">
            <Button variant="outline">Cancel</Button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <Form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Select
                  label="Gender"
                  options={GENDERS}
                  value={gender}
                  onChange={setGender}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  value={phoneNo}
                  onChange={(e) => setPhoneNo(e.target.value)}
                />
                <Select
                  label="Country"
                  options={COUNTRIES}
                  value={country}
                  onChange={setCountry}
                />
              </div>
              <Input
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-4"
              />
            </div>

            {/* Professional Information */}
            {(userRole === "innovator" || userRole === "expert") && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Professional Information
                </h2>
                <MultiSelect
                  label="Expertise"
                  options={EXPERTISE_AREAS}
                  value={expertise}
                  onChange={setExpertise}
                />
                {userRole === "innovator" && (
                  <MultiSelect
                    label="Skills"
                    options={TECHNICAL_SKILLS}
                    value={skills}
                    onChange={setSkills}
                  />
                )}
                <div className="mt-4" data-headlessui-state="open">
                  <Select
                    label="Experience Level"
                    options={EXPERIENCE_LEVELS}
                    value={experienceLevel}
                    onChange={setExperienceLevel}
                    data-headlessui-state="open"
                  />
                </div>
              </div>
            )}

            {/* Investor Information */}
            {userRole === "investor" && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Investor Information
                </h2>
                <Input
                  label="Organization Name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                />
                <MultiSelect
                  label="Investing Experience"
                  options={INVESTING_EXPERIENCE}
                  value={investingExperience}
                  onChange={setInvestingExperience}
                />
                <div className="mt-4" data-headlessui-state="open">
                  <Select
                    label="Experience Level"
                    options={EXPERIENCE_LEVELS}
                    value={experienceLevel}
                    onChange={setExperienceLevel}
                    data-headlessui-state="open"
                  />
                </div>
              </div>
            )}

            {/* Profile Photo */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Profile Photo</h2>
              <ImagePicker multiple={false} getImageUrl={getImageUrl}>
                <div
                  className="w-[150px] h-[150px] border rounded-full flex justify-center flex-col items-center cursor-pointer hover:border-blue-500 transition"
                  style={{
                    backgroundImage: `url(${profileImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {!profileImage && (
                    <span className="text-sm text-gray-500">Upload Photo</span>
                  )}
                </div>
              </ImagePicker>
            </div>

            {/* Bio */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About You</h2>
              <TextEditor content={bio} setContent={setBio} />
              <p className="text-sm text-gray-500 mt-2">
                Minimum 50 characters ({bio.length}/50)
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                size="xl"
                className="flex-1"
                isLoading={isSaving}
                disabled={isSaving}
              >
                Save Changes
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" size="xl" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
