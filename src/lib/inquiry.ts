/**
 * Shape + validation for the company inquiry form.
 *
 * This file is deliberately dependency-free and shared by the client form and
 * the server action, so both agree on field names, option values and rules.
 * Field names here are also the column names used by the `inquiries` table
 * (see supabase/migrations/0001_inquiries.sql), just camelCase → snake_case.
 */

export const DIVISIONS = [
  { value: "chillers", label: "Air / Water cooled chillers" },
  { value: "flake-cutter", label: "Flake Cutter" },
  { value: "hopper-loader", label: "Hopper loader" },
  { value: "laser-marking", label: "Laser marking machine" },
  { value: "volumetric-feeder", label: "Volumetric feeder" },
  { value: "mould-temp", label: "Mould temp controller" },
  { value: "dehumidifier", label: "Dehumidifier" },
  { value: "unsure", label: "Not sure yet" },
] as const;

export const VOLUMES = [
  { value: "prototype", label: "Prototype / one-off" },
  { value: "pilot", label: "Pilot run (under 100)" },
  { value: "production", label: "Production (100 – 10,000)" },
  { value: "high-volume", label: "High volume (10,000+)" },
] as const;

export const TIMELINES = [
  { value: "exploring", label: "Exploring options" },
  { value: "0-3m", label: "Within 3 months" },
  { value: "3-6m", label: "3 – 6 months" },
  { value: "6m+", label: "6 months or later" },
] as const;

export type DivisionValue = (typeof DIVISIONS)[number]["value"];
export type VolumeValue = (typeof VOLUMES)[number]["value"];
export type TimelineValue = (typeof TIMELINES)[number]["value"];

export interface Inquiry {
  name: string;
  email: string;
  company: string;
  phone: string;
  division: DivisionValue;
  application: string;
  volume: VolumeValue | "";
  timeline: TimelineValue | "";
  drawingUrl: string;
  message: string;
}

export type InquiryField = keyof Inquiry | "consent";

export type InquiryErrors = Partial<Record<InquiryField, string>>;

/** Returned by the server action and consumed by `useActionState`. */
export interface InquiryFormState {
  status: "idle" | "success" | "error";
  message: string;
  errors: InquiryErrors;
  /** Human-quotable reference, e.g. VX-M4K2P9. Present on success only. */
  reference?: string;
  /** Echoed back so a failed submit does not wipe what was typed. */
  values?: Partial<Inquiry>;
}

export const INITIAL_INQUIRY_STATE: InquiryFormState = {
  status: "idle",
  message: "",
  errors: {},
};

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 4000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isOption<T extends readonly { value: string }[]>(
  options: T,
  value: string,
): value is T[number]["value"] {
  return options.some((option) => option.value === value);
}

export interface ParseResult {
  values: Inquiry;
  errors: InquiryErrors;
  consent: boolean;
}

/**
 * Reads the form payload and applies server-side validation. The client also
 * uses native `required` attributes, but nothing here trusts that.
 */
export function parseInquiry(formData: FormData): ParseResult {
  const rawDivision = text(formData, "division");
  const rawVolume = text(formData, "volume");
  const rawTimeline = text(formData, "timeline");
  const consent = formData.get("consent") === "on";

  const values: Inquiry = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    company: text(formData, "company"),
    phone: text(formData, "phone"),
    division: isOption(DIVISIONS, rawDivision) ? rawDivision : "unsure",
    application: text(formData, "application"),
    volume: isOption(VOLUMES, rawVolume) ? rawVolume : "",
    timeline: isOption(TIMELINES, rawTimeline) ? rawTimeline : "",
    drawingUrl: text(formData, "drawingUrl"),
    message: text(formData, "message"),
  };

  const errors: InquiryErrors = {};

  if (values.name.length < 2) {
    errors.name = "Tell us who to reply to.";
  }
  if (!EMAIL_RE.test(values.email)) {
    errors.email = "Enter a valid work email address.";
  }
  if (values.company.length < 2) {
    errors.company = "Company or institution is required.";
  }
  if (!isOption(DIVISIONS, rawDivision)) {
    errors.division = "Pick the closest division.";
  }
  if (values.message.length < MESSAGE_MIN) {
    errors.message = `A little more detail, please: at least ${MESSAGE_MIN} characters.`;
  } else if (values.message.length > MESSAGE_MAX) {
    errors.message = `Keep it under ${MESSAGE_MAX.toLocaleString()} characters.`;
  }
  if (values.drawingUrl && !/^https?:\/\/\S+\.\S+/.test(values.drawingUrl)) {
    errors.drawingUrl = "Use a full link starting with http:// or https://";
  }
  if (!consent) {
    errors.consent = "We need your permission to store and reply to this.";
  }

  return { values, errors, consent };
}

/** Short, unambiguous reference an engineer can quote back on the phone. */
export function makeReference(now: number = Date.now()): string {
  const stamp = now.toString(36).toUpperCase().slice(-4);
  const noise = Math.floor(Math.random() * 36 ** 2)
    .toString(36)
    .toUpperCase()
    .padStart(2, "0");
  return `VX-${stamp}${noise}`;
}

export function divisionLabel(value: DivisionValue): string {
  return DIVISIONS.find((d) => d.value === value)?.label ?? value;
}
