"use client";
import axios from "axios";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FC, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Profile: FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [profileColor, setProfileColor] = useState("#000000");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setPreviewAvatar(URL.createObjectURL(file));
    }
  };

  const uploadProfile = async () => {
    const formData = new FormData();

    formData.append("userId", session?.user.id || "");
    formData.append("profileColor", profileColor);
    if (avatar) {
      formData.append("avatar", avatar);
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const response = await axios.post(`${API_URL}/api/user/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data.message) {
        setSuccessMessage("Profile updated successfully!");
      } else {
        setErrorMessage(response.data.error || "Error updating profile");
      }
    } catch (error) {
      setErrorMessage((error as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadProfile();
  };

  return (
    <div className="min-h-screen p-8 bg-white dark:bg-[#09090B]">
      <div className="flex justify-center align-middle text-center">
        <h1 className="text-2xl font-bold text-foreground">Profile Update</h1>
      </div>
      <form
        onSubmit={handleFormSubmit}
        className="mt-8 max-w-lg mx-auto  dark:bg-[#111828] shadow-lg p-6 rounded-lg"
      >
        <div className="mb-6">
          <label className="block text-foreground">Username</label>
          <input
            type="text"
            className="w-full mt-2 p-2 border border-input-border rounded-[8px]  dark:bg-[#202938] text-input-text"
            value=""
            onChange={() => {}}
            placeholder={session?.user.name}
          />
        </div>

        <div className="mb-6">
          <label className="block text-foreground">Profile Color</label>
          <div className="flex items-center mt-2">
            <input
              type="color"
              className="w-10 h-10 p-1 border border-input-border rounded-[8px] bg-input-background text-input-text "
              value={profileColor}
              onChange={e => setProfileColor(e.target.value)}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-foreground">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="mt-2 block w-full text-sm text-muted-foreground
            file:mr-4 file:py-2 file:px-4 file:border file:rounded-[8px] file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-800 dark:file:text-gray-300"
          />
          {previewAvatar && (
            <div className="mt-4">
              <Image
                src={previewAvatar}
                alt="Avatar Preview"
                width={100}
                height={100}
                className="rounded-full h-[100px] object-cover"
              />
            </div>
          )}
        </div>

        {errorMessage && <div className="text-red-500 mb-4">{errorMessage}</div>}
        {successMessage && <div className="text-green-500 mb-4">{successMessage}</div>}

        <div className="flex flex-row justify-between gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-1/2 bg-indigo-500 text-white p-3 rounded-md hover:bg-indigo-600 transition-colors dark:bg-indigo-700 dark:hover:bg-indigo-800"
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
          </button>
          <button
            type="button"
            className="w-1/2 bg-indigo-500 text-white p-3 rounded-md hover:bg-indigo-600 transition-colors dark:bg-indigo-700 dark:hover:bg-indigo-800"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
