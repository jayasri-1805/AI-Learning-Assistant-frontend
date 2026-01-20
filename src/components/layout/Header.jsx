import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Bell,
  User,
  Menu,
  LogOut,
  Settings,
  Search,
  Command,
  HelpCircle,
  FileText,
  Loader,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import documentService from "../../services/documentService";
import moment from "moment";

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const documents = await documentService.getDocuments(searchQuery);
          setSearchResults(documents || []);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (docId) => {
    navigate(`/documents/${docId}`);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchFocused(false);
    setShowMobileSearch(false);
  };

  const SearchDropdown = () => (
    <>
      {searchQuery && (searchResults.length > 0 || isSearching) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
            {isSearching ? (
              <div className="flex items-center justify-center py-4 text-slate-400">
                <Loader className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => handleResultClick(doc._id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {doc.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {moment(doc.createdAt).format("MMM D, YYYY")}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-slate-500 text-sm">
                No documents found.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
        <div className="flex items-center justify-between h-full px-6 md:px-8 max-w-[1920px] mx-auto">
          {/* Left: Mobile Menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Center: Global Search Bar */}
          <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden md:block z-50">
            <div
              ref={searchRef}
              className={`relative group transition-all duration-300 ${
                isSearchFocused
                  ? "scale-[1.02] shadow-lg shadow-emerald-500/10"
                  : "hover:shadow-md hover:shadow-slate-200/50"
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search
                  className={`w-4 h-4 transition-colors duration-200 ${
                    isSearchFocused ? "text-emerald-500" : "text-slate-400"
                  }`}
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className={`w-full py-3 pl-11 pr-12 text-sm bg-slate-50/50 border rounded-2xl outline-none transition-all duration-200 ${
                  isSearchFocused
                    ? "bg-white border-emerald-500/50 ring-4 ring-emerald-500/10 text-slate-900 placeholder:text-slate-400"
                    : "border-slate-200 text-slate-600 placeholder:text-slate-400 group-hover:bg-white group-hover:border-slate-300"
                }`}
                onFocus={() => setIsSearchFocused(true)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader className="w-4 h-4 text-emerald-500 animate-spin" />
                ) : (
                  <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 shadow-sm">
                    <Command className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-medium text-slate-400">
                      K
                    </span>
                  </div>
                )}
              </div>

              {/* Dropdown Results */}
              {isSearchFocused && <SearchDropdown />}
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              <Search size={20} strokeWidth={2} />
            </button>

            {/* Help Button */}
            {/* <button className="hidden sm:inline-flex items-center justify-center w-10 h-10 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200">
              <HelpCircle size={20} strokeWidth={2} />
            </button> */}

            {/* Notifications */}
            {/* <button className="relative inline-flex items-center justify-center w-10 h-10 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 group">
              <Bell
                size={20}
                strokeWidth={2}
                className="group-hover:rotate-12 transition-transform duration-300 origin-top"
              />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </button> */}

            <div className="w-px h-8 bg-slate-200 mx-1 hidden sm:block"></div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`group flex items-center gap-3 pl-1 pr-2 py-1 rounded-xl transition-all duration-200 border border-transparent ${
                  showProfileMenu
                    ? "bg-white border-slate-200 shadow-sm"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow duration-300">
                    <span className="font-bold text-sm">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>

                <div className="text-left hidden lg:block">
                  <p className="text-sm font-semibold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 font-medium group-hover:text-emerald-600/70 transition-colors">
                    {user?.email || "user@gmail.com"}
                  </p>
                </div>

                <Settings
                  size={16}
                  className={`text-slate-400 transition-transform duration-300 hidden lg:block ${
                    showProfileMenu ? "rotate-90 text-emerald-500" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-3 w-80 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden transform origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="p-5 bg-gradient-to-br from-slate-50/80 to-slate-100/50 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <span className="font-bold text-lg">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {user?.name || "User"}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 space-y-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                        <User size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">My Profile</p>
                        <p className="text-xs text-slate-400">
                          Manage account settings
                        </p>
                      </div>
                    </Link>

                    <div className="px-4 py-1">
                      <div className="h-px bg-slate-100"></div>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        if (logout) logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:text-red-600 hover:bg-red-50/50 transition-all duration-200 group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-red-100 group-hover:text-red-500 flex items-center justify-center transition-colors">
                        <LogOut size={18} strokeWidth={2} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Sign Out</p>
                        <p className="text-xs text-slate-400">
                          End your secure session
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

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-white md:hidden animate-in slide-in-from-top-4 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-4">
          <div className="flex items-center gap-4 p-4 border-b border-slate-100">
            <div className="flex-1 relative">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents..."
                className="w-full py-3 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
            </div>
            <button
              onClick={() => {
                setShowMobileSearch(false);
                setSearchQuery("");
              }}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-4">
            {isSearching ? (
              <div className="text-center py-8 text-slate-500">
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() => handleResultClick(doc._id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 border border-slate-100 text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {moment(doc.createdAt).format("MMM D, YYYY")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchQuery ? (
              <div className="text-center py-8 text-slate-400">
                No results found
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                Type to search...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
