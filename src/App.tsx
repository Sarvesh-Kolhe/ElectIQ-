/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  MapPin, 
  Users, 
  Calendar, 
  ArrowRight,
  ArrowLeft,
  CheckCircle2, 
  Info,
  Search,
  ExternalLink,
  ChevronRight,
  Send,
  Building2,
  Globe,
  Flag,
  Target as TargetIcon,
  Radio,
  ClipboardList,
  ShieldCheck,
  Cpu,
  Gavel
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  MOCK_CANDIDATES, 
  MOCK_STATIONS, 
  ELECTION_SCHEDULES, 
  INDIAN_STATES, 
  ECI_RESOURCES,
  STATE_COORDINATES
} from './data/mockData';
import { cn } from './lib/utils';
import ElectionMap from './components/Map';
import { Chatbot } from './components/Chatbot';

import { useFirebase } from './contexts/FirebaseContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './lib/firebase';

type Tab = 'overview' | 'registration' | 'candidates' | 'polling';

export default function App() {
  const { user, signIn, logout, profile } = useFirebase();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const { scrollY } = useScroll();
  
  const blobY1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const blobY2 = useTransform(scrollY, [0, 1000], [0, 150]);

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: Calendar },
    { id: 'registration', label: 'EPIC Service', icon: Vote },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'polling', label: 'Polling', icon: MapPin },
  ];

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-accent/30 overflow-x-hidden">
      {/* Cinematic Background System */}
      <div className="linear-bg" />
      <div className="noise-overlay" />
      <div className="grid-overlay" />
      
      {/* Animated Lighting Blobs */}
      <motion.div 
        style={{ y: blobY1 }}
        className="fixed top-[-10%] left-[-10%] w-[800px] h-[1000px] bg-accent/10 blur-[150px] rounded-full animate-float pointer-events-none opacity-40" 
      />
      <motion.div 
        style={{ y: blobY2 }}
        className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full animate-float pointer-events-none opacity-30 [animation-delay:2s]" 
      />

      {/* Navbar */}
      <header role="banner" className="sticky top-0 z-40 bg-[var(--glass-surface)] backdrop-blur-[var(--glass-blur)] border-b border-[var(--glass-border)] shadow-sm">
        <nav role="navigation" aria-label="Main Navigation" className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" role="link" aria-label="ElectIQ Home">
            <div className="bg-accent p-2 rounded-xl text-white shadow-lg shadow-accent/20 group-hover:scale-110 transition-transform duration-300">
              <Vote size={24} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-accent">ElectIQ</h1>
              <span className="text-[10px] font-mono tracking-[0.2em] text-foreground-muted font-bold uppercase">Personalized Journey</span>
            </div>
          </div>
          
          <div className="hidden md:flex bg-white/30 backdrop-blur-sm border border-white/40 p-1 rounded-xl shadow-sm gap-1">
            <div className="relative">
              <label htmlFor="state-selector" className="sr-only">Select your state</label>
              <select 
                id="state-selector"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-foreground text-xs font-bold uppercase tracking-wider px-3 py-2 outline-none border-r border-black/10"
              >
                {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
              </select>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                aria-label={tab.label}
                aria-selected={activeTab === tab.id}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  activeTab === tab.id 
                    ? "bg-white text-accent shadow-sm border border-black/[0.05]" 
                    : "text-foreground-muted hover:text-accent hover:bg-black/[0.02]"
                )}
              >
                <tab.icon size={16} aria-hidden="true" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-foreground leading-none">{user.displayName}</span>
                  <button 
                    onClick={logout}
                    className="text-[9px] font-bold text-accent uppercase tracking-widest hover:underline"
                  >
                    Logout
                  </button>
                </div>
                <img 
                  src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-xl border border-accent/20 bg-accent/5 p-0.5"
                />
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="bg-accent text-white rounded-lg px-6 py-2.5 text-sm font-bold hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 active:scale-95 flex items-center gap-2"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewView key="overview" onTabChange={setActiveTab} selectedState={selectedState} />}
          {activeTab === 'registration' && <RegistrationView key="registration" />}
          {activeTab === 'candidates' && <CandidatesView key="candidates" selectedState={selectedState} />}
          {activeTab === 'polling' && <PollingView key="polling" selectedState={selectedState} />}
        </AnimatePresence>
      </main>

      <footer role="contentinfo" className="md:hidden fixed bottom-6 left-6 right-6 bg-[var(--glass-surface)] backdrop-blur-[var(--glass-blur)] border border-[var(--glass-border)] rounded-2xl px-4 py-3 flex justify-around z-40 shadow-[var(--glass-shadow)] transition-all">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            aria-label={tab.label}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            className={cn(
              "flex flex-col items-center gap-1.5 p-2 transition-colors",
              activeTab === tab.id ? "text-accent" : "text-foreground-muted"
            )}
          >
            <tab.icon size={20} aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </footer>
      <Chatbot />
    </div>
  );
}

