// ─── ModelGroup (Supabase table) ─────────────────────────────────────────────

export interface ModelGroup {
  id: string;
  name: string;
  brand: string;
  model: string;
  transmission: string;
  fuel: string;
  seats: number;
  luggage: number;
  category: string;
  daily_km: number;
  monthly_km: number;
  deposit: number;
  min_age: number;
  created_at: string;
  image_url: string | null;
  total_cars: number;
  price: number;
  /** Computed client-side when date range is selected. Not stored in DB. */
  available_count?: number;
}

// ─── Car ─────────────────────────────────────────────────────────────────────

export type CarCategory = "economy" | "middle" | "suv" | "luxury" | "electric" | "van";
export type Transmission = "automatic" | "manual";
export type Currency = "USD" | "EUR" | "LYD" | "TRY";
export type Locale = "en" | "ar" | "tr";
export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Car {
  id: string;
  name: string;
  category: CarCategory;
  transmission: Transmission;
  seats: number;
  price_per_day: number;
  images: string[];
  description_ar: string;
  description_tr: string;
  description_en: string;
  available: boolean;
  created_at: string;
}

// ─── Booking ─────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  car_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  return_date: string;
  total_price: number;
  currency: Currency;
  status: BookingStatus;
  created_at: string;
}

export interface BookingFormData {
  car_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_date: string;
  return_date: string;
  currency: Currency;
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

// ─── Filters ─────────────────────────────────────────────────────────────────

export interface CarFilters {
  category?: CarCategory | "";
  transmission?: Transmission | "";
  seats?: number;
  maxPrice?: number;
}

export type SortOrder = "price_asc" | "price_desc" | "newest";

// ─── UI Helpers ──────────────────────────────────────────────────────────────

export interface NavLink {
  href: string;
  label: string;
}

export interface Testimonial {
  id: string;
  author: string;
  text: string;
  rating: number;
  country: string;
}

export interface WhyItem {
  icon: string;
  titleKey: string;
  descKey: string;
}

export interface Stat {
  value: string;
  labelKey: string;
}
