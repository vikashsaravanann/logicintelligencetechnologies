import { redirect } from "next/navigation";

/** Legacy demo URL — send users to the access request form. */
export default function VoiceShieldDemoRedirect() {
  redirect("/voice-shield/request");
}
