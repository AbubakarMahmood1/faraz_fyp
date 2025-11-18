import { Input, Button } from "rizzui";
import Form from "@/components/shared/form/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  ContactInformation,
  contactInformation,
  UserProfile,
} from "@/validators/zod-schemas";
export default function ContactInformationPage({
  submit,
  goBack,
}: {
  submit: (data: ContactInformation) => void;
  goBack: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInformation>({
    resolver: zodResolver(contactInformation),
  });
  return (
    <Form style="my-12 w-full" onSubmit={handleSubmit(submit)}>
      <Input
        type="tel"
        label="Phone No."
        placeholder="Enter your phone number"
        {...register("phoneNo")}
        error={errors.phoneNo?.message}
      />
      <Input
        label="Country"
        placeholder="Enter you country"
        {...register("country")}
        error={errors.country?.message}
      />
      <Input
        label="City"
        placeholder="Enter you City"
        {...register("city")}
        error={errors.city?.message}
      />
      <div className="space-x-3">
        <Button size="xl" variant="outline" onClick={goBack}>
          Back
        </Button>
        <Button size="xl" type="submit">
          Next
        </Button>
      </div>
    </Form>
  );
}
