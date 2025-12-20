import { z } from 'zod';

// Common validation patterns
const sanitizeString = (str: string) => str.trim().substring(0, 1000);

const nameRegex = /^[a-zA-Z\s'-]+$/;
const phoneRegex = /^\+27[0-9]{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Authentication schemas
export const phoneAuthSchema = z.object({
  phone: z.string()
    .min(1, "Phone number is required")
    .regex(/^\+?27[0-9]{9}$/, "Invalid South African phone number format (+27XXXXXXXXX)")
    .transform(val => {
      // Ensure it starts with +27
      if (!val.startsWith('+')) {
        return val.startsWith('27') ? `+${val}` : `+27${val.replace(/^0/, '')}`;
      }
      return val;
    })
});

export const emailAuthSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .max(255, "Email must be less than 255 characters")
    .email("Invalid email address")
    .toLowerCase()
});

// Registration schema
export const registrationSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(nameRegex, "First name can only contain letters, spaces, hyphens and apostrophes")
    .transform(sanitizeString),
  
  lastName: z.string()
    .trim()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(nameRegex, "Last name can only contain letters, spaces, hyphens and apostrophes")
    .transform(sanitizeString),
  
  phoneNumbers: z.array(
    z.string()
      .regex(phoneRegex, "Invalid phone number format")
  ).min(1, "At least one phone number is required")
    .max(5, "Maximum 5 phone numbers allowed")
});

// Phone number schema
export const phoneNumberSchema = z.object({
  phoneNumber: z.string()
    .regex(phoneRegex, "Invalid South African phone number (+27XXXXXXXXX)")
});

// Payment schemas
export const paymentAmountSchema = z.object({
  amount: z.number()
    .min(5, "Minimum payment amount is R5.00")
    .max(10000, "Maximum payment amount is R10,000.00")
    .positive("Amount must be positive"),
  
  description: z.string()
    .trim()
    .min(3, "Description must be at least 3 characters")
    .max(200, "Description must be less than 200 characters")
    .transform(sanitizeString),
  
  paymentType: z.enum(['ride', 'deposit', 'subscription'], {
    errorMap: () => ({ message: "Invalid payment type" })
  })
});

// Feedback schema
export const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'general', 'complaint'], {
    errorMap: () => ({ message: "Invalid feedback type" })
  }),
  
  category: z.string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  
  priority: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: "Invalid priority" })
  }),
  
  rating: z.number()
    .min(1, "Rating must be between 1 and 5")
    .max(5, "Rating must be between 1 and 5")
    .int("Rating must be a whole number"),
  
  title: z.string()
    .trim()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters")
    .transform(sanitizeString),
  
  description: z.string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters")
    .transform(sanitizeString)
});

// Profile update schema
export const profileUpdateSchema = z.object({
  displayName: z.string()
    .trim()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be less than 50 characters")
    .regex(nameRegex, "Display name can only contain letters, spaces, hyphens and apostrophes")
    .optional()
    .or(z.literal('')),
  
  bio: z.string()
    .trim()
    .max(500, "Bio must be less than 500 characters")
    .optional()
    .or(z.literal('')),
  
  preferredLanguage: z.enum(['en', 'af', 'zu', 'xh', 'st', 'tn', 'ss', 'nr', 've', 'ts', 'nd'], {
    errorMap: () => ({ message: "Invalid language selection" })
  }).optional()
});

// Municipal services schema
export const municipalServiceSchema = z.object({
  serviceType: z.enum(['electricity', 'water', 'rates', 'refuse'], {
    errorMap: () => ({ message: "Invalid service type" })
  }),
  
  accountNumber: z.string()
    .trim()
    .min(5, "Account number must be at least 5 characters")
    .max(20, "Account number must be less than 20 characters")
    .regex(/^[A-Z0-9-]+$/i, "Account number can only contain letters, numbers and hyphens"),
  
  municipality: z.string()
    .trim()
    .min(2, "Municipality name is required")
    .max(100, "Municipality name must be less than 100 characters"),
  
  propertyAddress: z.string()
    .trim()
    .min(10, "Property address must be at least 10 characters")
    .max(200, "Property address must be less than 200 characters")
    .transform(sanitizeString)
});

