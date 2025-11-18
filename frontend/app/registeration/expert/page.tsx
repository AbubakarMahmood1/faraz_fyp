"use client";
import { Stepper } from "rizzui";
import { UserProfile, ContactInformation } from "@/validators/zod-schemas";
import { useState } from "react";
import ContactInformationPage from "@/components/shared/userProfile/contact-information";
import UserProfle from "@/components/shared/userProfile/user-profile";
import ExpertFinishPage from "./expert-finish-page";

// Define interface for registration data
interface RegistrationData {
  // Personal Info
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  // Contact Info
  phoneNo?: string;
  country?: string;
  city?: string;
  // Expert-specific
  expertise?: string[];
  experienceLevel?: string;
  bio?: string;
  profileImage?: string;
}

export default function ExpertRegisteration() {
  const [currentStep, setCurrentStep] = useState(0); // Fixed: Changed from 2 to 0
  const [registrationData, setRegistrationData] = useState<RegistrationData>({}); // Fixed: Moved to component state

  function submit(data: UserProfile | ContactInformation) {
    setRegistrationData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => prev + 1);
  }

  function goBackHandler() {
    setCurrentStep((prev) => prev - 1);
  }

  return (
    <div className="max-w-4xl mx-auto mt-9">
      <Stepper currentIndex={currentStep}>
        <Stepper.Step title="Step 1" description="Personal Information" />
        <Stepper.Step title="Step 2" description="Contact Information" />
        <Stepper.Step title="Step 3" description="Finish" />
      </Stepper>
      {/* form for personal information */}
      {currentStep === 0 && <UserProfle submit={submit} />}
      {currentStep === 1 && (
        <ContactInformationPage submit={submit} goBack={goBackHandler} />
      )}
      {currentStep === 2 && <ExpertFinishPage registrationData={registrationData} />}
    </div>
  );
}
