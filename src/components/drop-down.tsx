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
  return (
    <Accordion type="single" collapsible className="w-[80%] rounded-xl bg-gray-50 mx-auto">
      <AccordionItem value={`item-${text}`}>
        <AccordionTrigger disabled={!view} className="px-5 cursor-pointer ">
          <p className={`${view ? "" : "loading"} text-lg font-bold`}>{text}</p>
        </AccordionTrigger>
        <AccordionContent className="pl-3 pr-7">
          {text === "Running Statistical Tests" ?
            <div className="flex flex-col gap-4 overflow-y-auto max-h-96">
              {view.map((base64Str: string, index: number) => (
                <img
                  key={`image-${index}`}
                  src={`data:image/png;base64,${base64Str}`}
                  alt={`Hypothesis Visual ${index + 1}`}
                  className="w-full max-w-xl rounded-md border border-gray-300 shadow"
                />
              ))}
            </div>
            :
            view
          }
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
