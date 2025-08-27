"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingStep3() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
      {/* White Modal Container */}
          <div
            className="bg-white p-8 md:p-12"
            style={{
              filter: "drop-shadow(0 0 25px rgba(147, 51, 234, 0.06))",
              maxWidth: "572px",
              minHeight: "502px",
              borderRadius: "16px",
              margin: "0 auto"
            }}
          >
            <div className="mx-auto max-w-[640px] px-2 pt-4">
              <h2 className="text-[#625B71] whitespace-nowrap text-xl leading-9">
                Your Digital ID is Ready!
              </h2>

              {/* Horizontal Progress Steps */}
              <div className="grid grid-cols-5 items-start py-12 max-w-md mx-auto">
                {/* Step 1 - Completed */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center relative z-10">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[10px] font-medium text-[#6F6F6F] text-center whitespace-nowrap">
                    Verify email address
                  </div>
                </div>

                {/* Horizontal connector line */}
                <div className="flex items-center -mx-6">
                  <div className="h-px bg-black w-full mt-4"></div>
                </div>

                {/* Step 2 - Completed */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center relative z-10">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[10px] font-medium text-[#6F6F6F] text-center whitespace-nowrap">
                    Upload photo & ID
                  </div>
                </div>

                {/* Horizontal connector line */}
                <div className="flex items-center -mx-6">
                  <div className="h-px bg-black w-full mt-4"></div>
                </div>

                {/* Step 3 - Current */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center relative z-10">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[10px] font-medium text-black text-center min-h-[1rem] whitespace-nowrap">
                    Download ID
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-8 py-6">
                <div className="flex items-center justify-center space-x-3 my-4 mt-20 mb-40">
                  <div className="w-3 h-3 bg-black rounded-full"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-purple-300 rounded-full"></div>
                </div>
                <Button
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full bg-black text-white py-6 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
