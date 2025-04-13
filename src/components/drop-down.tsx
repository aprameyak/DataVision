import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function DropDown({
  text,
  view,
}: {
  text: string;
  view: any | undefined | null;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Trigger fade-in animation after component mounts
  useEffect(() => {
    // Small delay to ensure animation works
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`transition-all duration-500 ease-in-out ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
      }`}>
      <Accordion
        type="single"
        collapsible
        className="border rounded-lg bg-gray-50 overflow-hidden mx-auto"
      >
        <AccordionItem value={`item-${text}`}>
          <AccordionTrigger onClick={() => setIsOpen(!isOpen)} disabled={!view} className={`${isOpen ? `border-b` : ``} bg-gray-100 rounded-b-none px-5 cursor-pointer`}>
            <p className={`${view ? "" : "loading"} text-lg font-bold`}>{text}</p>
          </AccordionTrigger>
          <AccordionContent className="pl-3 pr-7 w-full mt-4 ">
            {text === "Running Statistical Tests" ? (
              <div className="flex flex-col gap-4 overflow-y-auto max-h-96">
                {view.figures.map((base64Str: string, index: number) => (
                  <div key={`image-${index}`}>
                    <img
                      src={`data:image/png;base64,${base64Str}`}
                      alt={`Hypothesis Visual ${index + 1}`}
                      className="w-full max-w-xl rounded-md border border-gray-300 shadow"
                    />
                    <p>{view.p_values[index]}</p>
                  </div>
                ))}
              </div>
            ) : (
              view
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
