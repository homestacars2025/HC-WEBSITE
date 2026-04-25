import { createClient } from "./server";
import type { Car, Booking, ContactMessage } from "@/types";

// ─── Cars ────────────────────────────────────────────────────────────────────

export async function getAvailableCars(filters?: {
  category?: string;
  transmission?: string;
  seats?: number;
  maxPrice?: number;
}) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("cars")
    .select("*")
    .eq("available", true)
    .order("created_at", { ascending: false });

  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.transmission) query = query.eq("transmission", filters.transmission);
  if (filters?.seats) query = query.gte("seats", filters.seats);
  if (filters?.maxPrice) query = query.lte("price_per_day", filters.maxPrice);

  const { data, error } = await query;
  if (error) throw error;
  return data as Car[];
}

export async function getCarById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as Car;
}

export async function getFeaturedCars(limit = 4) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("available", true)
    .limit(limit)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as Car[];
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function createBooking(
  booking: Omit<Booking, "id" | "created_at" | "status">
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...booking, status: "pending" } as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as Booking;
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export async function createContactMessage(
  message: Omit<ContactMessage, "id" | "created_at">
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contact_messages")
    .insert(message as never)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as ContactMessage;
}
