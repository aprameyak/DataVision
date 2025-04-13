import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import Logo from "./logo";

export default function Header({ onClick }: { onClick: () => void }) {
    return (
        <div className="bg-gray-100 w-full h-fit p-5 sticky top-0 z-50 shadow-sm">
            <Button onClick={onClick} variant="link" className="absolute left-5 cursor-pointer" size="icon">
                <ChevronLeft style={{ scale: 2 }} />
            </Button>
            <p className="text-4xl w-fit m-auto cursor-pointer" onClick={onClick}>
                <Logo />
            </p>
        </div>
    );
}
