"use client";

import { useAtom } from "jotai";
import { companyNameAtom } from "../atoms";

export const SearchFilter = () => {
  const [companyName, setCompanyName] = useAtom(companyNameAtom);
  return (
    <div>
      <input
        type="text"
        value={companyName}
        placeholder="会社名で検索"
        onChange={(e) => setCompanyName(e.target.value)}
      />
    </div>
  );
};