import SpotlightCard from './components/SpotlightCard';

function OverviewView({ onTabChange, selectedState }: { onTabChange: (tab: Tab) => void, selectedState: string }) {
  const stateSchedule = ELECTION_SCHEDULES.find(s => s.state === selectedState);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);
  const [activeStep, setActiveStep] = useState(0);

  const phases = [
    { 
      step: '01', 
      title: 'Announcement', 
      desc: 'ECI declares dates and the Model Code of Conduct (MCC) comes into force immediately.',
      details: 'The announcement triggers the freeze on government announcements. No new projects or financial grants can be declared by the ruling government to ensure a level playing field.',
      icon: Radio,
      color: '#3b82f6'
    },
    { 
      step: '02', 
      title: 'Nominations', 
      desc: 'Candidates file nominations; scrutiny of affidavits and background checks transpire.',
      details: 'Candidates must submit affidavits detailing their criminal records, assets, and educational qualifications. Any discrepancy can lead to disqualification during the scrutiny phase.',
      icon: ClipboardList,
      color: '#8b5cf6'
    },
    { 
      step: '03', 
      title: 'Campaigning', 
      desc: 'Intense campaigning phase ending 48 hours before the polling begins.',
      details: 'Political parties reach out to voters. The "Silence Period" begins 48 hours before the close of poll, during which no public meetings or campaigning is allowed.',
      icon: Flag,
      color: '#ec4899'
    },
    { 
      step: '04', 
      title: 'Polling Day', 
      desc: 'Voters cast their ballot using EVM/VVPAT across thousands of secure booths.',
      details: 'The use of Voter Verifiable Paper Audit Trail (VVPAT) allows voters to visually verify their vote. Central Armed Police Forces ensure security at sensitive booths.',
      icon: TargetIcon,
      color: '#f59e0b'
    },
    { 
      step: '05', 
      title: 'Results', 
      desc: 'Centralized counting of votes and official declaration of winners.',
      details: 'Counting is held at designated high-security centers. VVPAT slips are randomly matched with EVM counts to ensure 100% accuracy and trust in the result.',
      icon: CheckCircle2,
      color: '#10b981'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-24"
    >
      {/* Hero Section */}
      <motion.div 
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="text-center space-y-8 max-w-4xl mx-auto relative"
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-accent/10 bg-accent/5 text-accent text-xs font-bold tracking-wide uppercase shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Digital Election Assistant — Made in India 🇮🇳
        </motion.div>
        
          <h2 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.05] text-slate-900 font-display" id="dashboard-heading">
            Your <span className="text-accent-gradient">Personalized</span> <br /> Election Journey
          </h2>
        
        <p className="text-foreground-muted text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Not just information — actionable, step-by-step guidance based on YOUR situation. From voter registration to election day — we've got you covered.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
          <button 
            onClick={() => onTabChange('registration')}
            className="group relative bg-accent hover:bg-accent/90 text-white px-10 py-5 rounded-xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-accent/20 active:scale-95"
          >
            Start My Journey <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button 
            aria-label="Visit ECI Portal"
            onClick={() => window.open('https://eci.gov.in/', '_blank', 'noopener,noreferrer')}
            className="bg-white hover:bg-slate-50 text-accent border border-accent/20 px-10 py-5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
          >
            Visit ECI Portal <ExternalLink size={18} />
          </button>
        </div>
      </motion.div>

      {/* Bento Grid Features */}
      <section className="grid lg:grid-cols-12 gap-6 auto-rows-[240px]">
        {/* Timeline Bento (Span 8x2) */}
        <SpotlightCard className="lg:col-span-8 lg:row-span-2 p-10">
          <div className="h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-accent">
                <Calendar size={24} />
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">Schedule for {selectedState}</h3>
              </div>
              <p className="text-foreground-muted text-lg max-w-xl">
                Polling phases and registration windows synchronized with Election Commission of India databases.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12 mb-4">
              {ELECTION_SCHEDULES.filter(s => s.state === selectedState || s.state === 'Delhi').slice(0, 3).map((item, i) => (
                <div key={i} className="relative group cursor-pointer">
                  <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-white/[0.05] group-hover:bg-accent transition-colors" />
                  <div className="pl-4">
                    <div className="text-[10px] font-mono font-bold tracking-widest text-foreground-subtle uppercase mb-1">{item.date}</div>
                    <div className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">{item.label}</div>
                    <div className="text-sm text-foreground-muted mt-2">{item.phase} • {item.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>

        {/* Action Bento (Span 4x2) */}
        <SpotlightCard glowColor="rgba(255,255,255,0.05)" className="lg:col-span-4 lg:row-span-2 bg-white/40 backdrop-blur-md p-10 flex flex-col justify-between border border-white/60 shadow-lg">
          <div>
            <Building2 className="mb-6 text-accent" size={40} />
            <h3 className="text-2xl font-semibold text-foreground tracking-tight mb-4 leading-tight">ECI Node Sync</h3>
            <p className="text-foreground-muted text-sm leading-relaxed mb-6">Your local synchronization with the National Voter Service Portal is active. Data verified via EPIC interface.</p>
            <div className="space-y-3">
              {ECI_RESOURCES.slice(0, 2).map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-foreground-subtle">
                   <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                   {r.title}
                </div>
              ))}
            </div>
          </div>
          
          <button 
            onClick={() => onTabChange('registration')}
            className="bg-accent text-white w-full py-5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-accent-bright transition-all shadow-xl active:scale-95"
          >
            Access NVSP Portal <ChevronRight size={20} />
          </button>
        </SpotlightCard>
      </section>

      {/* Process Summary Card */}
      <SpotlightCard className="p-10 bg-accent/5 border-dashed border-accent/30">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="bg-accent/20 p-6 rounded-3xl text-accent">
            <Info size={40} />
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-semibold tracking-tight">The World's Largest Electoral Exercise</h4>
            <p className="text-foreground-muted leading-relaxed">
              India's elections are managed by the <strong>Election Commission of India (ECI)</strong>, an autonomous constitutional authority. 
              The process involves over 900 million eligible voters, utilizing Electronic Voting Machines (EVM) with Voter Verifiable Paper Audit Trail (VVPAT) 
              to ensure transparency and trust in every vote cast.
            </p>
          </div>
        </div>
      </SpotlightCard>

      <section className="space-y-12 py-12 scroll-mt-24" id="lifecycle" aria-labelledby="lifecycle-heading">
        <div className="text-center space-y-4">
          <h3 id="lifecycle-heading" className="text-4xl font-semibold tracking-tight text-gradient">Interactive <span className="text-accent-gradient">Election Guide</span></h3>
          <p className="text-foreground-muted max-w-xl mx-auto">Select a phase to explore the protocols and steps involved in the Indian election process.</p>
        </div>

        <div className="space-y-8">
          {/* Stepper Header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative" role="tablist">
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 hidden md:block" />
            {phases.map((phase, i) => (
              <motion.button
                key={i}
                role="tab"
                aria-selected={activeStep === i}
                aria-label={`Phase ${phase.step}: ${phase.title}`}
                onClick={() => setActiveStep(i)}
                whileHover={{ y: -5 }}
                className={`relative p-6 rounded-3xl border transition-all text-left group overflow-hidden ${
                  activeStep === i 
                  ? 'bg-white/60 border-accent shadow-lg shadow-accent/10 backdrop-blur-md' 
                  : 'bg-white/20 border-white/40 opacity-60 hover:opacity-100 backdrop-blur-sm shadow-sm'
                }`}
              >
                <div className={`absolute -top-3 -left-3 w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-lg transition-colors ${
                   activeStep === i ? 'bg-accent text-white' : 'bg-white/5 text-white/40'
                }`}>
                  {phase.step}
                </div>
                <motion.div 
                  animate={activeStep === i ? { 
                    y: [0, -4, 0],
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className={`mb-4 p-3 rounded-xl w-fit transition-all ${
                    activeStep === i ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/20' : 'bg-white/5 text-accent'
                  }`}
                >
                  {(() => {
                    const Icon = phase.icon;
                    return <Icon size={20} aria-hidden="true" />;
                  })()}
                </motion.div>
                <h4 
                  style={activeStep !== i ? { color: '#110b0b' } : {}}
                  className={`text-sm font-bold tracking-tight ${activeStep === i ? 'text-white' : ''}`}
                >
                  {phase.title}
                </h4>
                {activeStep === i && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-accent/5 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Active Step Details */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              role="tabpanel"
              aria-labelledby={`tab-item-${activeStep}`}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white/40 border border-white/60 backdrop-blur-md rounded-[2.5rem] p-10 lg:p-16 relative overflow-hidden shadow-xl"
            >
              <div aria-live="polite" className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
                      Phase Step {phases[activeStep].step}
                    </div>
                  </div>
                  <h4 className="text-5xl font-black tracking-tight">{phases[activeStep].title}</h4>
                  <p 
                    style={{ color: '#0e0b0b' }}
                    className="text-xl leading-relaxed"
                  >
                    {phases[activeStep].desc}
                  </p>
                  <div className="p-6 rounded-2xl bg-accent/5 border border-accent/10">
                    <p className="text-sm font-medium text-white/90 leading-relaxed italic">
                      {phases[activeStep].details}
                    </p>
                  </div>
                </div>

                <div className="hidden lg:flex justify-center" aria-hidden="true">
                  <div 
                    className="w-64 h-64 rounded-full flex items-center justify-center relative shadow-[0_0_80px_rgba(37,99,235,0.1)]"
                    style={{ background: `radial-gradient(circle, ${phases[activeStep].color}20 0%, transparent 70%)` }}
                  >
                    <motion.div
                      key={activeStep}
                      initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
                      animate={{ 
                        scale: 1, 
                        rotate: 0, 
                        opacity: 0.8,
                        y: [0, -15, 0]
                      }}
                      transition={{ 
                        type: "spring",
                        damping: 12,
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" } 
                      }}
                    >
                      {(() => {
                        const ActiveIcon = phases[activeStep].icon;
                        return (
                          <ActiveIcon 
                            size={120} 
                            className="text-accent" 
                            style={{ color: phases[activeStep].color }}
                          />
                        );
                      })()}
                    </motion.div>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-dashed border-white/5 rounded-full" 
                    />
                  </div>
                </div>
              </div>

              {/* Step indicator footer */}
              <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-8">
                <div className="flex gap-2" aria-hidden="true">
                  {phases.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i <= activeStep ? 'w-8 bg-accent' : 'w-2 bg-white/10'
                      }`} 
                    />
                  ))}
                </div>
                <div className="flex gap-4">
                  <button 
                    disabled={activeStep === 0}
                    aria-label="Previous Step"
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all border border-white/5"
                  >
                    <ArrowLeft size={18} aria-hidden="true" />
                  </button>
                  <button 
                    disabled={activeStep === phases.length - 1}
                    aria-label="Next Step"
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="p-3 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all border border-white/5"
                  >
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ECI Protocols & MCC Section */}
      <section className="space-y-12 py-12 border-t border-white/5">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
              Regulatory Framework
            </div>
            <h3 className="text-4xl font-semibold tracking-tight leading-tight">
              Guardian of the <span className="text-accent-gradient">Ballot Box</span>
            </h3>
            <p className="text-foreground-muted text-lg leading-relaxed">
              The Election Commission of India (ECI) is an autonomous constitutional authority responsible for administering Union and State election processes in India.
            </p>
            
            <div className="space-y-6">
              {[
                { 
                  title: 'Free & Fair Mandate', 
                  desc: 'Ensures absolute neutrality by supervising entire election machinery, from police deployment to polling staff assignments.',
                  icon: ShieldCheck
                },
                { 
                  title: 'Voter Empowerment', 
                  desc: 'Manages the continuous updation of electoral rolls and implementation of the EPIC system to prevent identity fraud.',
                  icon: Users
                },
                { 
                  title: 'Technological Integrity', 
                  desc: 'Oversees the manufacturing and deployment of multi-layered secure EVMs and VVPAT systems.',
                  icon: Cpu
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className="mt-1 bg-white/5 p-3 rounded-xl text-accent group-hover:bg-accent group-hover:text-white transition-all">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">{item.title}</h4>
                    <p className="text-sm text-foreground-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <SpotlightCard className="bg-background-elevated/50 p-10 border-white/5">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gavel className="text-accent" size={24} />
                  <h4 className="text-xl font-bold">Model Code of Conduct</h4>
                </div>
                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[10px] font-bold text-emerald-400 uppercase">
                  Active during Elections
                </div>
              </div>
              
              <p className="text-sm text-foreground-muted leading-relaxed italic border-l-2 border-accent pl-4">
                "The MCC is a set of guidelines issued by the ECI for conduct of political parties and candidates during elections mainly with respect to speeches, polling day, polling booths, election manifestos, processions and general conduct."
              </p>

              <div className="grid gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Neutrality Enforcement</h5>
                  <p className="text-sm text-foreground-muted">Ministers and other authorities cannot announce any financial grants in any form or make promises thereof which may have the effect of influencing the voters.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Resource Restriction</h5>
                  <p className="text-sm text-foreground-muted">Governments in power cannot use official machinery, personnel, or public exchequer funds for campaigning purposes.</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                  <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-2">Social Harmony</h5>
                  <p className="text-sm text-foreground-muted">Prohibits activities like using caste/communal sentiments to lure voters or making speeches that cause tension between communities.</p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-white/5">
                <span className="text-xs text-foreground-subtle">Source: eci.gov.in (Official Guidelines)</span>
                <a 
                  href="https://eci.gov.in/files/file/15392-manual-on-model-code-of-conduct/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-accent hover:underline flex items-center gap-2"
                >
                  Read Full Manual <ExternalLink size={12} aria-hidden="true" />
                </a>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />
    </motion.div>
  );
}

const FAQSection = React.memo(function FAQSection() {
  const faqs = [
    {
      question: "How do I check if my name is in the electoral roll?",
      answer: "You can check your name on the official NVSP portal (voters.eci.gov.in) using your EPIC number or personal details. Alternatively, you can use our EPIC Integration tool to quickly verify your presence in the latest database sync.",
      icon: Search
    },
    {
      question: "Can I vote without a physical Voter ID card?",
      answer: "Yes! If your name is in the electoral roll, you can cast your vote using alternative identity documents approved by the ECI, such as Aadhaar Card, PAN Card, Driving License, or Bank Passbook with a photograph.",
      icon: ShieldCheck
    },
    {
      question: "Where can I see the criminal history of candidates in my area?",
      answer: "ECI mandates all candidates to publish their 'KYC' (Know Your Candidate) information. You can find detailed affidavits (Form 26) through our Candidates section, the ECI website, or the KYC mobile app.",
      icon: Gavel
    },
    {
      question: "Are Electronic Voting Machines (EVMs) tamper-proof?",
      answer: "EVMs are standalone machines (M3 version) that are not connected to any network (Internet, Wi-Fi, or Bluetooth). They are also complemented by VVPAT (Voter Verifiable Paper Audit Trail) which allows you to visually audit your vote.",
      icon: Cpu
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="space-y-12 py-12 border-t border-white/5 scroll-mt-24" id="faq">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">
          Knowledge Base
        </div>
        <h3 className="text-4xl font-semibold tracking-tight">Hacker's Guide to <span className="text-accent-gradient">Democracy</span></h3>
        <p className="text-foreground-muted max-w-xl mx-auto">Common queries regarding the electoral process, protocols, and security measures in the Indian context.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {faqs.map((faq, i) => (
          <SpotlightCard 
            key={i} 
            className={cn(
              "p-8 transition-all duration-300",
              openIndex === i ? "border-accent/40 bg-accent/[0.02]" : "border-white/5"
            )}
          >
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full text-left space-y-4"
              aria-expanded={openIndex === i}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl transition-all",
                    openIndex === i ? "bg-accent text-white" : "bg-white/5 text-accent"
                  )}>
                    <faq.icon size={20} />
                  </div>
                  <h4 className="text-lg font-bold tracking-tight leading-tight">{faq.question}</h4>
                </div>
                <div className={cn(
                  "mt-2 transition-transform duration-300",
                  openIndex === i ? "rotate-45" : "rotate-0"
                )}>
                  <ChevronRight size={20} className="text-foreground-muted" />
                </div>
              </div>
              
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="text-foreground-muted leading-relaxed pt-2 border-t border-white/5">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </SpotlightCard>
        ))}
      </div>

      <div className="text-center pt-8">
        <p className="text-sm text-foreground-subtle mb-6">Didn't find what you were looking for?</p>
        <a 
          href="https://eci.gov.in/faqs/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent font-bold hover:underline"
        >
          View All ECI FAQs <ExternalLink size={16} />
        </a>
      </div>
    </section>
  );
});

const RegistrationView = React.memo(function RegistrationView() {
  const { user, profile } = useFirebase();
  const [birthDate, setBirthDate] = useState<string>(profile?.birthDate || '');
  const [isCalculated, setIsCalculated] = useState(profile?.birthDate ? true : false);
  const [age, setAge] = useState<number | null>(null);

  const steps = [
    { title: 'EPIC Data Sync', desc: 'Securely verify your Electors Photo Identification Card (EPIC) details via NVSP.', icon: TargetIcon },
    { title: 'Form Verification', desc: 'Confirm state-specific eligibility and constituency benchmarks.', icon: ClipboardList },
    { title: 'Protocol Execution', desc: 'Secure transmission of voter registration updates to ECI nodes.', icon: Radio },
  ];

  useEffect(() => {
    if (profile?.birthDate) {
      setBirthDate(profile.birthDate);
      const birth = new Date(profile.birthDate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
      setIsCalculated(true);
    }
  }, [profile?.birthDate]);

  const checkEligibility = async () => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge);
    setIsCalculated(true);

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        birthDate: birthDate,
        isEligible: calculatedAge >= 18,
        updatedAt: new Date()
      });
    }
  };

  const isEligible = age !== null && age >= 18;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto space-y-24"
    >
      <div className="text-center space-y-6">
        <h2 className="text-5xl md:text-7xl font-semibold tracking-tight text-gradient font-display">EPIC <span className="text-accent-gradient">Integration</span></h2>
        <p className="text-foreground-muted text-xl max-w-2xl mx-auto leading-relaxed">
          The national standard for voter registration. Follow the encrypted protocol to establish your democratic footprint.
        </p>
      </div>

      {/* Interactive Eligibility Checker */}
      <section className="space-y-8 scroll-mt-24" id="eligibility-checker">
        <div className="flex items-center gap-3 border-l-4 border-accent pl-6">
          <ShieldCheck className="text-accent" />
          <h3 className="text-2xl font-semibold tracking-tight">Eligibility Sentinel</h3>
        </div>
        
        <SpotlightCard className="p-10 bg-white/40 backdrop-blur-md border border-white/60 shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h4 className="text-3xl font-bold tracking-tight">Are you ready to vote?</h4>
              <p className="text-foreground-muted leading-relaxed">
                Enter your date of birth to check if you fulfill the minimum age requirement (18 years) for voter registration as per ECI guidelines.
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={20} />
                  <input 
                    type="date"
                    value={birthDate}
                    aria-label="Date of Birth"
                    onChange={(e) => {
                      setBirthDate(e.target.value);
                      setIsCalculated(false);
                    }}
                    className="w-full bg-white/50 border border-white/80 rounded-2xl pl-12 pr-6 py-4 outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
                  />
                </div>
                <button 
                  onClick={checkEligibility}
                  aria-label="Verify Age Eligibility"
                  className="w-full bg-accent text-white py-4 rounded-2xl font-bold shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Verify Legal Age <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="relative flex justify-center">
              <AnimatePresence mode="wait">
                {!isCalculated ? (
                  <motion.div 
                    key="waiting"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="w-64 h-64 rounded-full border-4 border-dashed border-accent/10 flex flex-col items-center justify-center gap-4 text-center p-8 bg-accent/5"
                  >
                    <Info className="text-accent/40" size={48} />
                    <p className="text-xs font-bold text-accent/40 uppercase tracking-widest leading-normal">Awaiting Input Verification</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="result"
                    initial={{ opacity: 0, rotateY: 90 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className={`w-64 h-64 rounded-full flex flex-col items-center justify-center gap-4 p-8 text-center shadow-2xl relative ${
                      isEligible ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                    >
                      {isEligible ? (
                        <CheckCircle2 className="text-emerald-500" size={64} />
                      ) : (
                        <Info className="text-red-500" size={64} />
                      )}
                    </motion.div>
                    <div>
                      <div className={`text-2xl font-black ${isEligible ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isEligible ? 'ELIGIBLE' : 'INELIGIBLE'}
                      </div>
                      <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-tight">
                        Age: {age} Years
                      </p>
                    </div>
                    {isEligible && (
                      <div className="absolute inset-0 bg-emerald-400/10 rounded-full animate-ping pointer-events-none" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SpotlightCard>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <SpotlightCard key={i} className="p-8 group">
            <div className="flex flex-col h-full gap-12">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl text-accent group-hover:scale-110 group-hover:bg-accent/10 transition-all duration-500">
                  <step.icon size={24} />
                </div>
                <span className="text-5xl font-mono font-black text-white/[0.03] group-hover:text-white/[0.08] transition-colors">{i + 1}</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 tracking-tight">{step.title}</h3>
                <p className="text-foreground-muted text-sm leading-relaxed">{step.desc}</p>
              </div>
              <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/[0.04]">
                <span className="text-[10px] font-mono font-bold tracking-widest text-foreground-subtle uppercase">ECI Compliance</span>
                <div className="w-2 h-2 rounded-full bg-accent" />
              </div>
            </div>
          </SpotlightCard>
        ))}
      </div>

      <SpotlightCard className="p-1 px-1 bg-gradient-to-r from-accent/30 via-blue-400/30 to-accent/30 rounded-3xl">
        <div className="bg-white/60 backdrop-blur-md rounded-[22px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
          <div className="bg-accent/10 p-6 rounded-2xl text-accent shadow-[0_0_30px_rgba(94,106,210,0.2)]">
            <Building2 size={48} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h4 className="text-3xl font-semibold tracking-tight">Voter Helpline Portal</h4>
            <p className="text-foreground-muted text-lg">Direct digital uplink for EPIC registration, status checks, and constituency modifications.</p>
          </div>
          <a 
            href="https://voters.eci.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black px-10 py-5 rounded-xl font-bold transition-all shadow-2xl hover:scale-105 active:scale-95 whitespace-nowrap block text-center"
          >
            Launch NVSP Portal
          </a>
        </div>
      </SpotlightCard>

      <section className="space-y-8">
        <h3 className="text-2xl font-semibold tracking-tight border-l-4 border-accent pl-6">ECI Compliance Checklist</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: 'Aadhaar Linkage', status: 'Mandatory for Sync' },
            { label: 'EPIC Verification', status: 'Secure Access' },
            { label: 'Constituency Mapping', status: 'Precision Required' },
            { label: 'Voter Slip Issuance', status: 'Phase Dependent' }
          ].map((item, i) => (
            <SpotlightCard key={i} className="p-6 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{item.label}</span>
                <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-1 rounded">{item.status}</span>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>
    </motion.div>
  );
});


function CandidatesView({ selectedState }: { selectedState: string }) {
  const filteredCandidates = MOCK_CANDIDATES.filter(c => c.state === selectedState);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ ease: [0.16, 1, 0.3, 1] }}
      className="space-y-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <h2 className="text-5xl font-semibold tracking-tight text-gradient">Symbol <span className="text-accent-gradient">Registry</span></h2>
          <p className="text-foreground-muted text-xl max-w-xl leading-relaxed">Impartial logical profiles and election symbols for {selectedState} candidates.</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white/40 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm">
          <Flag size={16} className="text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest">{selectedState} Jurisdiction</span>
        </div>
      </div>

      {filteredCandidates.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCandidates.map((c) => (
            <SpotlightCard key={c.id} className="p-10 flex flex-col h-full hover:y-[-8px] transition-transform">
              <div className="flex items-start justify-between mb-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-accent/40 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img src={c.avatar} alt={c.name} className="relative w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/10 shadow-2xl p-1" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-[0.2em] border",
                    c.party.includes('BJP') ? "bg-orange-500/10 border-orange-500/30 text-orange-400" : 
                    c.party.includes('INC') ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : 
                    "bg-white/5 border-white/10 text-white/50"
                  )}>
                    {c.party.split('(')[1]?.replace(')', '') || c.state}
                  </div>
                  <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{c.partySymbol}</div>
                </div>
              </div>
              
              <div className="mb-8 flex-1">
                <h3 className="text-3xl font-semibold tracking-tight mb-2">{c.name}</h3>
                <p className="text-accent text-[10px] font-mono font-bold tracking-[0.3em] uppercase">{c.role}</p>
                <div className="my-8 w-12 h-px bg-white/[0.06]" />
                <p className="text-foreground-muted text-sm leading-relaxed italic opacity-80">"{c.vision}"</p>
              </div>
              
              <a 
                href={`https://voters.eci.gov.in/candidate-affidavit`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white/[0.03] hover:bg-accent hover:text-white text-foreground border border-white/10 py-5 rounded-xl font-bold transition-all flex items-center justify-center gap-3 group"
              >
                Review Assets <Globe size={16} className="group-hover:rotate-12 transition-transform" aria-hidden="true" />
              </a>
            </SpotlightCard>
          ))}
        </div>
      ) : (
        <SpotlightCard className="p-20 text-center space-y-4">
          <div className="text-accent-gradient text-4xl">NO DATA SYNC</div>
          <p className="text-foreground-muted">Candidate data for this jurisdiction has not been broadcast yet.</p>
        </SpotlightCard>
      )}
    </motion.div>
  );
}

