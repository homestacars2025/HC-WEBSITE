"use client";

interface DatePickerProps {
  label: string;
  value?: string;
  onChange: (date: string) => void;
  min?: string;
  disabled?: boolean;
}

// TODO: Accessible date picker with min/max constraints for booking
export default function DatePicker({ label: _label, value: _value, onChange: _onChange }: DatePickerProps) {
  return <div className="flex flex-col gap-1" />;
}
