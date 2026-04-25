import type { Transition } from "motion/react";

// Apple-recommended ease-out curve — starts fast, decelerates naturally
export const EASE: Transition["ease"] = [0.22, 1, 0.36, 1] as [
  number,
  number,
  number,
  number,
];
