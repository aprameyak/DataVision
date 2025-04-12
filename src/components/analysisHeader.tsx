import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function AnalysisHeader(){
    return(
        <div>
            <div className="w-screen h-10">
                <div className="flex justify-center items-center h-10">
                    <Button className="absolute left-2" variant="ghost" size="icon">
                    <ChevronLeft style={{ scale: 2 }} />
                    </Button>
                    <p className="text-4xl mt-[-5px]">Analysis:</p>
                </div>
            </div>
        </div>
    )
}
