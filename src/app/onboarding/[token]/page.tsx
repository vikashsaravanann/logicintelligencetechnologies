import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function OnboardingTokenRedirectPage({ params }: Props) {
  const { token } = await params;
  if (!token) {
    redirect("/onboard");
  }
  redirect(`/onboard?token=${encodeURIComponent(token)}`);
}
