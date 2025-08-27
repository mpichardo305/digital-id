"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CongratsStep() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to step-3
    router.replace("/onboarding/step-3");
  }, [router]);
  
  // Return null or a loading state while redirecting
  return null;
}

/* Original congratulations page is commented out below
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function CongratsStepOriginal() {
  return (
    <div className="min-h-screen">
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="max-w-2xl mx-auto md:pt-24">
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

              <div className="grid grid-cols-5 items-start py-12 max-w-md mx-auto">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center relative z-10">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[10px] font-medium text-[#6F6F6F] text-center whitespace-nowrap">
                    Verify email address
                  </div>
                </div>

                <div className="flex items-center -mx-6">
                  <div className="h-px bg-black w-full mt-4"></div>
                </div>

                <div className="flex flex-col items-center space-y-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center relative z-10">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-[10px] font-medium text-[#6F6F6F] text-center whitespace-nowrap">
                    Upload photo & ID
                  </div>
                </div>

                <div className="flex items-center -mx-6">
                  <div className="h-px bg-black w-full mt-4"></div>
                </div>

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
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">Congratulations!</h3>
                  <p className="text-gray-600">
                    Your Digital ID has been created successfully. You can now download it to your device.
                  </p>
                </div>

                <div className="w-64 h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Digital ID Preview</p>
                </div>

                <Button
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full bg-black text-white py-6 text-base font-medium rounded-full hover:bg-gray-800 transition-colors"
                >
                  Download Digital ID
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
*/
