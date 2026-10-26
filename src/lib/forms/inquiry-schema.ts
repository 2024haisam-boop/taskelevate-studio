import * as z from "zod/mini";
import { inquiryServices } from "@/data/services";

/**
 * Shared by the client form (inline validation) and the API route (authoritative validation).
 * Uses Zod 4's tree-shakable `zod/mini` build: same validation, a fraction of the client JS.
 */

export const budgetOptions = ["Under $1,000", "$1,000–$2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000+", "Not sure yet"] as const;
export const timelineOptions = ["As soon as possible", "Within 2–4 weeks", "Within 1–3 months", "Flexible"] as const;

const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) => z.optional(z.union([z.enum(values), z.literal("")]));

export const inquirySchema = z.object({
  name: z.string().check(
    z.trim(),
    z.minLength(2, { error: "Please enter your full name." }),
    z.maxLength(120, { error: "That name is a little long — 120 characters max." }),
  ),
  email: z.pipe(
    z.string().check(
      z.trim(),
      z.minLength(1, { error: "Please enter your work email." }),
      z.maxLength(200, { error: "Please use a shorter email address." }),
    ),
    z.email({ error: "That email doesn't look quite right." }),
  ),
  company: z.optional(z.string().check(z.trim(), z.maxLength(160, { error: "160 characters max." }))),
  service: z.enum(inquiryServices, { error: "Please choose the service you're interested in." }),
  budget: optionalEnum(budgetOptions),
  timeline: optionalEnum(timelineOptions),
  message: z.string().check(
    z.trim(),
    z.minLength(20, { error: "Please share a little more detail — at least 20 characters." }),
    z.maxLength(5000, { error: "Please keep it under 5,000 characters." }),
  ),
});

export type InquiryInput = z.input<typeof inquirySchema>;
export type InquiryValues = z.output<typeof inquirySchema>;

const attrField = z.optional(z.string().check(z.trim(), z.maxLength(120)));

/** Full request payload: form values + anti-spam + attribution. */
export const inquiryPayloadSchema = z.extend(inquirySchema, {
  /** Honeypot — must stay empty */
  website: z.optional(z.string().check(z.maxLength(200))),
  /** ms timestamp when the form was rendered (timing trap) */
  startedAt: z.optional(z.int().check(z.positive())),
  /** Client-generated per-form key; makes retries idempotent */
  idempotencyKey: z.string().check(z.minLength(8), z.maxLength(80)),
  pagePath: z.optional(z.string().check(z.maxLength(200))),
  attribution: z.optional(
    z.nullable(
      z.partial(
        z.object({
          utm_source: attrField,
          utm_medium: attrField,
          utm_campaign: attrField,
          utm_content: attrField,
          utm_term: attrField,
          landingPath: attrField,
          referrerHost: attrField,
          capturedAt: attrField,
        }),
      ),
    ),
  ),
});

export type InquiryPayload = z.output<typeof inquiryPayloadSchema>;
