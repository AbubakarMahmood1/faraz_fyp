"use client";
import { Button, Select, MultiSelect, Loader } from "rizzui";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import Form from "@/components/shared/form/form";
import TextEditor from "@/components/shared/text-editor";
import ImagePicker from "@/components/shared/image-picker";
const experienceOptions = [
  { label: "Artificial Inteligence", value: "artificial_intelligence" },
  { label: "Web Development", value: "web_development" },
  { label: "Mobile Development", value: "mobile_development" },
];

const experienceLevelOptions = [
  { label: "1 to 2 years", value: "1_2_years" },
  { label: "3 to 5 years", value: "2_5_years" },
  { label: "5+ years", value: "5+_years" },
];
export default function ExpertFinishPage() {
  const [experience, setExperience] = useState([]);
  const [experienceLevel, setExperienceLevel] = useState(
    experienceLevelOptions[0]
  );
  const isLoading = useSelector((state: any) => state.profile.isImageUploaded);
  const [bg, setBg] = useState(null);
  const [content, setContent] = useState("");
  console.log(content);
  const editor = useRef(null);
  function getImageUrl(url: any) {
    setBg(url);
  }
  return (
    <Form style="my-12 w-full">
      <MultiSelect
        key={Math.random().toString()}
        label="Your Experties"
        options={experienceOptions}
        value={experience}
        onChange={setExperience}
      />
      <div data-headlessui-state="open">
        <Select
          key={Math.random().toString()}
          label="Experience Level"
          options={experienceLevelOptions}
          value={experienceLevel}
          onChange={setExperienceLevel}
          data-headlessui-state="open"
        />
      </div>
      <ImagePicker multiple={false} getImageUrl={getImageUrl}>
        <div
          className="w-[100px] h-[100px] border rounded-full flex justify-center flex-col items-center"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {isLoading ? <Loader /> : <p className="text-sm">Profile Image</p>}
        </div>
      </ImagePicker>
      <TextEditor content={content} setContent={setContent} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <Button type="submit" size="xl">
        Finish
      </Button>
    </Form>
  );
}
