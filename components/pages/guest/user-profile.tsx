"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

/* ---------------- Dummy Data ---------------- */
const profile = {
  name: "User Name",
  role: "Student",
  course: "BS Information Technology",
  email: "email@example.com",
  avatar: "https://via.placeholder.com/120",
  bio: "No bio yet.",
};

export default function UserProfile() {
  return (
    <section className="relative max-w-7xl mx-auto">
      {/* PROFILE OVERLAY */}
      <div className="container mx-auto mt-15 relative z-10 px-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            {/* Avatar */}
            <div className="shrink-0">
              <Image
                src={"/avatar.jpg"}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-black object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col">
              <h4 className="text-xl font-semibold">{profile.name}</h4>
              <p className="text-sm text-muted-foreground">{profile.role}</p>
              <small className="text-sm text-muted-foreground">
                {profile.course}
              </small>
              <small className="text-sm text-muted-foreground">
                {profile.email}
              </small>
            </div>

            {/* Button */}
            <div className="ml-auto">
              <Button size="sm">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ABOUT SECTION */}
      <div className="container mx-auto mt-15 px-4">
        <Card className="mb-10">
          <CardContent className="p-6">
            <h5 className="text-lg font-semibold mb-2">About Me</h5>
            <p className="text-muted-foreground">{profile.bio}</p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}