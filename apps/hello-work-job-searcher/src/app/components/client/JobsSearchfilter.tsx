"use client";
import { useSetAtom } from "jotai";
import { useCallback, useRef } from "react";
import {
  initializeJobListWriterAtom,
  scrollRestorationByItemIndexAtom,
  scrollRestorationByItemListAtom,
} from "./atom";

export const JobsSearchfilter = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const initializeJobList = useSetAtom(initializeJobListWriterAtom);
  const jobListIndexSetter = useSetAtom(scrollRestorationByItemIndexAtom);
  const jobListItemSetter = useSetAtom(scrollRestorationByItemListAtom);

  const resetRestoration = useCallback(() => {
    jobListIndexSetter(0);
    jobListItemSetter([]);
  }, [jobListIndexSetter, jobListItemSetter]);

  const handleChange = () => {
    if (formRef.current === null) return;
    const formData = new FormData(formRef.current);
    const companyName = formData.get("companyName");
    const employeeCountRange = formData.get("employeeCountRange");
    let employeeCountFilter: Record<string, number> = {};

    switch (employeeCountRange) {
      case "1-9":
        employeeCountFilter = { employeeCountGt: 0, employeeCountLt: 10 };
        break;
      case "10-30":
        employeeCountFilter = { employeeCountGt: 9, employeeCountLt: 31 };
        break;
      case "30-100":
        employeeCountFilter = { employeeCountGt: 29, employeeCountLt: 101 };
        break;
      case "100+":
        employeeCountFilter = { employeeCountGt: 100 };
        break;
      default:
        employeeCountFilter = {};
    }

    const searchFilter = {
      ...(typeof companyName === "string" && companyName
        ? { companyName }
        : {}),
      ...employeeCountFilter,
    };
    initializeJobList(searchFilter);
    resetRestoration();
  };

  return (
    <form
      ref={formRef}
      style={{ display: "flex", flexDirection: "column", gap: "8px" }}
    >
      <div>
        <input
          type="text"
          placeholder="会社名を検索"
          name="companyName"
          onChange={handleChange}
        />
      </div>
      <div>
        <select
          name="employeeCountRange"
          defaultValue=""
          onChange={handleChange}
        >
          <option value="">従業員数で絞り込む</option>
          <option value="1-9">1~9人</option>
          <option value="10-30">10~30人</option>
          <option value="30-100">30~100人</option>
          <option value="100+">100人以上</option>
        </select>
      </div>
    </form>
  );
};
