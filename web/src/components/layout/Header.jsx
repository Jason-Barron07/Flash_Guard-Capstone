import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * PUBLIC HEADER COMPONENT
 * Top navigation bar with branding and actions for public pages
 */
export function Header({ className = "", ...props }) {
  return (
    <header
      className={`fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/10 ${className}`}
      {...props}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10 h-16 sm:h-20 flex justify-between items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/"
            className="font-headline-md text-lg sm:text-headline-md font-black text-primary tracking-tight whitespace-nowrap"
            style={{ textDecoration: "none" }}
          >
            PrimeFin SA
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/wealth"
            className="text-on-surface-variant font-label-md text-label-md hover:text-secondary transition-colors"
          >
            Wealth
          </Link>
          <Link
            to="/transfers"
            className="text-on-surface-variant font-label-md text-label-md hover:text-secondary transition-colors"
          >
            Transfers
          </Link>
          <Link
            to="/business"
            className="text-on-surface-variant font-label-md text-label-md hover:text-secondary transition-colors"
          >
            Business
          </Link>
          <Link
            to="/support"
            className="text-on-surface-variant font-label-md text-label-md hover:text-secondary transition-colors"
          >
            Support
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            className="hidden sm:inline-flex px-3 sm:px-6 py-2.5 font-label-md text-sm sm:text-label-md text-on-surface-variant hover:text-secondary transition-colors whitespace-nowrap"
            to="/login"
          >
            Sign In
          </Link>
          <Link
            className="bg-secondary text-on-secondary px-4 sm:px-8 py-2.5 rounded font-label-md text-sm sm:text-label-md hover:opacity-90 transition-all shadow-sm whitespace-nowrap"
            to="/login"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * PUBLIC FOOTER COMPONENT
 */
export function Footer({ className = "", ...props }) {
  const currentYear = new Date().getFullYear();
  return (
    <footer
      className={`bg-surface-container-lowest py-20 border-t border-outline-variant/20 ${className}`}
      {...props}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <h4 className="font-headline-md text-headline-md font-black text-primary tracking-tight mb-6">
              PrimeFin SA
            </h4>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mb-8">
              The definitive fintech platform for South Africa's connected
              users. Money, airtime and data, redefined through technology.
            </p>
            <div className="flex gap-4">
              <a
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-secondary/10 hover:text-secondary transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  share
                </span>
              </a>
              <a
                className="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container hover:bg-secondary/10 hover:text-secondary transition-colors"
                href="#"
              >
                <span className="material-symbols-outlined text-[20px]">
                  alternate_email
                </span>
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-label-md text-label-md text-primary mb-6">
              Product
            </h5>
            <ul className="space-y-4 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <Link
                  className="hover:text-secondary transition-colors"
                  to="/dashboard"
                >
                  Wealth Management
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-secondary transition-colors"
                  to="/transfers"
                >
                  Fund Transfers
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-secondary transition-colors"
                  to="/history"
                >
                  Reporting
                </Link>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  Corporate Cards
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-md text-label-md text-primary mb-6">
              Company
            </h5>
            <ul className="space-y-4 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  About Us
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  Careers
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  Press Kit
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-label-md text-label-md text-primary mb-6">
              Legal
            </h5>
            <ul className="space-y-4 font-body-sm text-body-sm text-on-surface-variant">
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  Terms of Service
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  Security
                </a>
              </li>
              <li>
                <a className="hover:text-secondary transition-colors" href="#">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            © {currentYear} PrimeFin SA. All rights reserved. PrimeFin SA is an
            Authorised Financial Services Provider.
          </p>
          <div className="flex items-center gap-3 opacity-60">
            <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              Visa
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
              Mastercard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * SIDEBAR COMPONENT
 * Main navigation for authenticated users
 */
export function Sidebar({ session, className = "", ...props }) {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/airtime", label: "Airtime & Data", icon: "wifi_tethering" },
    { to: "/transfers", label: "Transfer Funds", icon: "payments" },
    { to: "/payment-methods", label: "Payment Methods", icon: "credit_card" },
    { to: "/history", label: "Transaction History", icon: "receipt_long" },
  ];

  return (
    <nav
      className={`hidden md:flex bg-tertiary-container text-on-tertiary h-screen w-72 flex-col fixed left-0 top-0 border-r border-outline-variant shadow-lg z-50 ${className}`}
      {...props}
    >
      <div className="flex flex-col h-full py-8 px-6">
        <div className="mb-12">
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <h1 className="font-headline-md text-headline-md font-bold text-on-tertiary tracking-tight">
              PrimeFin SA
            </h1>
            <p className="font-label-md text-label-md text-on-tertiary-fixed-variant mt-1 uppercase tracking-wider">
              Money, Airtime &amp; Data
            </p>
          </Link>
        </div>
        <ul className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "text-secondary-fixed border-l-4 border-secondary-fixed-dim bg-white/5 scale-95 font-bold"
                      : "text-on-tertiary-fixed-variant hover:text-on-tertiary hover:bg-white/10"
                  }`}
                  style={{ textDecoration: "none" }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={
                      isActive ? { fontVariationSettings: "'FILL' 1" } : {}
                    }
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-md text-label-md">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto space-y-4 pt-8 border-t border-white/10">
          <button className="w-full py-3 px-4 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg hover:bg-secondary-container transition-colors shadow-sm">
            Contact Advisor
          </button>
          <ul className="space-y-1">
            <li>
              <Link
                to="/login"
                className="flex items-center gap-4 px-4 py-2 rounded-lg text-on-tertiary-fixed-variant font-medium hover:text-on-tertiary hover:bg-white/10 transition-all duration-200"
                style={{ textDecoration: "none" }}
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-label-md text-label-md">Sign Out</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

/**
 * TOP NAVBAR COMPONENT
 */
export function TopNavBar({ session }) {
  return (
    <header className="hidden md:flex bg-surface-container-lowest text-primary fixed top-0 h-20 shadow-sm justify-between items-center px-10 ml-72 w-[calc(100%-18rem)] z-40">
      <div className="flex-1">
        <div className="relative w-96 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary-container transition-all group-hover:bg-white"
            placeholder="Search transactions, accounts..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="text-on-surface-variant hover:text-secondary transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
        </button>
        <button className="text-on-surface-variant hover:text-secondary transition-colors">
          <span className="material-symbols-outlined">help_outline</span>
        </button>
        <Link
          to="/transfers"
          className="px-5 py-2 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg shadow-sm hover:bg-secondary-container transition-colors focus:ring-2 focus:ring-secondary-container"
          style={{ textDecoration: "none" }}
        >
          Quick Pay
        </Link>
        <div className="h-10 w-10 flex items-center justify-center bg-secondary/20 text-secondary font-bold rounded-full overflow-hidden border-2 border-surface-container-highest cursor-pointer hover:border-secondary transition-colors ml-4">
          {session?.user?.full_name?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
}

/**
 * PAGE WRAPPER
 * Combines sidebar, topnav, and main content area for authenticated pages
 */
export function PageWrapper({
  title,
  subtitle,
  children,
  session,
  className = "",
  ...props
}) {
  return (
    <div className={`min-h-screen bg-background ${className}`} {...props}>
      <Sidebar session={session} />
      <TopNavBar session={session} />

      <main className="md:ml-72 md:mt-20 p-margin-mobile md:p-margin-desktop min-h-screen">
        <div className="mb-stack-xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">
              {title}
            </h2>
            {subtitle && (
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="font-label-md text-label-md text-on-surface-variant px-4 py-2 bg-surface-container rounded-lg border border-outline-variant inline-flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">
              calendar_today
            </span>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}
