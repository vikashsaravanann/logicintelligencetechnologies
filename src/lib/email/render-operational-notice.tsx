import * as React from "react";
import { render } from "@react-email/components";
import OperationalNoticeEmail, {
  type OperationalNoticeEmailProps,
} from "../../../emails/operational-notice-email";

export type { OperationalNoticeEmailProps } from "../../../emails/operational-notice-email";

/** Render queue content locally; preserve the caller's original plain-text body. */
export async function renderOperationalNoticeEmail(
  props: OperationalNoticeEmailProps,
): Promise<{ html: string; text: string }> {
  return {
    html: await render(<OperationalNoticeEmail {...props} />),
    text: props.text,
  };
}
