"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AlertCircle, ArrowRight, Check, LoaderCircle, Mail } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { getServiceByInquiryParam, inquiryServices } from "@/data/services";
import { readAttribution } from "@/lib/analytics/attribution";
import { track } from "@/lib/analytics/track";
import { budgetOptions, inquirySchema, timelineOptions, type InquiryInput, type InquiryValues } from "@/lib/forms/inquiry-schema";
import { cn } from "@/lib/utils/cn";
import { BookingLink } from "@/components/ui/BookingLink";

interface Props {
  /** Server-side: are the email env vars configured? */
  deliveryAvailable: boolean;
  contactEmail: string | null;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; name: string; email: string }
  | { kind: "error"; message: string; unavailable?: boolean };

/** Project inquiry form (brief §20). */
export function ProjectInquiryForm({ deliveryAvailable, contactEmail }: Props) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const startedAt = useRef<number>(0);
  const idempotencyKey = useRef<string>("");
  const started = useRef(false);
  const successRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InquiryInput, unknown, InquiryValues>({
    resolver: zodResolver(inquirySchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", company: "", budget: "", timeline: "", message: "" },
  });

  useEffect(() => {
    startedAt.current = Date.now();
    idempotencyKey.current = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    // Pre-select the service when arriving from a service page (?service=<slug>)
    const param = new URLSearchParams(window.location.search).get("service");
    const svc = getServiceByInquiryParam(param);
    if (svc) setValue("service", svc.inquiryValue, { shouldDirty: false });
  }, [setValue]);

  useEffect(() => {
    if (status.kind === "success") successRef.current?.focus();
    if (status.kind === "error") errorRef.current?.focus();
  }, [status]);

  const markStarted = () => {
    if (started.current) return;
    started.current = true;
    track("project_inquiry_started");
  };

  const onSubmit = async (values: InquiryValues) => {
    if (status.kind === "submitting") return;
    setStatus({ kind: "submitting" });
    const honeypot = (document.getElementById("inquiry-website") as HTMLInputElement | null)?.value ?? "";
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: honeypot,
          startedAt: startedAt.current || undefined,
          idempotencyKey: idempotencyKey.current,
          pagePath: window.location.pathname,
          attribution: readAttribution(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        message?: string;
        fieldErrors?: Partial<Record<keyof InquiryValues, string[]>>;
      };

      if (res.ok && data.ok) {
        track("project_inquiry_submitted", { service: values.service, budget: values.budget || "unspecified" });
        setStatus({ kind: "success", name: values.name.split(" ")[0] ?? values.name, email: values.email });
        return;
      }
      if (res.status === 422 && data.fieldErrors) {
        for (const [field, msgs] of Object.entries(data.fieldErrors)) {
          if (msgs?.[0]) setError(field as keyof InquiryValues, { message: msgs[0] });
        }
        setStatus({ kind: "idle" });
        return;
      }
      setStatus({
        kind: "error",
        unavailable: data.code === "delivery_unavailable",
        message:
          data.code === "delivery_unavailable"
            ? "Online inquiries can't be delivered right now, so nothing was sent."
            : data.message ?? "Something went wrong while sending. Please try again.",
      });
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach the server. Please check your connection and try again." });
    }
  };

  if (status.kind === "success") {
    return (
      <div className="glass glass-strong rounded-[28px] p-7 md:p-10" role="status">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-blue to-violet-bright text-white shadow-[0_12px_40px_-10px_rgb(168_85_247/0.8)]">
          <Check className="size-6" aria-hidden="true" />
        </span>
        <h2 ref={successRef} tabIndex={-1} className="mt-8 font-display text-display-sm font-bold tracking-[-0.03em] text-fg outline-none">
          Thank you, {status.name}. Your brief is on its way.
        </h2>
        <p className="mt-4 max-w-lg text-[1rem] leading-relaxed text-fg-2">
          We&apos;ll review what you&apos;ve shared and reply to <span className="text-fg">{status.email}</span>. If anything
          needs clarifying, we&apos;ll ask before suggesting next steps.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <BookingLink location="inquiry_success" label="Book a Discovery Call" />
          <Link href="/work" className="btn glass btn-glass btn-lg">
            Explore Our Work
          </Link>
        </div>
      </div>
    );
  }

  const submitting = status.kind === "submitting" || isSubmitting;

  return (
    <form
      noValidate
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      onFocusCapture={markStarted}
      className="glass glass-strong rounded-[28px] p-5 sm:p-7 md:p-10"
      aria-describedby={!deliveryAvailable ? "delivery-notice" : undefined}
    >
      {!deliveryAvailable && (
        <div id="delivery-notice" role="note" className="mb-8 flex gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-4 text-[0.9rem] leading-relaxed text-fg-2">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-200" aria-hidden="true" />
          <div>
            <p className="font-medium text-fg">Online inquiries are temporarily unavailable.</p>
            <p className="mt-1">
              The form can&apos;t deliver messages yet.
              {contactEmail ? (
                <>
                  {" "}
                  Please email{" "}
                  <a className="text-fg underline underline-offset-4" href={`mailto:${contactEmail}`}>
                    {contactEmail}
                  </a>
                  {" "}instead.
                </>
              ) : (
                " Please check back soon."
              )}
            </p>
            <BookingLink location="contact_unavailable" size="md" className="mt-3" />
          </div>
        </div>
      )}

      {/* Honeypot — hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="inquiry-website">Website</label>
        <input id="inquiry-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <TextField label="Full name" required autoComplete="name" error={errors.name?.message} registration={register("name")} />
        <TextField
          label="Work email"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          error={errors.email?.message}
          registration={register("email")}
        />
        <div className="md:col-span-2">
          <TextField label="Company / Brand" autoComplete="organization" error={errors.company?.message} registration={register("company")} />
        </div>
      </div>

      <ChoiceGroup legend="Service" required error={errors.service?.message} className="mt-9">
        {inquiryServices.map((s) => (
          <Choice key={s} value={s} registration={register("service")} invalid={Boolean(errors.service)}>
            {s}
          </Choice>
        ))}
      </ChoiceGroup>

      <div className="mt-9 grid gap-9 lg:grid-cols-2 lg:gap-8">
        <ChoiceGroup legend="Estimated budget" hint="Optional" error={errors.budget?.message}>
          {budgetOptions.map((b) => (
            <Choice key={b} value={b} registration={register("budget")} size="sm">
              {b}
            </Choice>
          ))}
        </ChoiceGroup>
        <ChoiceGroup legend="Project timeline" hint="Optional" error={errors.timeline?.message}>
          {timelineOptions.map((t) => (
            <Choice key={t} value={t} registration={register("timeline")} size="sm">
              {t}
            </Choice>
          ))}
        </ChoiceGroup>
      </div>

      <div className="mt-9">
        <TextField
          label="Project description"
          required
          multiline
          hint="What are you building, who is it for, and what should this project achieve?"
          error={errors.message?.message}
          registration={register("message")}
        />
      </div>

      {status.kind === "error" && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-8 flex gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.06] p-4 text-[0.9rem] leading-relaxed text-fg-2 outline-none"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-300" aria-hidden="true" />
          <div>
            <p className="font-medium text-fg">{status.message}</p>
            {(status.unavailable || contactEmail) && (
              <p className="mt-1">
                {contactEmail ? (
                  <a className="inline-flex items-center gap-1.5 text-fg underline underline-offset-4" href={`mailto:${contactEmail}`}>
                    <Mail className="size-3.5" aria-hidden="true" />
                    Email {contactEmail}
                  </a>
                ) : (
                  "Please try again later."
                )}
              </p>
            )}
            <BookingLink location="contact_error" size="md" className="mt-3" />
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-col-reverse items-stretch gap-5 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.8rem] leading-relaxed text-fg-3">
          By sending, you agree to our{" "}
          <a href="/privacy" className="text-fg-2 underline underline-offset-4 hover:text-fg">
            privacy policy
          </a>
          .
        </p>
        <button type="submit" disabled={submitting} className="btn btn-accent btn-lg min-w-[220px] disabled:cursor-wait disabled:opacity-80">
          {submitting ? (
            <>
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              Send Project Brief
              <ArrowRight className="btn-arrow size-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------------- */

function TextField({
  label,
  required,
  hint,
  error,
  multiline,
  registration,
  type = "text",
  inputMode,
  autoComplete,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  multiline?: boolean;
  registration: UseFormRegisterReturn;
  type?: string;
  inputMode?: "email" | "text";
  autoComplete?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [hint && hintId, error && errId].filter(Boolean).join(" ") || undefined;
  const base = cn(
    "block w-full rounded-2xl border bg-black/[0.035] px-4 text-[1rem] text-fg placeholder:text-fg-3",
    "transition-[border-color,background-color,box-shadow] duration-200",
    "hover:border-black/20 focus:border-violet-bright/80 focus:bg-black/[0.06] focus:shadow-[0_0_0_4px_rgb(168_85_247/0.18)] focus:outline-none",
    error ? "border-red-400/60" : "border-black/12",
  );
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between gap-3 text-[0.9rem] font-medium text-fg">
        <span>
          {label}
          {required && (
            <span className="ml-1 text-violet-bright" aria-hidden="true">
              *
            </span>
          )}
        </span>
        {!required && <span className="label-mono text-fg-3">Optional</span>}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-[0.85rem] text-fg-3">
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea
          id={id}
          rows={6}
          aria-required={required || undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(base, "mt-2.5 min-h-40 resize-y py-3.5 leading-relaxed")}
          {...registration}
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          aria-required={required || undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(base, "mt-2.5 h-14")}
          {...registration}
        />
      )}
      <FieldError id={errId} message={error} />
    </div>
  );
}

