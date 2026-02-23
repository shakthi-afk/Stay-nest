import { Link } from "react-router";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Sparkles, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

      {/* Decorative blurs */}
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/20">
                <Sparkles className="size-5" />
              </div>
              <div>
                <span className="text-xl font-bold text-white" style={{ fontFamily: 'var(--font-heading)' }}>StayNest</span>
                <p className="text-[10px] font-medium text-slate-500 tracking-widest uppercase -mt-0.5">Premium Hostels</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Your trusted platform for finding and booking affordable, verified hostels across India.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "https://facebook.com", hoverColor: "hover:bg-blue-600 hover:shadow-blue-500/25" },
                { icon: Twitter, href: "https://twitter.com", hoverColor: "hover:bg-sky-500 hover:shadow-sky-500/25" },
                { icon: Instagram, href: "https://instagram.com", hoverColor: "hover:bg-pink-600 hover:shadow-pink-500/25" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`bg-white/5 backdrop-blur-sm border border-white/10 p-2.5 rounded-xl ${social.hoverColor} hover:border-transparent hover:shadow-lg transition-all duration-300 hover:scale-105 text-slate-400 hover:text-white`}
                >
                  <social.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-5 text-sm font-semibold uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", to: "/" },
                { label: "Search Hostels", to: "/search" },
                { label: "Compare", to: "/compare" },
                { label: "My Dashboard", to: "/dashboard" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-indigo-400 group-hover:w-4 transition-all duration-300" />
                    {link.label}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white mb-5 text-sm font-semibold uppercase tracking-wider">Policies</h3>
            <ul className="space-y-3">
              {["Terms & Conditions", "Privacy Policy", "Cancellation Policy", "Refund Policy"].map((policy) => (
                <li key={policy}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-px bg-indigo-400 group-hover:w-4 transition-all duration-300" />
                    {policy}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-5 text-sm font-semibold uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: "support@staynest.com", href: "mailto:support@staynest.com" },
                { icon: Phone, label: "Phone", value: "+91 123 456 7890", href: "tel:+911234567890" },
              ].map((contact) => (
                <li key={contact.label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <contact.icon className="size-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{contact.label}</p>
                    <a href={contact.href} className="text-sm text-slate-300 hover:text-white transition-colors">
                      {contact.value}
                    </a>
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="size-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Address</p>
                  <p className="text-sm text-slate-300">Mumbai, Maharashtra, India</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; 2026 StayNest. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Crafted with ❤️ for travelers
          </p>
        </div>
      </div>
    </footer>
  );
}
