"use client";
import { useSetAtom } from "jotai";
import { useRef } from "react";
import { initializeJobListWriterAtom } from "../atom";

export const JobsSearchfilter = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const initializeJobList = useSetAtom(initializeJobListWriterAtom);
  return (
    <form ref={formRef}>
      <input
        type="text"
        placeholder="会社名を検索"
        name="companyName"
        onChange={(_e) => {
          if (formRef.current === null) return;
          const formData = new FormData(formRef.current);
          const companyName = formData.get("companyName");
          // めんどいから一旦適当に書いた
          if (typeof companyName !== "string") return;
          const searchFilter = companyName ? { companyName } : {};
          initializeJobList(searchFilter);
        }}
      />
    </form>
  );
};
