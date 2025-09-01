"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from '@/utils/supabase/client';

export default function OnboardingStep2() {
  const router = useRouter();
  const supabase = createClient();
  
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [photoId, setPhotoId] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoIdPreview, setPhotoIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const handlePhotoIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPhotoId(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoIdPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoIdPreview(null);
    }
  };

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelfie(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelfiePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelfiePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("You must be logged in to complete this step");
      }

      // Upload photo ID if provided
      let photoIdUrl = null;
      if (photoId) {
        try {
          // Create a unique file path - ensure the user ID is the first folder
          // Format: {auth.user().id}/{filename}
          const filePath = `${user.id}/${photoId.name.split('.')[0]}-${Date.now()}.${photoId.name.split('.').pop()}`;
          
          const { data: photoIdData, error: photoIdError } = await supabase.storage
            .from('user-documents')
            .upload(filePath, photoId, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (photoIdError) throw photoIdError;
          
          // Get the public URL (or just store the path if bucket is private)
          const { data: urlData } = await supabase.storage
            .from('user-documents')
            .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry
            
          photoIdUrl = urlData?.signedUrl || filePath;
        } catch (error) {
          console.error("Photo ID upload error:", error);
          throw new Error(`Failed to upload photo ID: ${error.message}`);
        }
      }

      // Upload selfie if provided
      let selfieUrl = null;
      if (selfie) {
        try {
          // Create a unique file path - ensure the user ID is the first folder
          // Format: {auth.user().id}/{filename}
          const filePath = `${user.id}/${selfie.name.split('.')[0]}-${Date.now()}.${selfie.name.split('.').pop()}`;
          
          const { data: selfieData, error: selfieError } = await supabase.storage
            .from('user-documents')
            .upload(filePath, selfie, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (selfieError) throw selfieError;
          
          // Get the public URL (or just store the path if bucket is private)
          const { data: urlData } = await supabase.storage
            .from('user-documents')
            .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry
            
          selfieUrl = urlData?.signedUrl || filePath;
        } catch (error) {
          console.error("Selfie upload error:", error);
          throw new Error(`Failed to upload selfie: ${error.message}`);
        }
      }

      // Update both users and user_profiles tables
      
      // First update the main users table with onboarding step
      const { error: userUpdateError2 } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          onboarding_step: 2,
          onboarding_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (userUpdateError2) throw new Error(`Failed to update user: ${userUpdateError2.message}`);
      
      // First, check if user exists in public.users
      const { data: publicUser, error: publicUserError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle(); // Use maybeSingle() instead of single()

      console.log("Public user check:", { publicUser, publicUserError });

      // If user doesn't exist in public.users, create them
      if (!publicUser) {
        console.log("User not found in public.users, creating...");
        const { error: createUserError } = await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email,
            onboarding_step: 2
          });
        if (createUserError) {
          console.error("Failed to create user:", createUserError);
          throw new Error(`Failed to create user: ${createUserError.message}`);
        }
      }

      // Now proceed with the user_profiles upsert
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          full_name: fullName,
          title: title,
          profile_completed: true,
          photo_id_url: photoIdUrl,
          selfie_url: selfieUrl,
          updated_at: new Date().toISOString(),
        });

      if (updateError) throw new Error(`Failed to update profile: ${updateError.message}`);

      //update users table
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          onboarding_step: 3,
          full_name: fullName,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (userUpdateError) throw new Error(`Failed to update user: ${userUpdateError.message}`);

      // Success! Redirect to step 3 or dashboard
      router.push('/onboarding/step-3');
      
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
                Complete your Digital ID profile
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

                {/* Step 2 - Current */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative flex items-center justify-center">
                    <div className="w-6 h-6 bg-black rounded-full z-20 relative flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-black text-center whitespace-nowrap">
                    Upload photo & ID
                  </div>
                </div>

                {/* Horizontal connector line */}
                <div className="flex items-center -mx-6">
                  <div className="h-px bg-gray-300 w-full mt-4"></div>
                </div>

                {/* Step 3 - Pending */}
                <div className="flex flex-col items-center space-y-3">
                  <div className="relative flex items-center justify-center">
                    <div className="w-6 h-6 bg-white border border-black rounded-full z-20 relative flex items-center justify-center">
                      <div className="w-1 h-1 bg-black rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-[10px] font-medium text-[#6F6F6F] text-center min-h-[1rem] whitespace-nowrap">
                    Download ID
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-md w-full mx-auto">
                {/* Full Name */}
                <div className="space-y-3">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-400"
                    style={{ color: "#625B71" }}
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-6 text-medium rounded-full bg-white focus:ring-2 focus:ring-purple-300 transition-all duration-200"
                    style={{ border: "1px solid #4F378A", height: "54px" }}
                  />
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <label
                    htmlFor="title"
                    className="block text-sm font-400"
                    style={{ color: "#625B71" }}
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-6 text-medium rounded-full bg-white focus:ring-2 focus:ring-purple-300 transition-all duration-200"
                    style={{ border: "1px solid #4F378A", height: "54px" }}
                  />
                </div>

                {/* Photo ID Upload */}
                <div className="space-y-3">
                  <label
                    htmlFor="photoId"
                    className="block text-sm font-400"
                    style={{ color: "#625B71" }}
                  >
                    Upload Photo ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="photoId"
                      name="photoId"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoIdChange}
                      required
                      className="sr-only"
                    />
                    <label
                      htmlFor="photoId"
                      className={`flex items-center justify-center w-full px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer ${
                        photoIdPreview ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-purple-400"
                      }`}
                      style={{ minHeight: "100px" }}
                    >
                      {photoIdPreview ? (
                        <div className="flex items-center space-x-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>Photo ID uploaded</span>
                          <img 
                            src={photoIdPreview} 
                            alt="ID Preview" 
                            className="h-16 ml-2 object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-500">Click to upload your photo ID</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Selfie Upload */}
                <div className="space-y-3">
                  <label
                    htmlFor="selfie"
                    className="block text-sm font-400"
                    style={{ color: "#625B71" }}
                  >
                    Upload Selfie <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="selfie"
                      name="selfie"
                      type="file"
                      accept="image/*"
                      onChange={handleSelfieChange}
                      required
                      className="sr-only"
                    />
                    <label
                      htmlFor="selfie"
                      className={`flex items-center justify-center w-full px-6 py-3 border-2 border-dashed rounded-lg cursor-pointer ${
                        selfiePreview ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-purple-400"
                      }`}
                      style={{ minHeight: "100px" }}
                    >
                      {selfiePreview ? (
                        <div className="flex items-center space-x-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span>Selfie uploaded</span>
                          <img 
                            src={selfiePreview} 
                            alt="Selfie Preview" 
                            className="h-16 ml-2 object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-2">
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-500">Click to upload a selfie</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-6 text-base font-medium rounded-full hover:bg-gray-800 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting…" : "Next"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
