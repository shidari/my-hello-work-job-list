import type { SearchFilter } from "@sho/models";
import { atom } from "jotai";

export const companyNameAtom = atom<string>("");
export const searchFilterAtom = atom<SearchFilter>((get) => {
  const companyName = get(companyNameAtom);
  const filter: SearchFilter = {};
  if (companyName.trim()) filter.companyName = companyName;
  return filter;
});
