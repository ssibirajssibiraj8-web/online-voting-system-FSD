import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { ThemeSelector } from '../ui/ThemeSelector';
import { DemoVotingModal } from '../voting/DemoVotingModal';
import {
  Vote,
  FileCheck2,
  BarChart3,
  LayoutDashboard,
  ShieldAlert,
  ChevronDown,
  LogOut,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoVoteModalOpen, setDemoVoteModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Elections', href: '/elections', icon: <Vote className="w-4 h-4" /> },
    { label: 'Candidates', href: '/election/2026/candidates', icon: <UserCheck className="w-4 h-4" /> },
    { label: 'Results', href: '/results', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Security', href: '/security', icon: <ShieldAlert className="w-4 h-4" /> },
    { label: 'Sources', href: '/sources', icon: <FileCheck2 className="w-4 h-4" /> },
    { label: 'Verify', href: '/verify', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Prominent Mandatory Educational Simulation Disclaimer Banner (Section 1 & 51) */}
      <div className="bg-emerald-100/70 border-b border-emerald-200 py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-[11px] sm:text-xs text-emerald-900 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>
            <strong className="text-emerald-800 font-semibold">TN VoteSecure 2026:</strong>{' '}
            Educational simulation of an online election system. Not an official Election Commission of India platform.
          </span>
        </div>
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-emerald-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 p-0.5 shadow-sm transition-all duration-300">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <Vote className="w-5 h-5 text-emerald-600 transition-transform group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-wider uppercase font-serif text-slate-900 group-hover:text-emerald-700 transition-colors">
                TN VoteSecure 2026
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wide uppercase text-emerald-700 font-mono font-semibold -mt-1">
                Tamil Nadu Assembly Election 2026 — Secure Online Voting Simulation
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-emerald-50/90 px-2 py-1 rounded-full border border-emerald-200 backdrop-blur-md">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-100/60'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Controls & CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cast Demo Ballot Quick Action */}
            <button
              type="button"
              onClick={() => setDemoVoteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Vote className="w-4 h-4" />
              <span>Demo Ballot</span>
            </button>

            {/* Background Theme Selector Dropdown */}
            <ThemeSelector variant="select" />

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white border border-emerald-200 hover:border-emerald-400 shadow-sm transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                    {user.first_name[0]}
                    {user.last_name[0]}
                  </div>
                  <div className="flex flex-col pr-1">
                    <span className="text-xs font-semibold text-slate-900 max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono uppercase font-bold">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border-2 border-emerald-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-emerald-100">
                      <p className="text-xs font-bold text-slate-900">{user.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/voter/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-700" />
                        Voter Dashboard
                      </Link>

                      {(user.role === 'ADMIN' || user.role === 'ELECTION_MANAGER') && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                          Admin Console
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-emerald-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-slate-700 hover:text-emerald-800 hover:bg-emerald-50">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Register Elector
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeSelector variant="compact" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#151820] text-[#9699A3] hover:text-[#F5F5F2] border border-[#242834]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-emerald-200 bg-white/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(link.href)
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-3 border-t border-emerald-200">
              {isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1">
                    <p className="text-sm font-semibold text-slate-900">{user.full_name}</p>
                    <p className="text-xs text-emerald-700 font-mono uppercase font-semibold">{user.role}</p>
                  </div>
                  <Link
                    to="/voter/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#9699A3] hover:bg-white/5"
                  >
                    <UserCheck className="w-4 h-4 text-[#C9A96E]" />
                    Voter Dashboard
                  </Link>
                  {(user.role === 'ADMIN' || user.role === 'ELECTION_MANAGER') && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#9699A3] hover:bg-white/5"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#C9A96E]" />
                      Admin Console
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#E05252] hover:bg-[#E05252]/10"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Demo Ballot Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setDemoVoteModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm"
                >
                  <Vote className="w-4 h-4" />
                  <span>Cast Demo Ballot &amp; Receipt</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Demo Ballot Box & Real-Time Receipt Modal */}
      <DemoVotingModal
        isOpen={demoVoteModalOpen}
        onClose={() => setDemoVoteModalOpen(false)}
      />
    </>
  );
};
