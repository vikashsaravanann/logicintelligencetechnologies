import { redirect } from "next/navigation";

/** Demo is no longer a separate public page — single product entry at /voice-shield. */
export default function VoiceShieldDemoRedirect() {
  redirect("/voice-shield");
}