// Location input schema
export const locationInputSchema = z.object({
  location: z.string()
    .trim()
    .min(3, "Location must be at least 3 characters")
    .max(200, "Location must be less than 200 characters")
    .transform(sanitizeString)
});

// ID/License validation
export const idNumberSchema = z.object({
  idNumber: z.string()
    .regex(/^[0-9]{13}$/, "South African ID number must be exactly 13 digits")
});

export const driversLicenseSchema = z.object({
  licenseNumber: z.string()
    .trim()
    .min(6, "Driver's license number must be at least 6 characters")
    .max(20, "Driver's license number must be less than 20 characters")
    .regex(/^[A-Z0-9]+$/i, "License number can only contain letters and numbers")
});

export const pdpNumberSchema = z.object({
  pdpNumber: z.string()
    .trim()
    .min(6, "PDP number must be at least 6 characters")
    .max(20, "PDP number must be less than 20 characters")
    .regex(/^[A-Z0-9]+$/i, "PDP number can only contain letters and numbers")
});

// Contact message schema (for external communications)
export const contactMessageSchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .regex(nameRegex, "Name can only contain letters, spaces, hyphens and apostrophes")
    .transform(sanitizeString),
  
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase(),
  
  message: z.string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters")
    .transform(sanitizeString)
});

// Helper function to validate and sanitize URL parameters
export const validateUrlParam = (param: string, maxLength: number = 100): string => {
  return param.trim().substring(0, maxLength);
};

// Admin verification notes schema
export const adminVerificationNotesSchema = z.object({
  notes: z.string()
    .trim()
    .min(1, "Verification notes cannot be empty")
    .max(1000, "Verification notes must be less than 1000 characters")
    .transform(str => str.replace(/[<>]/g, '')) // Remove potential HTML tags
});

// Optional admin verification notes (for approval where notes are optional)
export const optionalAdminNotesSchema = z.object({
  notes: z.string()
    .trim()
    .max(1000, "Verification notes must be less than 1000 characters")
    .transform(str => str.replace(/[<>]/g, ''))
    .optional()
    .or(z.literal(''))
});

// Helper to validate WhatsApp/SMS message content before sending
export const validateMessageContent = (content: string): string => {
  return content
    .trim()
    .substring(0, 1000) // Limit message length
    .replace(/[<>]/g, ''); // Remove potential HTML tags
};

// Trip Revenue validation schema
export const tripRevenueSchema = z.object({
  fare_amount: z.number()
    .min(0, "Fare amount cannot be negative")
    .max(10000, "Fare amount exceeds reasonable limit (R10,000)"),
  
  trip_date: z.string()
    .refine(date => !isNaN(Date.parse(date)), "Invalid date format"),
  
  trip_time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)")
    .optional()
    .or(z.literal('')),
  
  pickup_location: z.string()
    .trim()
    .max(200, "Pickup location must be under 200 characters")
    .optional()
    .or(z.literal('')),
  
  dropoff_location: z.string()
    .trim()
    .max(200, "Dropoff location must be under 200 characters")
    .optional()
    .or(z.literal('')),
  
  route_name: z.string()
    .trim()
    .max(100, "Route name must be under 100 characters")
    .optional()
    .or(z.literal('')),
  
  notes: z.string()
    .trim()
    .max(500, "Notes must be under 500 characters")
    .optional()
    .or(z.literal(''))
});

// Rank Access Fee validation schema
export const rankAccessFeeSchema = z.object({
  amount: z.number()
    .min(0, "Amount cannot be negative")
    .max(50000, "Amount exceeds reasonable limit (R50,000)"),
  
  week_starting: z.string()
    .refine(date => !isNaN(Date.parse(date)), "Invalid date format"),
  
  receipt_number: z.string()
    .trim()
    .max(50, "Receipt number must be under 50 characters")
    .optional()
    .or(z.literal(''))
});
