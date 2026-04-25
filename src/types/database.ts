export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cars: {
        Row: {
          id: string;
          name: string;
          category: "economy" | "middle" | "suv" | "luxury" | "electric" | "van";
          transmission: "automatic" | "manual";
          seats: number;
          price_per_day: number;
          images: string[];
          description_ar: string;
          description_tr: string;
          description_en: string;
          available: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: "economy" | "middle" | "suv" | "luxury" | "electric" | "van";
          transmission: "automatic" | "manual";
          seats: number;
          price_per_day: number;
          images: string[];
          description_ar: string;
          description_tr: string;
          description_en: string;
          available?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: "economy" | "middle" | "suv" | "luxury" | "electric" | "van";
          transmission?: "automatic" | "manual";
          seats?: number;
          price_per_day?: number;
          images?: string[];
          description_ar?: string;
          description_tr?: string;
          description_en?: string;
          available?: boolean;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          car_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          pickup_date: string;
          return_date: string;
          total_price: number;
          currency: "TRY" | "USD" | "EUR";
          status: "pending" | "confirmed" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          car_id: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          pickup_date: string;
          return_date: string;
          total_price: number;
          currency: "TRY" | "USD" | "EUR";
          status?: "pending" | "confirmed" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          car_id?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          pickup_date?: string;
          return_date?: string;
          total_price?: number;
          currency?: "TRY" | "USD" | "EUR";
          status?: "pending" | "confirmed" | "cancelled";
          created_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          message: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          message?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
