"use client";
import { Button, Select, MultiSelect, Input } from "rizzui";
import { useState, useRef } from "react";
import Form from "@/components/shared/form/form";
import TextEditor from "@/components/shared/text-editor";
import ImagePicker from "@/components/shared/image-picker";
import { INVESTING_EXPERIENCE, EXPERIENCE_LEVELS } from "@/data/constants";

interface InvestorFinishPageProps {
  registrationData?: any;
}

export default function InvestorFinishPage({ registrationData }: InvestorFinishPageProps) {
  const [organizationName, setOrganizationName] = useState("");
  const [investingExperience, setInvestingExperience] = useState([]);

  const [experienceLevel, setExperienceLevel] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [bio, setBio] = useState("");
  const editor = useRef(null);

  function getImageUrl(url: any) {
    setProfileImage(url);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // TODO Phase 2: Submit to backend
    const formData = {
      ...registrationData,
      organizationName,
      investingExperience,
      experienceLevel: experienceLevel?.value,
      bio,
      profileImage,
    };

    console.log("Form data to submit:", formData);
    // Phase 2: Call API to complete profile
  }

  return (
    <Form style="my-12 w-full" onSubmit={handleSubmit}>
      <Input
        label="Enter your organization name"
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
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
      <MultiSelect
        label="Your Investing Experience"
        options={INVESTING_EXPERIENCE}
        value={investingExperience}
        onChange={setInvestingExperience}
      />

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
      <Button type="submit" size="xl">
        Finish
      </Button>
    </Form>
  );
}
