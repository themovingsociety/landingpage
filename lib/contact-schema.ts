import { z } from "zod";

export const contactFormSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    email: z
        .string()
        .min(1, "Email is required")
        .email("Please enter a valid email address"),
    country: z
        .string()
        .min(1, "Country is required")
        .min(2, "Country must be at least 2 characters")
        .max(100, "Country must be less than 100 characters"),
    sports: z
        .string()
        .min(1, "Sports is required")
        .max(500, "Sports must be less than 500 characters"),
    hobbiesAndInterests: z
        .string()
        .min(1, "Hobbies and interests is required")
        .max(500, "Hobbies and interests must be less than 500 characters"),
    business: z
        .string()
        .min(1, "Business is required")
        .max(500, "Business must be less than 500 characters"),
    lastTrips: z
        .string()
        .min(1, "Last trips is required")
        .max(500, "Last trips must be less than 500 characters"),
    comments: z
        .string()
        .min(1, "Comments are required")
        .min(10, "Comments must be at least 10 characters")
        .max(1000, "Comments must be less than 1000 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

