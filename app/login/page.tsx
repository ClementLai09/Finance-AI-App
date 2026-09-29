import { AuthForm } from "../components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthForm
      mode="login"
      notice={
        error === "confirmation"
          ? "We could not confirm your email. The link may have expired; please sign up again or contact support."
          : undefined
      }
    />
  );
}
