import { useState, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from "lucide-react";
import Spinner from "./spinner";

export default function DropDown({
  text,
  view,
}: {
  text: string;
  view: any | undefined | null;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-in-out ${
        isVisible
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`}
    >
      <Accordion
        type="single"
        collapsible
        className="shadow-skm border rounded-lg bg-gray-50 overflow-hidden mx-auto"
      >
        <AccordionItem value={`item-${text}`}>
          <AccordionTrigger
            onClick={() => setIsOpen(!isOpen)}
            disabled={!view}
            className={`${
              isOpen ? `border-b` : ``
            } bg-gray-100 rounded-b-none px-5 cursor-pointer`}
          >
            <div className="flex flex-row gap-5">
              <p className="text-lg font-medium">{text}</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pl-3 pr-7 w-full mt-4 ">
            {view}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
