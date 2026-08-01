"use server";

import {
  makeReference,
  parseInquiry,
  type InquiryFormState,
} from "@/lib/inquiry";
import { saveInquiry } from "@/lib/inquiry-store";

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
  const result = await saveInquiry({
    ...values,
    reference,
    submittedAt: new Date().toISOString(),
  });

  if (!result.ok) {
    return {
      status: "error",
      message:
        "We could not record that inquiry. Try again, or email contact@valnexindustries.com directly.",
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
