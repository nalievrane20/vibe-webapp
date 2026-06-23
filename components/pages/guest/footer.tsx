"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPinterestP,
} from "react-icons/fa";

const socialLinks = [
  { icon: FaFacebookF, href: "#", label: "Facebook" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
  { icon: FaLinkedinIn, href: "#", label: "LinkedIn" },
  { icon: FaPinterestP, href: "#", label: "Pinterest" },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white mt-0 pt-10 text-center md:text-left">
      {/* Footer Links */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-6">
          {/* Social Icons */}
          <div className="flex items-center gap-6 mb-8">
            {socialLinks.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  aria-label={item.label}
                  className="hover:text-blue-400 transition"
                >
                  <Icon size={20} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-4">
        <div className="container mx-auto px-4 text-sm text-center">
          © 2026 Copyright:{" "}
          <Link
            href="https://example.com"
            className="text-blue-400 hover:underline"
            target="_blank"
          >
            VIBE
          </Link>
        </div>
      </div>
    </footer>
  );
}