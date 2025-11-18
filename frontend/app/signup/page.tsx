"use client";
import SignupForm from "./signup-form";
import UnderlineShape from "@/components/shape/underline";
import Authwrapper from "@/components/shared/auth-layout/auth-wrapper";
export default function SignupPage() {
  return (
    <Authwrapper
      heading={
        <>
          Ready to{" "}
          <span className="relative">
            Join!
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-green-900 xl:w-36" />
          </span>
        </>
      }
      description="Join us today and turn your ideas into reality!"
    >
      <SignupForm />
    </Authwrapper>
  );
}
