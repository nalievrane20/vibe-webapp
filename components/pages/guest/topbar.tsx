"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { Home, Calendar, Rss, Users, Bell, ChevronDown } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { markNotificationRead } from "@/app/actions/admin/notifications";

/* -------------------------------------------------------------------------- */
/*  Types                                                                    */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

export interface VibeUser {
  name: string;
  email?: string;
  avatarUrl?: string;
  course?: string;
}

export interface NotificationItem {
  /** Event id — used to mark as read and to navigate on click. */
  id: number;
  title: string;
  event_date: string | Date;
  isRead: boolean;
}

export interface NavbarProps {
  /** Currently active nav item id. */
  activeId?: string;
  /** Called when a nav item is clicked. */
  onNavigate?: (id: string) => void;
  /** Override the default nav items if needed. */
  navItems?: NavItem[];
  /** Event notifications, newest first. Pass from the server layout. */
  notifications?: NotificationItem[];
  /** Signed-in user, used for the avatar + dropdown. */
  user?: VibeUser;
  /** Called when "Log out" is clicked in the account menu. */
  onLogout?: () => void;
}

/* -------------------------------------------------------------------------- */
/*  Defaults                                                                 */
/* -------------------------------------------------------------------------- */

const defaultNavItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: <Home className="h-6 w-6" strokeWidth={2} /> },
  { id: "calendar", label: "Calendar", href: "/events", icon: <Calendar className="h-6 w-6" strokeWidth={2} /> },
  { id: "feed", label: "Feed", href: "/news", icon: <Rss className="h-6 w-6" strokeWidth={2} /> },
  { id: "community", label: "Community", href: "/group", icon: <Users className="h-6 w-6" strokeWidth={2} /> },
];

/* -------------------------------------------------------------------------- */
/*  Logo                                                                     */
/* -------------------------------------------------------------------------- */

function VibeLogo() {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <Image src={'/vibe-logo.png'} alt="logo" width={100} height={100}/>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Notifications menu (bell + dropdown list of events)                      */
/* -------------------------------------------------------------------------- */

function NotificationsMenu({ notifications }: { notifications: NotificationItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleSelect = async (notification: NotificationItem) => {
    setOpen(false);
    // Adjust this path if your event detail route is different.
    router.push(`/events/${notification.id}`);

    if (!notification.isRead) {
      await markNotificationRead(notification.id);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        className="relative text-gray-700 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md p-1 hidden sm:inline-flex"
      >
        <Bell className="h-6 w-6" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-80 origin-top-right rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg shadow-gray-200/60 focus:outline-none max-h-96 overflow-y-auto"
        >
          <div className="px-3.5 py-2.5 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
          </div>

          {notifications.length === 0 ? (
            <p className="px-3.5 py-4 text-sm text-gray-500">No events yet.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(n)}
                className={`block w-full px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 ${
                  n.isRead ? "text-gray-500" : "bg-blue-50/60 font-medium text-gray-900"
                }`}
              >
                <span className="block truncate">{n.title}</span>
                <span className="block text-xs text-gray-400">
                  {new Date(n.event_date).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Account menu (avatar + chevron dropdown)                                 */
/* -------------------------------------------------------------------------- */

function AccountMenu({ user, onLogout }: { user: VibeUser; onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#3E7A86] to-[#1D3F46] text-xs font-semibold text-white ring-2 ring-white">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </span>
        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white">
          <ChevronDown
            className={`h-3.5 w-3.5 text-gray-600 transition-transform ${open ? "rotate-180" : ""}`}
            strokeWidth={2.5}
          />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-3 w-52 origin-top-right rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg shadow-gray-200/60 focus:outline-none"
        >
          <div className="px-3.5 py-2.5 border-b border-gray-100">
            <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
            {user.email && <p className="truncate text-xs text-gray-500">{user.email}</p>}
            {user.course && <p className="truncate text-xs text-gray-400">{user.course}</p>}
          </div>
          <Link
            href="/profile"
            role="menuitem"
            className="block w-full px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Your profile
          </Link>
          <button
            role="menuitem"
            className="block w-full px-3.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Settings
          </button>
          <button
            role="menuitem"
            onClick={onLogout}
            className="block w-full px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navbar                                                                   */
/* -------------------------------------------------------------------------- */

export default function Topbar({
  activeId = "home",
  onNavigate,
  navItems = defaultNavItems,
  notifications = [],
  user,
  onLogout = () => logout(),
}: NavbarProps) {

  const safeUser: VibeUser = user ?? {
    name: "Guest User",
    email: "",
    course: "",
  };

  const pathname = usePathname();

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center" aria-label="VIBE home">
          <VibeLogo />
        </a>

        {/* Center nav */}
        <ul className="hidden items-center gap-8 sm:gap-10 md:flex">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item.href);
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  title={item.label}
                  className={`flex items-center justify-center rounded-md p-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    isActive ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <span className="sr-only">{item.label}</span>
                  {item.icon}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-5">
          <NotificationsMenu notifications={notifications} />
          <AccountMenu user={safeUser} onLogout={onLogout} />
        </div>
      </nav>

      {/* Mobile nav row (icons move below the logo on small screens) */}
      <ul className="flex items-center justify-center gap-10 border-t border-gray-100 py-2.5 md:hidden">
        {navItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={item.label}
                className={`flex items-center justify-center rounded-md p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive ? "text-blue-600" : "text-gray-700"
                }`}
              >
                <span className="sr-only">{item.label}</span>
                {item.icon}
              </Link>
            </li>
          );
        })}
      </ul>
    </header>
  );
}