"use server";

import {
  makeReference,
  parseInquiry,
  type InquiryFormState,
} from "@/lib/inquiry";
import { deliverInquiry, type StoredInquiry } from "@/services/inquiries";

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

  /* Both channels, in parallel, reconciled inside the service — see
     services/inquiries.ts for why neither is allowed to sink the other. */
  const { configured, delivered } = await deliverInquiry(record);

  /* Nothing configured at all is local development, where both channels log to
     the console instead — that is not the visitor's problem. A channel that is
     configured and delivered nothing is a real failure and has to be shown. */
  if (configured && !delivered) {
    return {
      status: "error",
      message:
        "We could not record that inquiry. Try again, or email info@valnexindustries.com directly.",
      errors: {},
      values,
    };
  }

  return {
    status: "success",
    message: "Received. An engineer reads every inquiry that arrives.",
    errors: {},
    reference,
  };
}
