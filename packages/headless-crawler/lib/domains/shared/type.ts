import type {
  EmploymentLabelToSelectorError,
  EngineeringLabelSelectorError,
  FillOccupationFieldError,
  FillPrefectureFieldError,
  FillWorkTypeError,
} from "./error";

export type JobFieldFillingError =
  | FillWorkTypeError
  | FillPrefectureFieldError
  | FillOccupationFieldError;

export type SelectorConverterError =
  | EmploymentLabelToSelectorError
  | EngineeringLabelSelectorError;