function ChoiceGroup({
  legend,
  required,
  hint,
  error,
  className,
  children,
}: {
  legend: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <fieldset className={className} aria-describedby={error ? `${id}-err` : undefined} aria-invalid={Boolean(error) || undefined}>
      <legend className="flex w-full items-baseline justify-between gap-3 text-[0.9rem] font-medium text-fg">
        <span>
          {legend}
          {required && (
            <span className="ml-1 text-violet-bright" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </span>
        {hint && <span className="label-mono text-fg-3">{hint}</span>}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
      <FieldError id={`${id}-err`} message={error} />
    </fieldset>
  );
}

function Choice({
  value,
  registration,
  children,
  size = "md",
  invalid,
}: {
  value: string;
  registration: UseFormRegisterReturn;
  children: ReactNode;
  size?: "sm" | "md";
  invalid?: boolean;
}) {
  return (
    <label className="relative cursor-pointer">
      <input type="radio" value={value} className="peer sr-only" {...registration} />
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-4 font-medium transition-[background-color,border-color,color,box-shadow] duration-200",
          size === "md" ? "min-h-12 text-[0.95rem]" : "min-h-11 text-[0.875rem]",
          invalid ? "border-red-400/50" : "border-black/12",
          // hover only lifts unselected chips (it used to turn a selected chip's text dark on its dark fill)
          "text-fg-2 peer-not-checked:hover:border-black/25 peer-not-checked:hover:text-fg",
          "peer-checked:border-transparent peer-checked:bg-fg peer-checked:text-bg",
          "peer-focus-visible:shadow-[0_0_0_3px_var(--color-bg),0_0_0_5px_#a855f7]",
        )}
      >
        {children}
      </span>
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p id={id} aria-live="polite" className={cn("text-[0.85rem] text-red-300", message ? "mt-2" : "sr-only")}>
      {message ? (
        <span className="inline-flex items-center gap-1.5">
          <AlertCircle className="size-3.5" aria-hidden="true" />
          {message}
        </span>
      ) : null}
    </p>
  );
}

