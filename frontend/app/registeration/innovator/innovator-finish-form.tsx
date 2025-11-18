"use client";
import { Button, Select, MultiSelect } from "rizzui";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Form from "@/components/shared/form/form";
import TextEditor from "@/components/shared/text-editor";
import ImagePicker from "@/components/shared/image-picker";
import { EXPERTISE_AREAS, TECHNICAL_SKILLS, EXPERIENCE_LEVELS } from "@/data/constants";
import { useProfile } from "@/hooks/use-profile";

interface InnovatorFinishFormProps {
  registrationData?: any;
}

export default function InnovatorFinishForm({ registrationData }: InnovatorFinishFormProps) {
  const [expertise, setExpertise] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const editor = useRef(null);
  const router = useRouter();
  const { handleCompleteProfile } = useProfile();

  function getImageUrl(url: any) {
    setProfileImage(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validation
    if (!bio || bio.length < 50) {
      toast.error("Bio must be at least 50 characters long");
      return;
    }

    if (!registrationData?.firstName) {
      toast.error("Please complete previous registration steps first");
      return;
    }

    setIsLoading(true);

    try {
      const profileData = {
        ...registrationData,
        expertise: expertise.map((item: any) => item.value),
        skills: skills.map((item: any) => item.value),
        experienceLevel: experienceLevel?.value,
        bio,
        profileImage,
      };

      const response = await handleCompleteProfile(profileData);

      if (response.status === 200) {
        toast.success("Profile completed successfully!");
        router.push("/dashboard");
      } else {
        const errorMessage = response.data?.message || "Failed to complete profile";
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error("Profile completion error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form style="my-12 w-full" onSubmit={handleSubmit}>
      <MultiSelect
        label="Your Expertise"
        options={EXPERTISE_AREAS}
        value={expertise}
        onChange={setExpertise}
      />
      <MultiSelect
        label="Skills"
        options={TECHNICAL_SKILLS}
        value={skills}
        onChange={setSkills}
      />
      <div data-headlessui-state="open">
        <Select
          label="Experience Level"
          options={EXPERIENCE_LEVELS}
          value={experienceLevel}
          onChange={setExperienceLevel}
          data-headlessui-state="open"
        />
      </div>
      <ImagePicker multiple={false} getImageUrl={getImageUrl}>
        <div
          className="w-[100px] h-[100px] border rounded-full flex justify-center flex-col items-center"
          style={{
            backgroundImage: `url(${profileImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!profileImage && <span className="text-sm text-gray-500">Upload Photo</span>}
        </div>
      </ImagePicker>
      <TextEditor content={bio} setContent={setBio} />
      <Button type="submit" size="xl" isLoading={isLoading} disabled={isLoading}>
        Finish
      </Button>
    </Form>
  );
}
