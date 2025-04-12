"use client";
import { useState, useEffect } from "react";
import DropDown from "@/components/ui/dropDown";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import AnalysisHeader from "@/components/analysisHeader";

//import { useRouter } from 'next/navigation'

interface AnalysisProps {
  cleanResult: Record<string, any> | null;
  designResult: string | null;
  visualizeResult: string | null;
  analyzeResult: string | null;
}

export default function Analysis({
  cleanResult,
  designResult,
  visualizeResult,
  analyzeResult,
}: AnalysisProps) {
  const tempData =
    "tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData  ";

  const [cleanSummary, setCleanSummary] = useState<string | null>(null);
  const [codeForCleaning, setCodeForCleaning] = useState<string | null>(null);
  const [clicked, setClicked] = useState(0);

  const downloadCSV = () => {
    if (cleanResult && cleanResult.csv) {
      const blob = new Blob([cleanResult.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cleaned_data.csv"; // Name of the downloaded file
      a.click();
      URL.revokeObjectURL(url); // Clean up the URL object
    } else {
      console.error("No CSV data available for download");
    }
  };

  useEffect(() => {
    if (cleanResult) {
      setCleanSummary(cleanResult["summary"]);
      setCodeForCleaning(cleanResult["code"]);
    } else {
      setCleanSummary(null);
      setCodeForCleaning(null);
    }
    console.log("Summary: ", cleanSummary);
  }, [cleanResult]);

  const CleaningStepData = (
    <div className="flex flex-col gap-2">
      <span className="font-bold">Summary:</span>
      <p>{cleanSummary}</p>
      <span className="font-bold">Code:</span>
      <p>{codeForCleaning}</p>
      <Button onClick={downloadCSV} className="mt-4">
        Download CSV
      </Button>
    </div>
  );

  return (
    <div className="w-full">
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => setClicked(clicked + 1)}
      >
        clean
      </button>

      {/* temporarly based on clicked variable need to add ani*/}
      <DropDown
        text="Cleaning data"
        clicked={clicked}
        phaseNum={0}
        data={CleaningStepData}
      />
      {clicked > 0 && (
        <DropDown
          text="Finding Patterns"
          clicked={clicked}
          phaseNum={1}
          data={tempData}
        />
      )}
      {clicked > 1 && (
        <DropDown
          text="Running Statistical Tests"
          clicked={clicked}
          phaseNum={2}
          data={tempData}
        />
      )}
      {clicked > 2 && (
        <DropDown
          text="Found Data!"
          clicked={clicked}
          phaseNum={3}
          data={tempData}
        />
      )}
    </div>
  );
}
