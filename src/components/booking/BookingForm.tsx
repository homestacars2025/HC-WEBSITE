"use client";

import type { Car, BookingFormData } from "@/types";

interface BookingFormProps {
  car: Car;
  onSuccess?: () => void;
}

// TODO: 3-step booking form: Select dates → Your details → Confirm
export default function BookingForm({ car: _car, onSuccess: _onSuccess }: BookingFormProps) {
  return <div className="w-full max-w-lg mx-auto" />;
}

export type { BookingFormData };
