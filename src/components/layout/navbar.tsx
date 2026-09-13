"use client";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY } from "@/config/company";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { env } from "@/config/env";
const PRIMARY_NAV: Array<{ href: string; label: string }> = [
  { href: "/", label: "HOME" },
  { href: "/ai", label: "AI" },
  { href: "/work", label: "WORK" },
  { href: "/packages", label: "PACKAGES" },
  { href: "/about", label: "ABOUT" },
  { href: "/jobs", label: "JOBS" },
];

const MORE_NAV: Array<{ href: string; label: string }> = [
  { href: "/services", label: "SERVICES" },
  { href: "/industries", label: "INDUSTRIES" },
  { href: "/products", label: "PRODUCTS" },
  { href: "/resources", label: "RESOURCES" },
  { href: "/about/founder", label: "FOUNDER" },
  { href: "/book-consultation", label: "BOOK CALL" },
  { href: "/client/login", label: "CLIENT PORTAL" },
  { href: "/support", label: "SUPPORT" },
  { href: "/blog", label: "BLOG" },
  { href: "/checklist", label: "CHECKLIST" },
  { href: "/discovery", label: "DISCOVERY" },
  { href: "/free-demo", label: "FREE DEMO" },
  { href: "/press", label: "PRESS" },
  { href: "/careers", label: "CAREERS" },
];
