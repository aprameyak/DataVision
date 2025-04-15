"use client";

import { useState, useEffect } from "react";
import DropDown from "@/components/drop-down";
import { Button } from "@/components/ui/button";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/footer";
import Header from "@/components/header";
import Chat from "@/components/chat";

export default function Analysis() {
  const [isVisible, setIsVisible] = useState(false);
  const [analysis, setAnalysis] = useState<Partial<Analysis>>();

  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setIsVisible(true);

    const load = async () => {
      await cleanData();
      await designProcedure();
      // await hypothesisTest();
      // await summarize();
    };

    load();
  }, []);

  const cleanData = async () => {
    const url = "/api/data_cleaning";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      console.log(response);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setAnalysis((prev) => ({ ...prev, cleanResult: result }));
      return result.summary;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const designProcedure = async () => {
    const url = "/api/design_procedure";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.text();
      setAnalysis((prev) => ({ ...prev, designResult: result }));
      console.log("Analysis Procedure:", result);
      return result;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // fix endpoint
  const hypothesisTest = async () => {
    const url = "/api/hypothesis_test";
    const designResult = analysis?.designResult;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, designResult }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      setAnalysis((prev) => ({ ...prev, hypothesisTestingResult: result }));
      return result;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const summarize = async () => {
    const cleanResult = analysis?.cleanResult;
    const designResult = analysis?.designResult;
    const hypothesisTestResult = analysis?.hypothesisTestingResult;
    const url = "/api/summarize";
    const data = {
      id: id,
      cleaning_summary: cleanResult?.summary,
      potential_relationships: designResult,
      p_values_summary: hypothesisTestResult?.p_values,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      console.log("Raw response:", result);
      setAnalysis((prev) => ({ ...prev, analyzeResult: result }));
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const downloadCSV = () => {
    const cleanResult = analysis?.cleanResult;

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
  const CleaningStepData = analysis?.cleanResult && (
    <div className="flex flex-col gap-2">
      <span className="font-bold">Summary:</span>
      <p>{analysis.cleanResult.summary}</p>
      <span className="font-bold">Code:</span>
      {!analysis.cleanResult.code ?
        <p>No code available</p>
        :
        <SyntaxHighlighter language="javascript">{analysis.cleanResult.code}</SyntaxHighlighter>
      }
      <Button onClick={downloadCSV} className="mt-4">
        Download CSV
      </Button>
    </div>
  );

  const DesignStepData = analysis?.designResult && (
    <div className="flex flex-col gap-2">
      <span className="font-bold">Proposed Procedure:</span>
      <p>{analysis?.designResult}</p>
    </div>
  );

  const AnalysisSummaryData = analysis?.analyzeResult && (
    <div className="flex flex-col gap-2">
      <span className="font-bold">Summary:</span>
      <p>{analysis?.analyzeResult}</p>
    </div>
  );

  const HypothesisTestingData = analysis?.hypothesisTestingResult && (
    <div className="flex flex-col w-full items-center gap-4 overflow-y-auto max-h-[500px]">
      {analysis.hypothesisTestingResult.figures.map(
        (base64Str: string, index: number) => (
          <div key={`image-${index}`}>
            <img
              src={`data:image/png;base64,${base64Str}`}
              alt={`Hypothesis Visual ${index + 1}`}
              className="w-full max-w-xl rounded-md border"
            />
            <p className="text-center py-2">
              {analysis.hypothesisTestingResult?.p_values[index]}
            </p>
          </div>
        )
      )}
    </div>
  );

  // Utility function to handle file deletion on page unload
  const handleBeforeUnload = (id: string | null) => {
    if (id) {
      const url = "/api/delete_file";
      const data = JSON.stringify({ id });

      // Use navigator.sendBeacon for reliable file deletion
      const blob = new Blob([data], { type: "application/json" });
      navigator.sendBeacon(url, blob);
      console.log(`File with ID ${id} deletion request sent.`);
    }
  };

  useEffect(() => {
    const unloadHandler = () => {
      handleBeforeUnload(id); // Pass the file ID to the function
    };

    window.addEventListener("beforeunload", unloadHandler);

    return () => {
      window.removeEventListener("beforeunload", unloadHandler);
    };
  }, [id]);

  return (
    <div
      className={`bg-white h-full flex flex-col w-full font-[family-name:var(--font-geist-sans)] transition-opacity duration-1000 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"
        }`}
    >
      <Header />
      <div className=" w-[80%] py-10 mx-auto flex flex-col gap-10">
        <DropDown text="Data Cleaning" view={CleaningStepData} />
        <DropDown text="Analysis Procedure" view={DesignStepData} />
        <DropDown text="Statistical Tests" view={HypothesisTestingData} />
        <DropDown text="Summary" view={AnalysisSummaryData} />
        <Chat />
      </div>
    </div>
  );
}
