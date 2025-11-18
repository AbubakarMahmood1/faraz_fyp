"use client";
import { Button, Select, MultiSelect } from "rizzui";
import { useState, useRef } from "react";
import Form from "@/components/shared/form/form";
import TextEditor from "@/components/shared/text-editor";
import ImagePicker from "@/components/shared/image-picker";
import { EXPERTISE_AREAS, TECHNICAL_SKILLS, EXPERIENCE_LEVELS } from "@/data/constants";

interface InnovatorFinishFormProps {
  registrationData?: any;
}

export default function InnovatorFinishForm({ registrationData }: InnovatorFinishFormProps) {
  const [expertise, setExpertise] = useState([]);
  const [skills, setSkills] = useState([]);
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
      expertise,
      skills,
      experienceLevel: experienceLevel?.value,
      bio,
      profileImage,
    };

    console.log("Form data to submit:", formData);
    // Phase 2: Call API to complete profile
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
      <Button type="submit" size="xl">
        Finish
      </Button>
    </Form>
  );
}
