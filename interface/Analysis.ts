interface Analysis {
  cleanResult: { summary: string; code: string; csv: BlobPart };
  designResult: string;
  hypothesisTestingResult: { figures: string[]; p_values: string };
  analyzeResult: string;
}
