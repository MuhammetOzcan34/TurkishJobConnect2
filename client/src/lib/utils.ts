import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: "TRY" | "USD" | "EUR" = "TRY"): string {
  const symbols = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
  };

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
  })
    .format(amount)
    .replace(currency, symbols[currency]);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return "Bugün";
  }
  
  if (isYesterday(dateObj)) {
    return "Dün";
  }
  
  return format(dateObj, "d MMMM yyyy", { locale: tr });
}

export function formatDistanceToNowTurkish(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: tr });
}

export function generateId(prefix: string): string {
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `${prefix}${randomPart}`;
}

export function getStatusClass(
  status: string
): { badgeClass: string; textClass: string } {
  switch (status.toLowerCase()) {
    case "onaylandı":
    case "tamamlandı":
    case "ilerliyor":
    case "aktif":
    case "kabul edildi":
      return { badgeClass: "badge-success", textClass: "text-green-600" };
    case "beklemede":
    case "bekliyor":
    case "risk":
      return { badgeClass: "badge-warning", textClass: "text-yellow-600" };
    case "reddedildi":
    case "iptal":
    case "iptal edildi":
    case "kaybedildi":
      return { badgeClass: "badge-error", textClass: "text-red-600" };
    default:
      return { badgeClass: "badge-neutral", textClass: "text-gray-600" };
  }
}
