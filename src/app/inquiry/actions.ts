"use server";

import {
  makeReference,
  parseInquiry,
  type InquiryFormState,
} from "@/lib/inquiry";
import { saveInquiry, type StoredInquiry } from "@/lib/inquiry-store";
import { sendInquiryEmail } from "@/lib/inquiry-email";

export async function submitInquiry(
  _prevState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  // Honeypot: a field no human sees. Bots fill it, so we accept and drop.
  if (typeof formData.get("website") === "string" && formData.get("website")) {
    return {
      status: "success",
      message: "Thanks, your inquiry is with us.",
      errors: {},
      reference: makeReference(),
    };
  }

  const { values, errors } = parseInquiry(formData);

  if (Object.keys(errors).length > 0) {
    return {
      status: "error",
      message: "Check the highlighted fields and send again.",
      errors,
      values,
    };
  }

  const reference = makeReference();
  const record: StoredInquiry = {
    ...values,
    reference,
    submittedAt: new Date().toISOString(),
  };

  /* Two independent channels. Neither is allowed to sink the other: an inquiry
     that reached the inbox is not lost because the database was down, and one
     that reached the database is not lost because the mail provider was. */
  const [stored, emailed] = await Promise.all([
    saveInquiry(record),
    sendInquiryEmail(record),
  ]);

  const anyConfigured = stored.configured || emailed.configured;
  const anyDelivered = stored.delivered || emailed.delivered;

  /* Nothing configured at all is local development, where both channels log to
     the console instead — that is not the visitor's problem. A channel that is
     configured and delivered nothing is a real failure and has to be shown. */
  if (anyConfigured && !anyDelivered) {
    return {
      status: "error",
      message:
        "We could not record that inquiry. Try again, or email contact@valnexindustries.com directly.",
      errors: {},
      values,
    };
  }

  if (anyConfigured && (!stored.ok || !emailed.ok)) {
    console.warn("[inquiry] delivered on one channel only", {
      reference,
      stored: stored.ok,
      emailed: emailed.ok,
    });
  }

  return {
    status: "success",
    message: "Received. An engineer reads every inquiry that arrives.",
    errors: {},
    reference,
  };
}
