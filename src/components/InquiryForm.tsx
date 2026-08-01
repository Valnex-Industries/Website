"use client";

import { useActionState, useId, useState } from "react";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { submitInquiry } from "@/app/inquiry/actions";
import {
  DIVISIONS,
  INITIAL_INQUIRY_STATE,
  MESSAGE_MAX,
  TIMELINES,
  VOLUMES,
  type InquiryErrors,
} from "@/lib/inquiry";
import { cn } from "@/utils/cn";

/** The form sits on a milk white card, so everything here is ink-on-white with blue accents. */
const FIELD_BASE =
  "w-full border bg-white px-4 py-3 text-sm font-medium text-[color:var(--brand-ink)] outline-none transition-colors duration-300 placeholder:text-[color:var(--brand-ink)]/30 focus:bg-white focus:ring-1 focus:ring-[color:var(--brand-blue)] focus:border-[color:var(--brand-blue)] shadow-sm";

function fieldClass(hasError?: boolean) {
  return cn(
    FIELD_BASE,
    hasError
      ? "border-[#c81e1e]/60 focus:border-[#c81e1e] focus:ring-[#c81e1e]"
      : "border-[color:var(--brand-ink)]/15"
  );
}

function Label({ htmlFor, children, optional }: {
  htmlFor: string;
  children: string;
  optional?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="eyebrow flex items-center gap-2 text-[color:var(--brand-ink)]/70"
    >
      {children}
      {optional && (
        <span className="normal-case tracking-normal text-[color:var(--brand-ink)]/40">
          optional
        </span>
      )}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-xs font-medium text-[#c81e1e]">
      {message}
    </p>
  );
}

/** Native select, restyled to the blueprint palette. */
function Select({
  id,
  name,
  label,
  options,
  placeholder,
  defaultValue,
  errors,
}: {
  id: string;
  name: string;
  label: string;
  options: readonly { value: string; label: string }[];
  placeholder: string;
  defaultValue?: string;
  errors: InquiryErrors;
}) {
  const error = errors[name as keyof InquiryErrors];
  return (
    <div>
      <Label htmlFor={id} optional>
        {label}
      </Label>
      <div className="relative mt-3">
        <select
          id={id}
          name={name}
          defaultValue={defaultValue ?? ""}
          className={cn(fieldClass(Boolean(error)), "appearance-none pr-11")}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          strokeWidth={2.2}
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--brand-blue)]"
        />
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function InquiryForm() {
  const [state, formAction, pending] = useActionState(
    submitInquiry,
    INITIAL_INQUIRY_STATE,
  );
  const uid = useId();
  const [count, setCount] = useState(0);

  const errors = state.errors;
  const values = state.values;
  const field = (name: string) => `${uid}-${name}`;

  if (state.status === "success") {
    return (
      <div className="py-4">
        <span className="flex h-11 w-11 items-center justify-center bg-[color:var(--brand-blue)]">
          <Check size={20} strokeWidth={3} className="text-white" />
        </span>
        <h2 className="mt-6 text-[clamp(1.5rem,2.6vw,2.25rem)] font-black leading-tight tracking-tight text-[color:var(--brand-blue)]">
          Inquiry received.
        </h2>
        <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-[color:var(--brand-ink)]/80 md:text-base">
          {state.message} Expect a reply within one working day.
        </p>
        <div className="mt-8 inline-flex flex-col gap-1 border border-[color:var(--brand-blue)]/20 bg-white shadow-sm px-5 py-4">
          <span className="eyebrow text-[color:var(--brand-blue)]/70">
            Your reference
          </span>
          <span className="font-orbitron text-lg font-bold tracking-[0.14em] text-[color:var(--brand-ink)]">
            {state.reference}
          </span>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-8">
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="border border-[#c81e1e]/40 bg-[#c81e1e]/[0.06] px-5 py-4 text-sm font-medium text-[color:var(--brand-ink)]"
        >
          {state.message}
        </p>
      )}

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor={field("name")}>Full name</Label>
          <input
            id={field("name")}
            name="name"
            type="text"
            autoComplete="name"
            defaultValue={values?.name}
            placeholder="Dana Okonkwo"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${field("name")}-error` : undefined}
            className={cn(fieldClass(Boolean(errors.name)), "mt-3")}
          />
          <FieldError id={`${field("name")}-error`} message={errors.name} />
        </div>

        <div>
          <Label htmlFor={field("email")}>Work email</Label>
          <input
            id={field("email")}
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={values?.email}
            placeholder="dana@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${field("email")}-error` : undefined}
            className={cn(fieldClass(Boolean(errors.email)), "mt-3")}
          />
          <FieldError id={`${field("email")}-error`} message={errors.email} />
        </div>

        <div>
          <Label htmlFor={field("company")}>Company</Label>
          <input
            id={field("company")}
            name="company"
            type="text"
            autoComplete="organization"
            defaultValue={values?.company}
            placeholder="Meridian Manufacturing"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? `${field("company")}-error` : undefined}
            className={cn(fieldClass(Boolean(errors.company)), "mt-3")}
          />
          <FieldError id={`${field("company")}-error`} message={errors.company} />
        </div>

        <div>
          <Label htmlFor={field("phone")} optional>
            Phone
          </Label>
          <input
            id={field("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={values?.phone}
            placeholder="+1 000 000 0000"
            className={cn(fieldClass(), "mt-3")}
          />
        </div>
      </div>

      {/* Division: chips in the same language as the tags on the division cards. */}
      <fieldset>
        <legend className="eyebrow text-[color:var(--brand-ink)]/70">
          Which division
        </legend>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {DIVISIONS.map((division) => (
            <label key={division.value} className="group cursor-pointer">
              <input
                type="radio"
                name="division"
                value={division.value}
                defaultChecked={values?.division === division.value}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "block border bg-white px-4 py-2 text-xs font-semibold tracking-wide",
                  "border-[color:var(--brand-ink)]/15 text-[color:var(--brand-ink)]/65",
                  "transition-all duration-300 group-hover:border-[color:var(--brand-blue)]/40 group-hover:text-[color:var(--brand-blue)]",
                  "peer-checked:border-[color:var(--brand-blue)] peer-checked:bg-[color:var(--brand-blue)] peer-checked:text-white peer-checked:shadow-md",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--brand-blue)]/60",
                )}
              >
                {division.label}
              </span>
            </label>
          ))}
        </div>
        <FieldError id={`${field("division")}-error`} message={errors.division} />
      </fieldset>

      <div>
        <Label htmlFor={field("application")} optional>
          Where does it run
        </Label>
        <input
          id={field("application")}
          name="application"
          type="text"
          defaultValue={values?.application}
          placeholder="Continuous casting line, 300°C ambient, 24/7"
          className={cn(fieldClass(), "mt-3")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Select
          id={field("volume")}
          name="volume"
          label="Volume"
          placeholder="Select a volume"
          options={VOLUMES}
          defaultValue={values?.volume}
          errors={errors}
        />
        <Select
          id={field("timeline")}
          name="timeline"
          label="Timeline"
          placeholder="Select a timeline"
          options={TIMELINES}
          defaultValue={values?.timeline}
          errors={errors}
        />
      </div>

      <div>
        <Label htmlFor={field("drawingUrl")} optional>
          Link to a drawing or spec
        </Label>
        <input
          id={field("drawingUrl")}
          name="drawingUrl"
          type="url"
          defaultValue={values?.drawingUrl}
          placeholder="https://drive.company.com/part-4471"
          aria-invalid={Boolean(errors.drawingUrl)}
          aria-describedby={errors.drawingUrl ? `${field("drawingUrl")}-error` : undefined}
          className={cn(fieldClass(Boolean(errors.drawingUrl)), "mt-3")}
        />
        <FieldError id={`${field("drawingUrl")}-error`} message={errors.drawingUrl} />
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-4">
          <Label htmlFor={field("message")}>The problem</Label>
          <span className="text-[10px] font-medium tracking-wide text-[color:var(--brand-blue)]/70">
            {count.toLocaleString()} / {MESSAGE_MAX.toLocaleString()}
          </span>
        </div>
        <textarea
          id={field("message")}
          name="message"
          rows={6}
          maxLength={MESSAGE_MAX}
          defaultValue={values?.message}
          onChange={(e) => setCount(e.target.value.length)}
          placeholder="The seal fails at around 900 hours. Duty cycle, material and the drawing number if you have them, or just describe what keeps breaking."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${field("message")}-error` : undefined}
          className={cn(fieldClass(Boolean(errors.message)), "mt-3 resize-y leading-relaxed")}
        />
        <FieldError id={`${field("message")}-error`} message={errors.message} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="consent" className="peer sr-only" />
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border border-[color:var(--brand-blue)]/30 bg-white",
              "transition-colors duration-300",
              "peer-checked:border-[color:var(--brand-blue)] peer-checked:bg-[color:var(--brand-blue)]",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--brand-blue)]/60",
              "peer-checked:[&>svg]:opacity-100",
              errors.consent && "border-[#c81e1e]/70",
            )}
          >
            <Check
              size={12}
              strokeWidth={3.5}
              className="text-white opacity-0 transition-opacity"
            />
          </span>
          <span className="text-xs font-medium leading-relaxed text-[color:var(--brand-ink)]/70">
            Valnex may store these details and contact me about this inquiry. We
            do not sell or share them.
          </span>
        </label>
        <FieldError id={`${field("consent")}-error`} message={errors.consent} />
      </div>

      <div className="flex flex-col items-start gap-4 border-t border-[color:var(--brand-blue)]/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-[color:var(--brand-ink)]/50">
          An engineer, not a form, reads every inquiry that arrives.
        </p>
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "group flex items-center gap-6 bg-[color:var(--brand-blue)] px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-[color:var(--brand-blue)]/20",
            "transition-transform duration-300 hover:-translate-y-0.5",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
          )}
        >
          {pending ? "Sending…" : "Send inquiry"}
          <ArrowRight
            size={16}
            strokeWidth={2.5}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </button>
      </div>
    </form>
  );
}
