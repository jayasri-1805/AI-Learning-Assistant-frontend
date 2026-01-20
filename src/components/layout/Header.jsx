import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Bell, User, Menu, LogOut, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="flex items-center justify-between h-full px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden inline-flex items-center justify-centre w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        <div className="hidden md:block"></div>

        <div className="flex items-center gap-3">
          <button className="relative inline-flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group">
            <Bell
              size={20}
              strokeWidth={2}
              className="group-hover:scale-110 transition-transform duration-200"
            />

            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile */}
          <div
            className="relative pl-3 border-l border-slate-200/60"
            ref={menuRef}
          >
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer group ${
                showProfileMenu ? "bg-slate-50 ring-2 ring-emerald-500/20" : ""
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-200">
                <User size={18} strokeWidth={2.5} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-slate-500 max-w-[120px] truncate">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform origin-top-right transition-all duration-200 animation-fade-in-up z-50">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-900">
                    Hello, {user?.name || "User"}!
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage your account settings and preferences.
                  </p>
                </div>

                <div className="p-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                      <Settings size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Go to Profile</p>
                      <p className="text-xs text-slate-400 group-hover:text-emerald-500/70">
                        Account Settings
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      if (logout) logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-500 flex items-center justify-center transition-colors">
                      <LogOut size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Sign Out</p>
                      <p className="text-xs text-slate-400 group-hover:text-red-400">
                        End your session
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
