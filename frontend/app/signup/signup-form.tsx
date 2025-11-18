"use client";
import { useState } from "react";
import Form from "@/components/shared/form/form";
import { Input, Password, Select, Button } from "rizzui";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { userActions } from "@/store/store";
import { PiArrowRightBold } from "react-icons/pi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Signup, signup } from "@/validators/zod-schemas";
import { USER_ROLES } from "@/data/constants";

export default function SignupForm() {
  //states
  const [duplicateUsername, setDuplicateUsername] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState(false);
  const [isLoading, setIsLodaing] = useState(false);
  const [registerAs, setRegisterAs] = useState(USER_ROLES[0]);

  const dispatcher = useDispatch();
  const { handleSignup, setSession } = useAuth();
  const router = useRouter();
  async function submit(data: Signup) {
    const { email, password, username } = data;
    setIsLodaing(true);
    const response = await handleSignup({
      email,
      password,
      username,
      registerAs: registerAs.value,
    });

    console.log(response.status);
    const responseStatus = response.status;

    // Backend now returns 409 (Conflict) for both duplicate email and username
    // Check response message to determine which field is duplicate
    if (responseStatus === 409) {
      const message = response.data?.data?.message?.toLowerCase() || "";
      if (message.includes("email")) {
        setDuplicateUsername(false);
        setDuplicateEmail(true);
      } else if (message.includes("username")) {
        setDuplicateEmail(false);
        setDuplicateUsername(true);
      }
      setIsLodaing(false);
    } else if (responseStatus === 201) {
      setDuplicateEmail(false);
      setDuplicateUsername(false);

      // Save token to localStorage
      if (response.data?.token) {
        setSession(response.data.token);
      }

      dispatcher(userActions.setUser(data?.username));
      if (registerAs.value === "innovator") {
        router.push("/registeration/innovator");
      } else if (registerAs.value === "expert") {
        router.push("/registeration/expert");
      } else if (registerAs.value === "explorer") {
        router.push("/");
      } else {
        router.push("/registeration/investor");
      }
    }
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Signup>({
    resolver: zodResolver(signup),
  });
  return (
    <Form style="" onSubmit={handleSubmit(submit)}>
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        {...register("email")}
        inputClassName={`${errors.email ? "border-red-500" : ""}`}
        errorClassName="text-red-500"
        error={
          errors.email
            ? errors.email.message
            : duplicateEmail && "Email already exist"
        }
      />
      <Input
        type="text"
        label="Username"
        placeholder="Enter username"
        {...register("username")}
        error={
          errors.username
            ? errors.username.message
            : duplicateUsername && "Username already exist"
        }
      />
      <div className="flex space-x-3">
        <Password
          label="Password"
          placeholder="Enter you password"
          {...register("password")}
          error={errors.password?.message}
          inputClassName={`${errors.password ? "border-red-500" : ""}`}
          errorClassName="text-red-500"
        />
        <Password
          label="Confirm Password"
          placeholder="Confirm your password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
          inputClassName={`${errors.confirmPassword ? "border-red-500" : ""}`}
          errorClassName="text-red-500"
        />
      </div>
      <Select
        options={USER_ROLES}
        label="Register as"
        value={registerAs}
        onChange={setRegisterAs}
      />
      <div className="space-y-3">
        <Button
          isLoading={isLoading}
          type="submit"
          size="lg"
          variant="solid"
          className="bg-green-900 text-white flex space-x-3 w-full"
        >
          <span>Sign up</span>
          <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
        </Button>
        <Link href="/signin" className="block">
          <Button variant="outline" className="w-full">
            Already have an account
          </Button>
        </Link>
      </div>
    </Form>
  );
}
