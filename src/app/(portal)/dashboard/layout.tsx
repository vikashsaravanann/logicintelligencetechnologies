'use client';

import { motion } from 'framer-motion';
import {
  LogOut, Home, Users, Briefcase, FileText,
  Search, Bell, Activity, Globe, Share2, Menu
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { COMPANY } from '@/config/company';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mobileNav, setMobileNav] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMobileNav(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileNav ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileNav]);

  return (
    <div className="min-h-screen bg-[#030712] text-zinc-100 font-sans flex overflow-x-hidden">
      {/* Animated Sidebar */}
      {mobileNav && (
        <button type="button" aria-label="Close navigation" className="lg:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setMobileNav(false)} />
      )}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={`bg-[#0a0f1c]/95 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen transition-transform duration-300 z-40 shadow-2xl fixed lg:static inset-y-0 left-0 w-[280px] ${mobileNav ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-10 h-10 relative overflow-hidden rounded-full shadow-lg">
                <Image src={COMPANY.logoIconPath} alt={COMPANY.displayName} fill className="object-cover" />
              </div>
              <span className="text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 leading-tight flex-1">
                {COMPANY.displayName}
              </span>
            </motion.div>
          ) : (
            <div className="w-10 h-10 relative overflow-hidden rounded-full shadow-lg mx-auto">
              <Image src={COMPANY.logoIconPath} alt={COMPANY.displayName} fill className="object-cover" />
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {[
            { icon: Globe, label: 'Back to Website', href: '/' },
            { icon: Home, label: 'Overview', href: '/dashboard' },
            { icon: Users, label: 'Leads Pipeline', href: '/dashboard/leads' },
            { icon: Briefcase, label: 'Active Projects', href: '/dashboard/projects' },
            { icon: FileText, label: 'Finances', href: '/dashboard/finances' },
            { icon: Activity, label: 'Analytics', href: '/dashboard/analytics' },
            { icon: Share2, label: 'Omni Publisher', href: '/omni' },
          ].map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link key={idx} href={item.href} className="block">
                <motion.div
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-400 border border-indigo-500/20' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                  {isSidebarOpen && (
                    <div className="flex-1 flex items-center justify-between">
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className={`flex items-center gap-3 mb-4 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-white font-bold border border-white/10 shadow-inner">
              A
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-bold text-white truncate">Administrator</p>
                <p className="text-xs text-indigo-400 font-medium">System Manager</p>
              </div>
            )}
          </div>
          <form action="/auth/signout" method="POST">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-colors border border-red-500/20 gap-2`}
            >
              <LogOut className="w-4 h-4" />
              {isSidebarOpen && <span>Secure Logout</span>}
            </motion.button>
          </form>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#030712] to-[#030712]">
        {/* Sleek Header */}
        <header className="h-16 sm:h-20 border-b border-white/5 flex items-center justify-between px-3 sm:px-6 md:px-10 bg-[#030712]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" className="lg:hidden h-10 w-10 rounded-xl border border-white/10 grid place-items-center shrink-0" onClick={() => setMobileNav(true)} aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white truncate">
              Command <span className="text-indigo-500">Center</span>
            </h1>
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">System Operational</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything (Cmd+K)..." 
                className="bg-white/[0.02] border border-white/10 rounded-full pl-11 pr-4 py-2 text-base md:text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 w-36 sm:w-56 md:w-72 transition-all placeholder:text-zinc-600 text-zinc-300 shadow-inner hidden sm:block" 
              />
            </div>
            <div className="relative">
              <button 
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
              >
                <Bell className="w-5 h-5 text-zinc-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 border-2 border-[#030712]"></span>
              </button>
              
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="absolute right-0 mt-2 w-80 bg-[#0a0f1c] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h4 className="font-bold text-white">Notifications</h4>
                    <span className="text-xs text-indigo-400 cursor-pointer hover:underline">Mark all read</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {[
                      { id: 1, title: 'New lead received', time: '5 mins ago', read: false },
                      { id: 2, title: 'Invoice #2026-08 paid', time: '2 hours ago', read: false },
                      { id: 3, title: 'Project "Acme" updated', time: '1 day ago', read: true },
                    ].map(notif => (
                      <div key={notif.id} className={`p-4 border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors flex gap-3 ${!notif.read ? 'bg-indigo-500/[0.02]' : ''}`}>
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${notif.read ? 'bg-transparent' : 'bg-indigo-500'}`}></div>
                        <div>
                          <p className={`text-sm ${notif.read ? 'text-zinc-400' : 'text-white font-medium'}`}>{notif.title}</p>
                          <p className="text-xs text-zinc-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-white/5 text-center">
                    <Link href="/dashboard/analytics" onClick={() => setShowNotifications(false)} className="text-xs text-zinc-400 hover:text-white transition-colors">
                      View all notifications
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
