"use client";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from 'react'
import DropDown from "@/components/ui/dropDown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


//import { useRouter } from 'next/navigation'

export default function Analysis() {
  const tempData = "tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData tempData  "

  const [clicked, setClicked] = useState(0)
  const [showDiv, setShowDiv] = useState(false)

  return (
    <div className="w-screen h-screen">
      <div className="flex justify-center items-center h-12">
        {/* Top-left element */}
        <Button className="absolute left-2" variant="ghost" size="icon">
          <ChevronLeft style={{ scale: 2 }} />
        </Button>
        <p className="text-4xl mt-[-5px]">Analysis:</p>
      </div>
      <main>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => setClicked(clicked + 1)}
      >
        Click me
      </button>
      <div className = "absolute mt-10">
      </div>
      

        {/* temporarly based on clicked variable need to add ani*/}


      <DropDown text="Cleaning data" clicked={clicked} phaseNum={0} data={tempData}/>
      {clicked>0 && <DropDown text="Finding Patterns" clicked={clicked} phaseNum={1} data={tempData}/>}
      {clicked>1 && <DropDown text="Running Statistical Tests" clicked={clicked} phaseNum={2} data={tempData}/>}
      {clicked>2 && <DropDown text="Found Data!" clicked={clicked} phaseNum={3} data={tempData}/>}
        
        
      </main>
      <footer className="bg-gray-200 w-full h-14 row-start-3 flex items-center justify-center absolute bottom-0">
        <a
          className="gap-2 text-gray-600 flex items-center hover:underline hover:underline-offset-4"
          href="https://www.aadiananddeveloper05.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/github-logo.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          GitHub Repository
        </a>
      </footer>
    </div>
  );
}
