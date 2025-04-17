import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import Logo from "./logo";

export default function Header() {
  return (
    <div className="bg-gray-100 w-full h-fit p-5 sticky top-0 z-50 shadow-sm flex items-center justify-center">
      <Button
        onClick={() => window.history.back()}
        variant="link"
        className="absolute left-5 cursor-pointer my-auto flex items-center justify-center"
        size="icon"
      >
        <ChevronLeft style={{ scale: 2 }} />
      </Button>
      <Button
        onClick={() => window.history.back()}
        variant="secondary"
        className="shadow-none font-normal cursor-pointer text-primary flex items-center justify-center"
      >
        <Logo />
      </Button>
    </div>
  );
}
