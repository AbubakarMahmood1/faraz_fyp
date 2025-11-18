import { z } from "zod";
import { errorMessages } from "@/data/messages";
//schema for signin
export const signin = z.object({
  email: z.string().email({ message: errorMessages.emailMessage }),
  password: z.string().min(8, { message: errorMessages.passwordMessage }),
  rememverMe: z.boolean().optional(),
});
//schema for signup
export const signup = z
  .object({
    email: z.string().email({ message: errorMessages.emailMessage }),
    username: z.string().nonempty({ message: errorMessages.usernameMessage }),
    password: z.string().min(8, { message: errorMessages.passwordMessage }),
    confirmPassword: z
      .string()
      .min(8, { message: errorMessages.confirmPasswordMessage }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: errorMessages.confirmPasswordMessage,
    path: ["confirmPassword"],
  });
//schema for user profile
export const userProfile = z.object({
  firstName: z.string().nonempty({ message: errorMessages.firstNameMessage }),
  lastName: z.string().optional(),
  dateOfBirth: z
    .string()
    .nonempty({ message: errorMessages.dateOfBirthMessage }),
  // gender: z.enum(["Male", "Female"], { message: errorMessages.genderMessage }),
});
//schema for contact information
export const contactInformation = z.object({
  phoneNo: z
    .string()
    .nonempty({ message: errorMessages.phoneNumberErrorMessage }),
  country: z.string().nonempty({ message: errorMessages.countryErrorMessage }),
  city: z.string().nonempty({ message: errorMessages.cityErrorMessage }),
  // city: z.string().nonempty({ message: errorMessages.phoneNumberMessage }),
});
export const innovatorFinishForm = z.object({
  experties: z.string().nonempty({ message: errorMessages.expertiesMessage }),
  skills: z.string().nonempty({ message: errorMessages.skillsMessage }),
  experienceLevel: z
    .string()
    .nonempty({ message: errorMessages.experienceLevelMessage }),
});
//export type

//export types
export type Signin = z.infer<typeof signin>;
export type Signup = z.infer<typeof signup>;
export type UserProfile = z.infer<typeof userProfile>;
export type ContactInformation = z.infer<typeof contactInformation>;