function PollingView({ selectedState }: { selectedState: string }) {
  const { user, profile } = useFirebase();
  const [search, setSearch] = useState('');
  const [liveStatus, setLiveStatus] = useState('Live Link');
  const [stationActivity, setStationActivity] = useState<Record<string, number>>({});
  
  const filteredStations = MOCK_STATIONS.filter(s => s.state === selectedState);

  const toggleSaveStation = async (stationId: string) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const isSaved = profile?.savedStations?.includes(stationId);
    
    await updateDoc(userRef, {
      savedStations: isSaved ? arrayRemove(stationId) : arrayUnion(stationId)
    });
  };

  // Simulate real-time updates
  useEffect(() => {
    const statusCycle = ['Live Link', 'Syncing Nodes', 'Verifying Data', 'Grid Peak', 'Node Secure'];
    let statusIndex = 0;

    const interval = setInterval(() => {
      // Rotate live status
      statusIndex = (statusIndex + 1) % statusCycle.length;
      setLiveStatus(statusCycle[statusIndex]);

      // Randomize activity for current state stations
      const newActivity: Record<string, number> = {};
      filteredStations.forEach(s => {
        newActivity[s.id] = Math.floor(Math.random() * 60) + 40; // 40-100% activity
      });
      setStationActivity(newActivity);
    }, 4000);

    return () => clearInterval(interval);
  }, [filteredStations.length]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ ease: [0.16, 1, 0.3, 1] }}
      className="grid lg:grid-cols-12 gap-8 h-[700px] min-h-[600px]"
    >
      {/* Locations List */}
      <div className="lg:col-span-5 flex flex-col gap-10">
        <div className="space-y-6">
          <h2 className="text-5xl font-semibold tracking-tight text-gradient">Node <span className="text-accent-gradient">Discovery</span></h2>
          <p className="text-foreground-muted text-lg">Polling protocols for {selectedState}. Filtered by coordinate mapping.</p>
        <div className="relative group">
          <label htmlFor="constituency-search" className="sr-only">Search constituencies</label>
          <Search 
            id="search-icon"
            className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground-subtle group-focus-within:text-accent transition-colors" 
            size={20} 
            aria-hidden="true" 
          />
          <input 
            id="constituency-search"
            type="text" 
            placeholder="Constituency search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-[var(--glass-blur)] shadow-sm rounded-2xl pl-14 pr-6 py-5 focus:ring-4 focus:ring-accent/5 focus:border-accent transition-all outline-none text-foreground text-sm font-medium"
          />
        </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-3 scrollbar-custom">
          {filteredStations.length > 0 ? filteredStations.map((station) => (
            <SpotlightCard key={station.id} className="p-6 cursor-pointer group active:scale-[0.98]">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-xl font-semibold tracking-tight text-foreground group-hover:text-accent transition-colors">{station.name}</h4>
                <div className="flex items-center gap-2">
                  {user && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveStation(station.id);
                      }}
                      className={cn(
                        "p-2 rounded-lg transition-all",
                        profile?.savedStations?.includes(station.id) 
                          ? "bg-accent/20 text-accent" 
                          : "bg-white/5 text-foreground-subtle hover:bg-white/10"
                      )}
                    >
                      <TargetIcon size={14} className={profile?.savedStations?.includes(station.id) ? "fill-accent" : ""} />
                    </button>
                  )}
                  <div className="text-[10px] font-mono font-bold bg-accent/10 text-accent px-3 py-1 rounded-lg border border-accent/20">{station.distance}</div>
                </div>
              </div>
              
              {/* Activity indicator */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${stationActivity[station.id] || 50}%`,
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{
                      opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="h-full bg-accent"
                  />
                </div>
                <span className="text-[9px] font-mono font-bold text-accent/60 uppercase tracking-tighter">
                  Load: {stationActivity[station.id] || '--'}%
                </span>
              </div>

              <p className="text-foreground-muted text-sm mb-6 leading-relaxed">{station.address}</p>
              <div className="flex items-center justify-between gap-6 text-[10px] font-mono font-bold uppercase tracking-widest text-foreground-subtle">
                <div className="flex items-center gap-2">
                   <Calendar size={14} className="text-accent" aria-hidden="true" />
                   {station.hours}
                </div>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${station.name} ${station.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline flex items-center gap-1"
                >
                  Directions <ExternalLink size={12} />
                </a>
              </div>
            </SpotlightCard>
          )) : (
            <div className="p-10 border border-white/10 rounded-3xl text-center opacity-40">
              NO LOCAL NODES IN SYNC
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map (Real Leaflet) */}
      <SpotlightCard className="lg:col-span-7 h-full bg-slate-100 relative overflow-hidden p-0 border border-black/[0.05] shadow-lg">
        <div className="absolute inset-0 z-0">
          <ElectionMap 
            stations={filteredStations} 
            center={STATE_COORDINATES[selectedState] || [20.5937, 78.9629]} 
            activities={stationActivity}
          />
        </div>
        
        {/* Map Overlays (Non-blocking) */}
        <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none p-10 bg-gradient-to-t from-white/95 to-transparent">
          <div className="pointer-events-auto">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-3xl font-bold tracking-tight text-slate-900">Node Matrix: {selectedState}</h3>
              <AnimatePresence mode="wait">
                <motion.div 
                  key={liveStatus}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-accent/10 border border-accent/20 px-2.5 py-1 rounded text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1.5"
                >
                  <motion.span
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Radio size={10} />
                  </motion.span>
                  {liveStatus}
                </motion.div>
              </AnimatePresence>
            </div>
            <p className="text-foreground-muted text-sm max-w-sm mb-6">Spatial mapping interface active for {selectedState}. Interactive booths are highlighted.</p>
            
            <div className="flex gap-4">
              <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-[var(--glass-blur)] px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-2 h-2 bg-accent rounded-full shadow-[0_0_10px_rgba(230,81,0,0.4)]" 
                />
                <span className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">Polling Node</span>
              </div>
              <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] backdrop-blur-[var(--glass-blur)] px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Globe size={12} className="text-accent" />
                </motion.div>
                <span className="text-[10px] font-bold tracking-widest text-slate-700 uppercase">ECI Grid Sync</span>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.div>
  );
}
