#!/usr/bin/env python3
from pathlib import Path

# Discovery
p = Path("src/app/(marketing)/discovery/page.tsx")
t = p.read_text()
old = """  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setSubmitError("Please provide an email address to receive a copy.");
      return;
    }
    setIsSubmitting(true);
    
    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, email }),
      });
      
      if (res.ok) {
        setSent(true);
      } else {
        console.error("Submission failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };"""
new = """  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setSubmitError("Please provide an email address to receive a copy.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(25000),
        body: JSON.stringify({ answers, email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.message || "Submission failed. Please try again or contact us on WhatsApp."
        );
      }
      setSent(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Network error. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };"""
if old in t:
    p.write_text(t.replace(old, new, 1))
    print("discovery patched")
elif "setSubmitError(null)" in t and "AbortSignal.timeout(25000)" in t:
    print("discovery already patched")
else:
    print("discovery pattern miss")

# Free demo
p = Path("src/app/(marketing)/free-demo/page.tsx")
t = p.read_text()
old = """      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          data?.message ||
            "Submission failed. Please try again or contact us on WhatsApp."
        );
      }"""
new = """      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) {
        setError(
          data?.message ||
            "Submission failed. Please try again or contact us on WhatsApp."
        );
      } else {
        setSent(true);
      }"""
if old in t:
    p.write_text(t.replace(old, new, 1))
    print("free-demo patched")
elif "data?.success === false" in t:
    print("free-demo already patched")
else:
    print("free-demo pattern miss")
