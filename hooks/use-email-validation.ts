// hooks/use-email-validation.ts
import { useMemo, useState } from "react";

const FREE_EMAIL = new Set([
  "gmail.com","yahoo.com","outlook.com","hotmail.com","icloud.com","aol.com",
  "proton.me","protonmail.com","live.com","msn.com","me.com","yandex.com",
  "zoho.com","pm.me"
]);

export function useEmailValidation(initial = "") {
  const [email, setEmail] = useState(initial);
  const [submitted, setSubmitted] = useState(false);

  const trimmed = email.trim().toLowerCase();
  const isValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed), [trimmed]);

  const domain = trimmed.split("@")[1] ?? "";
  // const isCorporate = domain !== "" && !FREE_EMAIL.has(domain);
  const isCorporate = true;

  const error = !isValid
    ? "Enter a valid email."
    : !isCorporate
    ? "Please use a corporate email (no personal domains)."
    : "";

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return { email, isValid, isCorporate, error, submitted, setSubmitted, handleEmailChange };
}