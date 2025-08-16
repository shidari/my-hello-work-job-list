"use client";
import { useSetAtom } from "jotai";
import { useRef } from "react";
import { initializeJobListWriterAtom } from "./atom";

export const JobsSearchfilter = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const initializeJobList = useSetAtom(initializeJobListWriterAtom);

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
