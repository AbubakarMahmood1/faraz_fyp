"use client";
import SigninForm from "./signin-form";
import Authwrapper from "@/components/shared/auth-layout/auth-wrapper";
import UnderlineShape from "@/components/shape/underline";
export default function SigninPage() {
  return (
    <Authwrapper
      heading={
        <>
          Welcome{" "}
          <span className="relative">
            Back!
            <UnderlineShape className="absolute -bottom-2 start-0 h-2.5 w-24 text-green-900 xl:w-36" />
          </span>
        </>
      }
      description="Pleae login to access a world of innovation and opportunities"
    >
      <SigninForm />
    </Authwrapper>
  );
}
