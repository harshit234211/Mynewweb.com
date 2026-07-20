// @ts-nocheck
/* eslint-disable */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import TemplatesManager from '../components/TemplatesManager';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Home as HomeIcon, Menu, Bell, ChevronLeft,
  Clock, User, LogOut, Plus,
  CheckCircle, XCircle, RefreshCw,
  TrendingUp, Gift, Sun, Moon, Coins,
  Eye, EyeOff, Facebook, Twitter, Mail
} from 'lucide-react';
import { useTheme } from 'next-themes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Game categories with colors
const GAME_CATEGORIES = [
  { id: 'BR Survival',      label: 'BR SURVIVAL',         color: '#e74c3c', bg: 'from-red-900 to-orange-800',   icon: '🎯' },
  { id: 'BR Per Kill',      label: 'BR PER KILL',          color: '#f39c12', bg: 'from-yellow-900 to-orange-700', icon: '💀' },
  { id: 'Lone Wolf 1v1',    label: 'LONE WOLF 1V1',        color: '#16a085', bg: 'from-teal-900 to-cyan-800',    icon: '🐺' },
  { id: 'Lone Wolf 2v2',    label: 'LONE WOLF 2V2',        color: '#27ae60', bg: 'from-green-900 to-teal-800',   icon: '🔥' },
  { id: 'Clash Squad 1v1',  label: 'CLASH SQUAD 1V1',      color: '#8e44ad', bg: 'from-purple-900 to-blue-800',  icon: '⚔️' },
  { id: 'Clash Squad 2v2',  label: 'CLASH SQUAD 2V2',      color: '#9b59b6', bg: 'from-fuchsia-900 to-purple-800', icon: '⚔️' },
  { id: 'Clash Squad 4v4',  label: 'CLASH SQUAD 4V4',      color: '#2980b9', bg: 'from-blue-900 to-indigo-800',  icon: '🛡️' },
  { id: 'CS Headshot',      label: 'CS HEADSHOT',          color: '#c0392b', bg: 'from-red-950 to-rose-800',     icon: '🔫' },
  { id: 'Sniper Only',      label: 'SNIPER ONLY',          color: '#34495e', bg: 'from-slate-800 to-gray-800',   icon: '🎯' },
  { id: 'Free Tournament',  label: 'FREE TOURNAMENT',      color: '#1abc9c', bg: 'from-emerald-900 to-green-700',icon: '🎁' },
];


function parseMatchDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return new Date();
  const [day, month, year] = dateStr.split('/');
  const [time, ampm] = timeStr.split(' ');
  let [hours, mins] = time.split(':');
  hours = parseInt(hours);
  if (ampm && ampm.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (ampm && ampm.toUpperCase() === 'AM' && hours === 12) hours = 0;
  
  const d = new Date();
  d.setFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
  d.setHours(hours, parseInt(mins), 0, 0);
  return d;
}

const CountdownTimer = ({ match }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const timer = setInterval(() => {
      const matchTime = parseMatchDate(match.date, match.time);
      const now = new Date();
      const diff = matchTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('LIVE');
      } else {
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(d + ' Days : ' + h + ' Hours : ' + m + ' Minutes : ' + s + ' Seconds');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [match]);

  if (timeLeft === 'LIVE') {
    return <div className="mt-2 mb-2 text-center font-black text-red-500 animate-pulse uppercase tracking-widest text-lg border-2 border-red-500 rounded py-1">🔴 LIVE</div>;
  }
  
  return (
    <div className="mt-3 mb-2 bg-bgPrimary border border-borderColor rounded-lg p-2 text-center shadow-inner">
      <p className="text-[10px] text-textSecondary font-bold uppercase mb-1 tracking-wider">Starts In</p>
      <p className="text-sm font-black text-[#132040] tabular-nums tracking-wide">{timeLeft}</p>
    </div>
  );
};

function getTimeLeft(date: string, time: string) {
  try {
    const matchTime = new Date(`${date} ${time}`);
    const now = new Date();
    const diff = matchTime.getTime() - now.getTime();
    if (diff <= 0) return '0d 0h 0m 0s';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${d}d ${h}h ${m}m ${s}s`;
  } catch { return '--'; }
}

const getCategoryThumbnail = (category, categoryBanners = {}) => {
  const cat = category?.toLowerCase() || '';
  
  // 1. Check if admin uploaded a custom dynamic banner for this category
  if (categoryBanners && category && categoryBanners[category]) {
    return categoryBanners[category];
  }

  // 2. Fallbacks
  if (cat.includes('headshot')) {
    return '/cs_headshot.png';
  }
  if (cat.includes('clash squad 4v4') || cat.includes('cs 4v4')) {
    return '/clash_squad_4v4.png';
  }
  if (cat.includes('per kill') || cat.includes('kill')) {
    return '/br_per_kill.png';
  }
  if (cat.includes('survival') || cat.includes('royale') || (cat.includes('squad') && !cat.includes('clash'))) {
    return '/br_survival.png';
  }
  if (cat.includes('clash') || cat.includes('cs')) {
    return '/clash_squad.png';
  }
  if (cat.includes('lone') || cat.includes('wolf')) {
    return '/lone_wolf.png';
  }
  return '/br_survival.png'; // default fallback
};

const getSpecialBanner = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('1v1') || cat.includes('custom')) {
    return '/banners/1v1.jpeg';
  }
  if (cat.includes('2v2')) {
    return '/banners/2v2.jpeg';
  }
  if (cat.includes('4v4')) {
    return '/banners/4v4.jpeg';
  }
  return null;
};

const getIsUpcoming = (match) => {
  try {
    const matchTime = new Date(`${match.date} ${match.time}`);
    const now = new Date();
    return matchTime.getTime() > now.getTime();
  } catch {
    return true;
  }
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Auth
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegister, setIsRegister] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [referCodeInput, setReferCodeInput] = useState('');

  // Navigation
  const [activeNav, setActiveNav] = useState<'home' | 'earn' | 'wallet' | 'leaderboard' | 'menu'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [contestTab, setContestTab] = useState<'ongoing' | 'upcoming' | 'completed'>('upcoming');
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  // Profile & Menu Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | 'about' | null>(null);
  const [profileForm, setProfileForm] = useState({ ffName: '', ffUid: '', username: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [importantNoticeOn, setImportantNoticeOn] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, ...data });
        setShowProfileModal(false);
        alert('Profile updated successfully!');
      } else alert(data.msg || 'Update failed');
    } catch { alert('Error updating profile'); }
  };

  const handleUserChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify(passwordForm)
      });
      const data = await res.json();
      if (res.ok) {
        setShowPasswordModal(false);
        setPasswordForm({ oldPassword: '', newPassword: '' });
        alert('Password changed successfully!');
      } else alert(data.msg || 'Change failed');
    } catch { alert('Error changing password'); }
  };
  const [showJoinings, setShowJoinings] = useState(false);
  const [selectedMyMatchesTab, setSelectedMyMatchesTab] = useState(null);

  // Data
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [myMatches, setMyMatches] = useState<any[]>([]);
  const [clans, setClans] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [categoryBanners, setCategoryBanners] = useState<any>({});
  const [globalAnnouncement, setGlobalAnnouncement] = useState('');
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [editingSlotFor, setEditingSlotFor] = useState<string | null>(null);
  const [newSlot, setNewSlot] = useState('');
  const [newPosition, setNewPosition] = useState('');

  // Match detail state
  const [timeLeft, setTimeLeft] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState('');
  const [successWithdrawal, setSuccessWithdrawal] = useState<any>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Admin / Host
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [newMatch, setNewMatch] = useState({
    title: '', category: 'BR Survival', date: '', time: '',
    entryFee: '', prizePool: '', perKill: '0', totalSlots: '20',
    teamType: 'Solo', mode: 'Solo', map: 'Bermuda', matchType: 'Paid',
    rules: '',
    prizeDistribution: '1st:55,2nd:40,3rd:35,4th:30,5th:30'
  });

  // Wallet
  const [showWallet, setShowWallet] = useState(false);
  const [depositAmt, setDepositAmt] = useState('');
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [withdrawUpi, setWithdrawUpi] = useState('');
  const [showDepositQR, setShowDepositQR] = useState(false);
  const [walletMsg, setWalletMsg] = useState('');
  const [depositUtr, setDepositUtr] = useState('');

  // Profile
  const [showProfile, setShowProfile] = useState(false);
  const [ffName, setFfName] = useState('');
  const [ffUid, setFfUid] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([{ id: 1, text: 'Welcome to FragArena!' }]);
  const [showNotifications, setShowNotifications] = useState(false);

  const timerRef = useRef<any>(null);
  // Ref to track current nav state for popstate handler without stale closures
  const navStateRef = useRef({ showJoinings: false, selectedMatch: null as any, selectedCategory: null as any, selectedMyMatchesTab: null as any, showWallet: false, showProfile: false, activeNav: 'home' as string });

  const getHeaders = useCallback((tk?: string | null) => ({
    'Content-Type': 'application/json',
    'x-auth-token': tk || token || ''
  }), [token]);

  // ─── Auth ────────────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = isRegister ? 'register' : 'login';
      const body: any = { phone: phoneInput, password: passwordInput };
      if (isRegister) {
        if (passwordInput !== confirmPasswordInput) {
          setAuthError('Passwords do not match');
          return;
        }
        body.username = usernameInput;
        body.referCode = referCodeInput;
        body.email = emailInput;
        body.firstName = firstNameInput;
        body.lastName = lastNameInput;
      }
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.msg || 'Error'); return; }
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setFfName(data.user.ffName || '');
      setFfUid(data.user.ffUid || '');
      subscribeToPush(data.token);
    } catch { setAuthError('Connection failed'); }
  };

  const subscribeToPush = async (tk) => {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BO_atOzAOjGH9cahv4qOWBDbsWbX8eVjfDn0bZWOV3r1XMt395vZdSRxrOYfduqxtk0NhhG7ZWMnrWAZLiTX9uI'
        });
        await fetch(`${API_URL}/admin/notifications/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': tk },
          body: JSON.stringify({ subscription })
        });
      }
    } catch (e) { console.error('Push error:', e); }
  };

  // ─── Load Data ────────────────────────────────────────────────────────────
  const loadTournaments = useCallback(async () => {
    try {
      console.log('Fetching tournaments from API...');
      const res = await fetch(`${API_URL}/tournaments?t=${new Date().getTime()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      const data = await res.json();
      console.log('1. Raw API Response:', data);
      setTournaments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error fetching tournaments:', e);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/clans/ranking`);
      const data = await res.json();
      setClans(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  // ─── Effect 1: Auth + initial tournament load (runs once on mount) ────────
  useEffect(() => {
    const tk = localStorage.getItem('token');
    if (tk) {
      setToken(tk);
      fetch(`${API_URL}/auth/me`, { headers: { 'x-auth-token': tk } })
        .then(r => r.json()).then(d => {
          if (d._id) { setUser(d); setFfName(d.ffName || ''); setFfUid(d.ffUid || ''); subscribeToPush(tk); }
          else { localStorage.removeItem('token'); }
        }).catch(() => { localStorage.removeItem('token'); })
        .finally(() => setLoading(false));
    } else { setLoading(false); }

    fetch(`${API_URL}/admin/settings/category-banners`)
      .then(r => r.json())
      .then(d => { if (d && !d.error) setCategoryBanners(d); })
      .catch(e => console.error(e));

    fetch(`${API_URL}/admin/settings/promo-banners`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPromoBanners(d); })
      .catch(e => console.error(e));

    fetch(`${API_URL}/admin/settings/announcement`)
      .then(r => r.json())
      .then(d => { 
        if (d && d.message) {
          setGlobalAnnouncement(d.message);
          setNotifications([{ id: Date.now(), text: d.message }, { id: 1, text: 'Welcome to FragArena!' }]);
        }
      })
      .catch(e => console.error(e));

    loadTournaments();
  }, []); // eslint-disable-line

  // ─── Effect 2: Auto-refresh polling every 5 seconds ──────────────────────
  useEffect(() => {
    const pollInterval = setInterval(loadTournaments, 5000);
    return () => clearInterval(pollInterval);
  }, [loadTournaments]);

  // ─── Effect 3: Keep navStateRef in sync with current nav state ────────────
  useEffect(() => {
    navStateRef.current = { showJoinings, selectedMatch, selectedCategory, selectedMyMatchesTab, showWallet, showProfile, activeNav };
  }, [showJoinings, selectedMatch, selectedCategory, selectedMyMatchesTab, showWallet, showProfile, activeNav]);

  // ─── Effect 4: Back button / popstate handler (runs once on mount) ────────
  useEffect(() => {
    // Push a dummy state so the back button triggers popstate instead of navigating away
    window.history.pushState({ fragArena: true }, '');

    const handlePopState = () => {
      const nav = navStateRef.current;
      // Restore history entry so back button keeps working
      window.history.pushState({ fragArena: true }, '');

      if (nav.showJoinings) {
        setShowJoinings(false);
      } else if (nav.selectedMatch) {
        setSelectedMatch(null);
      } else if (nav.selectedCategory) {
        setSelectedCategory(null);
      } else if (nav.selectedMyMatchesTab) {
        setSelectedMyMatchesTab(null);
      } else if (nav.showWallet) {
        setShowWallet(false);
      } else if (nav.showProfile) {
        setShowProfile(false);
      } else if (nav.activeNav !== 'home') {
        setActiveNav('home');
      } else {
        // Already on home — show exit confirmation
        setShowExitConfirm(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []); // eslint-disable-line

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA installation');
    }
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  // Timer for match detail
  useEffect(() => {
    if (selectedMatch) {
      const tick = () => setTimeLeft(getTimeLeft(selectedMatch.date, selectedMatch.time));
      tick();
      timerRef.current = setInterval(tick, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [selectedMatch]);

  // Compute my matches
  useEffect(() => {
    if (user && tournaments.length) {
      const uid = user.id || user._id;
      setMyMatches(tournaments.filter(t => 
        (t.host && (t.host._id === uid || t.host === uid)) ||
        t.joinedPlayers?.some((p: any) => p.user === uid || p.user?._id === uid)
      ));
    }
  }, [user, tournaments]);

  // ─── Join Match ───────────────────────────────────────────────────────────
  const handleJoin = async (matchId: string) => {
    if (!user?.ffName || !user?.ffUid) {
      setJoinSuccess('Please update your FF Name & UID in profile first!');
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`${API_URL}/tournaments/${matchId}/join`, {
        method: 'POST', headers: getHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        setJoinSuccess('✅ Successfully joined!');
        loadTournaments();
      } else { setJoinSuccess(data.msg || 'Failed to join'); }
    } catch { setJoinSuccess('Connection error'); }
    setJoining(false);
    setTimeout(() => setJoinSuccess(''), 3000);
  };

  // ─── Create Match (Admin/Host) ────────────────────────────────────────────
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Parse prize distribution
      const prizeDist = newMatch.prizeDistribution.split(',').map((p, i) => {
        const parts = p.trim().split(':');
        return { rank: i + 1, prize: parseInt(parts[1] || '0') };
      });
      const rulesArr = newMatch.rules.split('\n').filter(r => r.trim());
      const res = await fetch(`${API_URL}/admin/tournaments/create`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({
          ...newMatch,
          hostId: user.id || user._id,
          entryFee: parseInt(newMatch.entryFee),
          prizePool: parseInt(newMatch.prizePool),
          perKill: parseInt(newMatch.perKill),
          totalSlots: parseInt(newMatch.totalSlots),
          prizeDistribution: prizeDist,
          rules: rulesArr
        })
      });
      if (res.ok) {
        setShowCreateMatch(false);
        setNewMatch({ title: '', category: 'BR Survival', date: '', time: '', entryFee: '', prizePool: '', perKill: '0', totalSlots: '20', teamType: 'Solo', mode: 'Solo', map: 'Bermuda', matchType: 'Paid', rules: '', prizeDistribution: '1st:55,2nd:40,3rd:35,4th:30,5th:30' });
        loadTournaments();
        alert('Match created successfully!');
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.msg || 'Failed to create match'}`);
      }
    } catch (e) {
      alert('Network error while creating match');
    }
  };

  // ─── Wallet ───────────────────────────────────────────────────────────────
  const handleDeposit = async () => {
    setShowDepositQR(true);
  };
  const handleWithdraw = async () => {
    if (!withdrawAmt || !withdrawUpi) { setWalletMsg('Enter amount and UPI ID'); return; }
    try {
      const res = await fetch(`${API_URL}/wallet/withdraw/request`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ amount: parseInt(withdrawAmt), upiId: withdrawUpi })
      });
      const data = await res.json();
      if (res.ok) {
        setWalletMsg('✅ Withdrawal requested!');
        setSuccessWithdrawal({
          txId: data.transaction?.txId || 'N/A',
          amount: data.transaction?.amount || withdrawAmt
        });
        setWithdrawAmt('');
        setWithdrawUpi('');
      } else {
        setWalletMsg(data.msg || 'Failed');
      }
    } catch { setWalletMsg('Connection error'); }
    setTimeout(() => setWalletMsg(''), 4000);
  };

  const handleVerifyDeposit = async () => {
    if (!depositUtr || depositUtr.trim().length < 6) {
      setWalletMsg('Please enter a valid Transaction ID / UTR');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/wallet/deposit/manual`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ amount: parseInt(depositAmt), utr: depositUtr })
      });
      const data = await res.json();
      if (res.ok) {
        setWalletMsg('✅ Deposit Request Submitted! Wait for Admin Verification.');
        setShowDepositQR(false);
        setDepositUtr('');
      } else {
        setWalletMsg(data.msg || 'Submit failed');
      }
    } catch {
      setWalletMsg('Connection error');
    }
    setTimeout(() => setWalletMsg(''), 3000);
  };

  // ─── Profile Update ───────────────────────────────────────────────────────
  const handleProfileUpdate = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ ffName, ffUid })
      });
      if (res.ok) {
        const meRes = await fetch(`${API_URL}/auth/me`, { headers: getHeaders() });
        const me = await meRes.json();
        if (me._id) setUser(me);
        setShowProfile(false);
      }
    } catch {}
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null); setUser(null);
    setSelectedCategory(null); setSelectedMatch(null);
  };

  // ─── Filtered tournaments ─────────────────────────────────────────────────
  const categoryTournaments = selectedCategory
    ? tournaments.filter(t => {
        if (!t.category) return false;
        if (selectedCategory === 'Other') {
          return !GAME_CATEGORIES.some(c => c.id.toLowerCase() === t.category.toLowerCase() && c.id !== 'Other');
        }
        return t.category.toLowerCase() === selectedCategory.toLowerCase();
      })
    : [];

  const filteredByTab = categoryTournaments.filter(t => {
    if (!t.status) return false;
    const status = t.status.toLowerCase();
    if (contestTab === 'ongoing') return status === 'ongoing';
    if (contestTab === 'upcoming') return status === 'upcoming';
    if (contestTab === 'completed') return status === 'completed';
    return true;
  });

  // Logging filtered and final rendered lists as requested
  useEffect(() => {
    if (selectedCategory) {
      console.log('2. Filtered tournaments for category:', selectedCategory, categoryTournaments);
      console.log('3. Final rendered tournaments for tab:', contestTab, filteredByTab);
    }
  }, [selectedCategory, contestTab, tournaments, categoryTournaments, filteredByTab]);

  // ─── Loading Screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a1628]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#f5c518] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#f5c518] font-bold text-lg tracking-widest">LOADING...</p>
        </div>
      </div>
    );
  }

  // ─── Auth Screen ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#f5c518] to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-2xl">
              <Trophy className="w-10 h-10 text-textPrimary" />
            </div>
            <h1 className="text-3xl font-black text-textPrimary tracking-widest">FRAGARENA</h1>
            <p className="text-[#f5c518] text-sm font-semibold tracking-wider mt-1">KHILADIBATTLE</p>
          </div>

          <div className="bg-bgSurface rounded-2xl p-6 shadow-2xl border border-[#1e3a6e]">
            <div className="flex rounded-xl overflow-hidden mb-6 bg-[#0a1628]">
              <button onClick={() => setIsRegister(false)}
                className={`flex-1 py-2.5 text-sm font-bold ${!isRegister ? 'bg-[#f5c518] text-black' : 'text-textSecondary'}`}>
                LOGIN
              </button>
              <button onClick={() => setIsRegister(true)}
                className={`flex-1 py-2.5 text-sm font-bold ${isRegister ? 'bg-[#f5c518] text-black' : 'text-textSecondary'}`}>
                REGISTER
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegister && (
                <>
                  <input type="email" placeholder="Gmail Address" value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    className="w-full bg-[#0a1628] border border-[#1e3a6e] rounded-xl px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#f5c518]" required />
                  
                  <div className="flex gap-4">
                    <input type="text" placeholder="First Name" value={firstNameInput}
                      onChange={e => setFirstNameInput(e.target.value)}
                      className="w-full bg-[#0a1628] border border-[#1e3a6e] rounded-xl px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#f5c518]" required />
                    <input type="text" placeholder="Last Name" value={lastNameInput}
                      onChange={e => setLastNameInput(e.target.value)}
                      className="w-full bg-[#0a1628] border border-[#1e3a6e] rounded-xl px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#f5c518]" required />
                  </div>

                  <input type="text" placeholder="Username" value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    className="w-full bg-[#0a1628] border border-[#1e3a6e] rounded-xl px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#f5c518]" required />
                </>
              )}
              
              <input type="tel" placeholder="Mobile Number" value={phoneInput}
                onChange={e => setPhoneInput(e.target.value)}
                className="w-full bg-[#0a1628] border border-[#1e3a6e] rounded-xl px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#f5c518]" required />
              
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  className="w-full bg-[#0a1628] border border-[#1e3a6e] rounded-xl px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#f5c518]" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-slate-500">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {isRegister && (
                <>
                  <div className="relative">
                    <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPasswordInput}
                      onChange={e => setConfirmPasswordInput(e.target.value)}
                      className="w-full bg-[#0a1628] border border-[#1e3a6e] rounded-xl px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#f5c518]" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-3 text-slate-500">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <input type="text" placeholder="Referral Code (Optional)" value={referCodeInput}
                    onChange={e => setReferCodeInput(e.target.value)}
                    className="w-full bg-[#0a1628] border border-[#1e3a6e] rounded-xl px-4 py-3 text-textPrimary placeholder-slate-500 focus:outline-none focus:border-[#f5c518]" />
                </>
              )}
              
              {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
              
              <button type="submit"
                className="w-full bg-[#f5c518] text-black font-black py-3.5 rounded-xl text-sm tracking-widest hover:bg-yellow-400 transition">
                {isRegister ? 'CREATE ACCOUNT' : 'LOGIN'}
              </button>
            </form>

            <div className="mt-6 border-t border-[#1e3a6e] pt-6">
              <p className="text-center text-xs text-textSecondary mb-4">Or continue with</p>
              <div className="flex justify-center gap-4">
                <button type="button" onClick={() => alert('Coming soon!')} className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition">
                  <Mail className="w-5 h-5 text-red-500" />
                </button>
                <button type="button" onClick={() => alert('Coming soon!')} className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center hover:bg-blue-600 transition">
                  <Facebook className="w-5 h-5 text-white" />
                </button>
                <button type="button" onClick={() => alert('Coming soon!')} className="w-12 h-12 rounded-full bg-black border border-gray-700 flex items-center justify-center hover:bg-gray-900 transition">
                  <span className="text-white font-bold text-lg">𝕏</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Match Detail Screen ──────────────────────────────────────────────────
  if (selectedMatch && !showJoinings) {
    const joined = selectedMatch.joinedPlayers?.some((p: any) =>
      p.user === user.id || p.user?._id === user.id);
    const isFull = selectedMatch.joinedPlayers?.length >= selectedMatch.totalSlots;
    const spotsLeft = selectedMatch.totalSlots - (selectedMatch.joinedPlayers?.length || 0);
    
    let isRoomReleased = user.role === 'admin' || user.role === 'host';
    try {
      const matchTime = new Date(`${selectedMatch.date} ${selectedMatch.time}`);
      const diffMin = (matchTime.getTime() - new Date().getTime()) / 60000;
      if (diffMin <= 10) isRoomReleased = true;
    } catch (e) {}

    return (
      <div className="min-h-screen bg-bgSurface pb-24">
        {/* Header */}
        <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
          <button onClick={() => setSelectedMatch(null)} className="text-textPrimary">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-textPrimary font-bold text-base flex-1 text-center">
            Contest Details #{selectedMatch.matchId}
          </h2>
          <div className="w-6" />
        </div>

        {/* Banner */}
        <div className="relative w-full overflow-hidden px-3 pt-3">
          {(() => {
            let slotImg = null;
            const tType = selectedMatch.teamType?.toLowerCase();
            if (tType === 'solo') slotImg = 'http://localhost:5000/uploads/slot_1v1.jpeg';
            else if (tType === 'duo') slotImg = 'http://localhost:5000/uploads/slot_2v2.jpeg';
            else if (tType === 'squad') slotImg = 'http://localhost:5000/uploads/slot_4v4.jpeg';

            const specialBanner = getSpecialBanner(selectedMatch.category);
            const bannerSrc = selectedMatch.bannerImage || slotImg || specialBanner || getCategoryThumbnail(selectedMatch.category, categoryBanners);
            
            return <img src={bannerSrc} alt={selectedMatch.category} className="w-full h-auto block rounded-xl shadow-sm" />;
          })()}
        </div>

        <div className="px-4 py-4 space-y-4">
          
          {/* Room Details */}
          <div className="text-center">
            <h3 className="text-[#26a4d3] font-bold text-lg mb-3">Room Details</h3>
            <div className="space-y-3">
              <div className="flex items-center border-2 border-gray-600 rounded-xl overflow-hidden bg-bgSurface">
                <div className="px-4 py-2 font-black text-xs border-r-2 border-gray-600 w-24 text-left">ID:</div>
                <div className="flex-1 px-3 py-2 text-sm text-gray-700 font-medium text-left bg-bgPrimary flex justify-between items-center">
                  <span>{isRoomReleased && selectedMatch.roomId ? selectedMatch.roomId : 'Coming Soon'}</span>
                  {isRoomReleased && selectedMatch.roomId && (
                    <button onClick={() => navigator.clipboard.writeText(selectedMatch.roomId)}>
                      <RefreshCw className="w-4 h-4 text-textSecondary" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center border-2 border-gray-600 rounded-xl overflow-hidden bg-bgSurface">
                <div className="px-4 py-2 font-black text-xs border-r-2 border-gray-600 w-24 text-left">PASSWORD:</div>
                <div className="flex-1 px-3 py-2 text-sm text-gray-700 font-medium text-left bg-bgPrimary flex justify-between items-center">
                  <span>{isRoomReleased && selectedMatch.roomPass ? selectedMatch.roomPass : 'Coming Soon'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Left */}
          <div className="border border-borderColor rounded-lg px-4 py-2 text-center bg-bgSurface shadow-sm mt-5">
            <p className="text-gray-600 text-sm font-medium">Time Left: <span className="text-black font-bold">{timeLeft}</span></p>
          </div>

          {/* Title row in blue */}
          <p className="text-[#26a4d3] font-bold text-xs leading-relaxed uppercase">
            {selectedMatch.title} 🚨 - ID#{selectedMatch.matchId}
          </p>

          {/* Tags Grids */}
          <div className="grid grid-cols-3 gap-2">
            <div className="border border-gray-300 rounded px-2 py-2 text-center bg-bgSurface shadow-sm">
              <p className="text-xs text-gray-600">Team: <span className="font-bold">{selectedMatch.teamType}</span></p>
            </div>
            <div className="border border-gray-300 rounded px-2 py-2 text-center bg-bgSurface shadow-sm">
              <p className="text-xs text-gray-600">Mode: <span className="font-bold">{selectedMatch.mode}</span></p>
            </div>
            <div className="border border-gray-300 rounded px-2 py-2 text-center bg-bgSurface shadow-sm">
              <p className="text-xs text-gray-600">Map: <span className="font-bold">{selectedMatch.map}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="border border-gray-300 rounded px-2 py-2 text-center bg-bgSurface shadow-sm">
              <p className="text-xs text-gray-600">Match Type: <span className="font-bold">{selectedMatch.matchType}</span></p>
            </div>
            <div className="border border-gray-300 rounded px-2 py-2 text-center bg-bgSurface shadow-sm">
              <p className="text-xs text-gray-600">Entry Fee: <span className="font-bold text-[#f5c518]">🪙 {selectedMatch.entryFee}</span></p>
            </div>
          </div>

          <div className="border border-gray-300 rounded px-4 py-2 text-center bg-bgSurface shadow-sm">
            <p className="text-xs text-gray-600">Match Schedule: <span className="font-bold">{selectedMatch.date} at {selectedMatch.time}</span></p>
          </div>

          {/* Prize Details Box */}
          {selectedMatch.prizeDistribution?.length > 0 && (
            <div className="mt-4">
              <p className="text-[#26a4d3] font-bold text-sm mb-2">Prize Details</p>
              <div className="border border-gray-300 bg-bgSurface p-4 space-y-2 shadow-sm">
                {selectedMatch.prizeDistribution.map((pd: any, i: number) => (
                  <p key={i} className="text-sm font-bold text-gray-700">
                    {['Top 1', 'Top 2', 'Top 3', 'Top 4', 'Top 5', 'Top 6', 'Top 7', 'Top 8', 'Top 9', 'Top 10'][i] || `Top ${i + 1}`} :- {pd.prize}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* About Match / Rules */}
          {selectedMatch.rules?.length > 0 && (
            <div className="mt-4">
              <p className="text-[#26a4d3] font-bold text-sm mb-2">About this Match</p>
              <div className="bg-[#f0f0fa] p-4 shadow-sm border-t-2 border-gray-400">
                <p className="font-bold text-center text-base text-black mb-4">Rules and Regulations</p>
                <div className="border-t border-gray-400 mb-4" />
                <ul className="space-y-4">
                  {selectedMatch.rules.map((rule: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm text-textPrimary font-semibold items-start">
                      <span className="text-black font-black mt-1 text-[10px]">●</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Match Results (if completed) */}
          {selectedMatch.status === 'completed' && (
            <div className="bg-bgSurface rounded-2xl p-5 text-center shadow-lg border border-green-500/20 space-y-4 text-textPrimary">
              <div className="border-b border-gray-700/50 pb-2">
                <p className="text-[#f5c518] text-xs font-bold uppercase tracking-widest">🏆 MATCH RESULT</p>
                <span className="bg-green-500 text-textPrimary font-bold text-[9px] px-2 py-0.5 rounded">COMPLETED</span>
              </div>

              {(() => {
                const myResult = selectedMatch.joinedPlayers?.find((p: any) => p.user === user.id || p.user?._id === user.id);
                if (myResult) {
                  const wonPrize = myResult.prize || 0;
                  return (
                    <div className="bg-[#0a1628] p-4 rounded-xl space-y-2 border border-borderColor">
                      <p className="text-textSecondary text-xs font-medium">Your Performance</p>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-textSecondary text-[10px] uppercase">Rank</p>
                          <p className="text-textPrimary font-black text-xl">#{myResult.rank || '--'}</p>
                        </div>
                        <div>
                          <p className="text-textSecondary text-[10px] uppercase">Kills</p>
                          <p className="text-[#f5c518] font-black text-xl">💀 {myResult.kills || 0}</p>
                        </div>
                      </div>
                      <div className="border-t border-borderColor pt-2 mt-2">
                        <p className="text-textSecondary text-xs uppercase">Prize Won</p>
                        <p className={`font-black text-lg ${wonPrize > 0 ? 'text-green-400' : 'text-textSecondary'}`}>
                          {wonPrize > 0 ? `🪙 ${wonPrize} (Credited)` : '₹0'}
                        </p>
                      </div>
                    </div>
                  );
                } else {
                  return <p className="text-xs text-textSecondary">You did not participate in this match.</p>;
                }
              })()}

              {/* Leaderboard / Standings */}
              <div className="space-y-2 text-left">
                <p className="text-[#f5c518] text-xs font-bold uppercase">Standings</p>
                <div className="bg-[#0a1628] rounded-xl overflow-hidden border border-borderColor">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-bgSurface text-textSecondary">
                      <tr>
                        <th className="px-3 py-2 text-left">Rank</th>
                        <th className="px-3 py-2">Player</th>
                        <th className="px-3 py-2 text-center">Kills</th>
                        <th className="px-3 py-2 text-right">Prize</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedMatch.joinedPlayers
                        ?.sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999))
                        .slice(0, 10)
                        .map((p: any, idx: number) => (
                          <tr key={idx} className="border-b border-borderColor/40 text-gray-300">
                            <td className="px-3 py-2.5 font-bold text-[#f5c518]">#{p.rank || idx + 1}</td>
                            <td className="px-3 py-2.5 truncate font-medium max-w-[120px]">{p.name || 'Player'}</td>
                            <td className="px-3 py-2.5 text-center font-bold text-gray-200">{p.kills || 0}</td>
                            <td className="px-3 py-2.5 text-right font-black text-green-400">{p.prize ? `🪙 ${p.prize}` : '--'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Room ID & Pass section */}
          {selectedMatch.roomId ? (
            isRoomReleased ? (
              <div className="bg-bgSurface rounded-2xl p-5 text-center shadow-lg border border-[#f5c518]/20 space-y-4">
                <div className="border-b border-gray-700/50 pb-2">
                  <p className="text-textSecondary text-[10px] tracking-widest font-bold uppercase mb-1">🎮 CUSTOM ROOM DETAILS</p>
                  <span className="bg-green-500 text-textPrimary font-bold text-[9px] px-2 py-0.5 rounded">RELEASED</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a1628] p-3 rounded-xl border border-gray-700/30">
                    <p className="text-textSecondary text-[9px] mb-1 uppercase">Room ID</p>
                    <p className="text-[#f5c518] font-black text-base tracking-widest select-all">{selectedMatch.roomId}</p>
                    <button onClick={() => { navigator.clipboard.writeText(selectedMatch.roomId); setWalletMsg('📋 Room ID Copied!'); setTimeout(() => setWalletMsg(''), 2000); }}
                      className="mt-2 text-[10px] bg-[#f5c518] text-black font-bold px-2 py-1 rounded hover:opacity-90 active:scale-95 transition">
                      Copy
                    </button>
                  </div>
                  
                  <div className="bg-[#0a1628] p-3 rounded-xl border border-gray-700/30">
                    <p className="text-textSecondary text-[9px] mb-1 uppercase">Password</p>
                    <p className="text-textPrimary font-bold text-base select-all">{selectedMatch.roomPass || 'N/A'}</p>
                    {selectedMatch.roomPass && (
                      <button onClick={() => { navigator.clipboard.writeText(selectedMatch.roomPass); setWalletMsg('📋 Password Copied!'); setTimeout(() => setWalletMsg(''), 2000); }}
                        className="mt-2 text-[10px] bg-bgSurface text-black font-bold px-2 py-1 rounded hover:opacity-90 active:scale-95 transition">
                        Copy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-bgSurface rounded-2xl p-5 text-center shadow-lg border border-borderColor space-y-2">
                <p className="text-textSecondary text-xs font-semibold">🔒 Room ID & Password</p>
                <p className="text-xs text-yellow-500 font-bold bg-[#f5c518]/10 p-2.5 rounded-xl">
                  Revealing automatically exactly 10 minutes before the match start time!
                </p>
              </div>
            )
          ) : (
            joined && (
              <div className="bg-bgSurface rounded-2xl p-5 text-center shadow-lg border border-borderColor space-y-1">
                <p className="text-textSecondary text-xs font-semibold">🔒 Room ID & Password</p>
                <p className="text-xs text-textSecondary">Not released yet by the Host / Admin.</p>
              </div>
            )
          )}

          {/* Join success msg */}
          {joinSuccess && (
            <div className={`rounded-xl p-3 text-center text-sm font-bold ${joinSuccess.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {joinSuccess}
            </div>
          )}

          <div className="fixed bottom-0 left-0 right-0 bg-bgSurface p-3 space-y-2 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
            {/* View All Joinings */}
            <button onClick={() => setShowJoinings(true)}
              className="w-full py-3 rounded-lg bg-bgSurface text-textPrimary font-bold text-sm tracking-wide shadow-sm hover:opacity-90 transition">
              VIEW JOINED PLAYERS
            </button>

            {/* Join Button */}
            {isFull ? (
              <button disabled className="w-full py-3 rounded-lg bg-gray-300 text-textPrimary font-bold text-sm tracking-wide shadow-sm">
                JOINING FULL
              </button>
            ) : (user?.role === 'host' || user?.role === 'admin' || user?.role === 'finance_admin') ? (
              <button disabled className="w-full py-3 rounded-lg bg-gray-500 text-textPrimary font-bold text-sm tracking-wide shadow-sm">
                🚫 STAFF CANNOT JOIN
              </button>
            ) : joined ? (
              <button disabled className="w-full py-3 rounded-lg bg-green-500 text-textPrimary font-bold text-sm tracking-wide shadow-sm">
                ✅ ALREADY JOINED
              </button>
            ) : (
              <button onClick={() => handleJoin(selectedMatch._id)} disabled={joining}
                className="w-full py-3 rounded-lg bg-[#8cc63f] text-textPrimary font-bold text-sm tracking-wide shadow-sm hover:bg-green-500 transition active:scale-95">
                {joining ? 'JOINING...' : `JOIN MATCH (🪙 ${selectedMatch.entryFee})`}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateSlot = async (matchId: string, playerId: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/tournaments/${matchId}/players/${playerId}/slot`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ teamNo: newSlot, position: newPosition })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedTournaments = tournaments.map((t: any) => t._id === matchId ? { ...t, joinedPlayers: data.joinedPlayers } : t);
        setTournaments(updatedTournaments);
        setSelectedMatch({ ...selectedMatch, joinedPlayers: data.joinedPlayers });
        setEditingSlotFor(null);
      } else {
        const err = await res.json();
        alert(err.msg || 'Failed to update slot');
      }
    } catch (e) {
      alert('Error updating slot');
    }
  };

  // ─── All Joinings Screen ──────────────────────────────────────────────────
  if (showJoinings && selectedMatch) {
    return (
      <div className="min-h-screen bg-bgSurface pb-20 relative">
        <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 shadow-md rounded-b-2xl">
          <button onClick={() => setShowJoinings(false)} className="text-textPrimary">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-textPrimary font-bold text-base flex-1 text-center">All Joinings</h2>
          <div className="w-6" />
        </div>

        <div className="overflow-x-auto mt-4 px-2">
          <table className="w-full text-sm bg-bgPrimary rounded-xl overflow-hidden shadow-sm border border-borderColor">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-4 text-left text-[11px] text-textSecondary font-bold uppercase">Team No.</th>
                <th className="px-3 py-4 text-left text-[11px] text-textSecondary font-bold uppercase">Pos.</th>
                <th className="px-3 py-4 text-left text-[11px] text-textSecondary font-bold uppercase">In Game Name</th>
                <th className="px-3 py-4 text-left text-[11px] text-textSecondary font-bold uppercase">In Game Id</th>
                {(user?.role === 'admin' || user?.role === 'finance_admin' || user?.role === 'host') && (
                  <th className="px-3 py-4 text-right text-[11px] text-textSecondary font-bold uppercase">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {selectedMatch.joinedPlayers?.map((p: any, i: number) => {
                const isEditing = editingSlotFor === (p.user?._id || p.user);
                return (
                  <tr key={i} className="border-b border-borderColor bg-bgSurface">
                    <td className="px-3 py-4 text-gray-600 font-medium">
                      {isEditing ? <input type="number" value={newSlot} onChange={e => setNewSlot(e.target.value)} className="w-12 border p-1 rounded" /> : (p.teamNo || i + 1)}
                    </td>
                    <td className="px-3 py-4 text-gray-600 font-medium">
                      {isEditing ? <input type="text" value={newPosition} onChange={e => setNewPosition(e.target.value)} className="w-10 border p-1 rounded uppercase" maxLength={1} /> : (p.position || 'A')}
                    </td>
                    <td className="px-3 py-4 font-semibold text-textPrimary">{p.name || p.user?.username || '--'}</td>
                    <td className="px-3 py-4 text-gray-600 font-medium">{p.uid || p.user?.ffUid || '--'}</td>
                    {(user?.role === 'admin' || user?.role === 'finance_admin' || user?.role === 'host') && (
                      <td className="px-3 py-4 text-right">
                        {isEditing ? (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleUpdateSlot(selectedMatch._id, p.user?._id || p.user)} className="text-green-500 text-xs font-bold bg-green-50 px-2 py-1 rounded">Save</button>
                            <button onClick={() => setEditingSlotFor(null)} className="text-gray-500 text-xs font-bold bg-gray-50 px-2 py-1 rounded">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => {
                            setEditingSlotFor(p.user?._id || p.user);
                            setNewSlot(p.teamNo?.toString() || (i + 1).toString());
                            setNewPosition(p.position || 'A');
                          }} className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded hover:bg-blue-100">Edit</button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(!selectedMatch.joinedPlayers || selectedMatch.joinedPlayers.length === 0) && (
            <div className="text-center py-12 text-textSecondary">No players joined yet.</div>
          )}
        </div>

        {/* Bottom buttons */}
        <div className="fixed bottom-0 left-0 right-0 flex h-14 z-20">
          <button className="flex-1 bg-[#58d68d] text-textPrimary font-bold tracking-wide hover:opacity-90 active:scale-95 transition">
            MY ENTRIES
          </button>
          <button onClick={() => setShowJoinings(false)} className="flex-1 bg-[#54a0ff] text-textPrimary font-bold tracking-wide hover:opacity-90 active:scale-95 transition">
            SHOW DETAILS
          </button>
        </div>
      </div>
    );
  }

  // ─── My Matches Joined List Screen ──────────────────────────────────────────
  if (selectedMyMatchesTab) {
    const filteredJoinedMatches = myMatches.filter(t => t.status?.toLowerCase() === selectedMyMatchesTab.toLowerCase());
    return (
      <div className="min-h-screen bg-[#f0f2f5] pb-6">
        {/* Header */}
        <div className="bg-bgSurface px-4 py-4 flex items-center gap-3">
          <button onClick={() => setSelectedMyMatchesTab(null)} className="text-textPrimary">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-textPrimary font-bold text-base flex-1 text-center capitalize">
            My {selectedMyMatchesTab} Matches
          </h2>
          <div className="w-6" />
        </div>

        {/* Contest Cards */}
        <div className="px-4 py-4 space-y-4">
          {filteredJoinedMatches.length === 0 ? (
            <div className="text-center py-16 text-textSecondary">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No joined {selectedMyMatchesTab} matches</p>
            </div>
          ) : filteredJoinedMatches.map(match => {
            const cat = GAME_CATEGORIES.find(c => c.id === match.category);
            return (
              <motion.div key={match._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedMatch(match)}
                className="bg-bgSurface rounded-2xl overflow-hidden shadow-sm cursor-pointer active:scale-[0.99] transition">
                {/* Banner */}
                {(() => {
                  let slotImg = null;
                  const tType = match.teamType?.toLowerCase();
                  if (tType === 'solo') slotImg = 'http://localhost:5000/uploads/slot_1v1.jpeg';
                  else if (tType === 'duo') slotImg = 'http://localhost:5000/uploads/slot_2v2.jpeg';
                  else if (tType === 'squad') slotImg = 'http://localhost:5000/uploads/slot_4v4.jpeg';

                  const specialBanner = getSpecialBanner(match.category);
                  const bannerSrc = match.bannerImage || slotImg || specialBanner || getCategoryThumbnail(match.category, categoryBanners);
                  if (specialBanner) {
                    return (
                      <div className="w-full overflow-hidden relative bg-[#040914] rounded-t-2xl">
                        <img src={bannerSrc} alt={match.category} className="w-full h-auto object-contain" />
                      </div>
                    );
                  }
                  return (
                    <div className={`w-full overflow-hidden relative bg-black ${bannerSrc ? '' : 'h-44'}`}>
                      {bannerSrc && <img src={bannerSrc} alt={match.category} className="w-full h-auto block" />}
                      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center ${bannerSrc ? 'hidden' : ''}`}>
                        <div className="text-center">
                          <p className="text-textPrimary font-black text-xl tracking-widest uppercase">{match.category}</p>
                          <p className="text-yellow-300 text-xs font-semibold mt-1">TOURNAMENT</p>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 rounded px-2 py-1">
                        <span className="text-[#f5c518] text-xs font-bold">FREE FIRE MAX</span>
                      </div>
                      {match.status === 'ongoing' && (
                        <div className="absolute top-3 left-3 bg-green-500 rounded px-2 py-1">
                          <span className="text-textPrimary text-xs font-bold">🔴 LIVE</span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Info */}
                <div className="p-4">
                  <p className="font-bold text-sm text-textPrimary mb-1 leading-snug">{match.title}</p>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-textSecondary text-xs font-semibold">Start: {match.date} at {match.time}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${match.status === 'ongoing' ? 'bg-red-500 text-textPrimary animate-pulse' : match.status === 'completed' ? 'bg-green-500 text-textPrimary' : 'bg-bgSurface text-textPrimary'}`}>{match.status === 'ongoing' ? 'LIVE' : match.status}</span>
                  </div>
                  {match.registrationClosingTime && match.status === 'upcoming' && (
                    <p className="text-red-500 text-[10px] font-bold mb-2 border border-red-100 bg-red-50 px-2 py-1 rounded inline-block">Reg Closes: {new Date(match.registrationClosingTime).toLocaleString()}</p>
                  )}

                  {match.status !== 'completed' && <CountdownTimer match={match} />}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase">Prize Pool</p>
                      <p className="font-bold text-sm">🪙 {match.prizePool}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase">Per Kill</p>
                      <p className="font-bold text-sm">🪙 {match.perKill}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase">Entry Fee</p>
                      <p className="font-bold text-sm">🪙 {match.entryFee}</p>
                    </div>
                  </div>

                  {/* Joined Indicator */}
                  <div className="flex items-center justify-between border-t pt-3 mt-3">
                    <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-4.5 h-4.5" /> Joined Match
                    </span>
                    <span className="text-[10px] text-textSecondary font-mono">ID: {match.matchId}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Contest List Screen ──────────────────────────────────────────────────
  if (selectedCategory) {
    const cat = GAME_CATEGORIES.find(c => c.id === selectedCategory);
    return (
      <div className="min-h-screen bg-[#f0f2f5] pb-6">
        {/* Header */}
        <div className="bg-[#042e5a] px-4 py-4 flex items-center gap-3 rounded-b-2xl shadow-md z-10 relative">
          <button onClick={() => setSelectedCategory(null)} className="text-textPrimary">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-textPrimary font-bold text-base flex-1 text-center">
            {cat?.label} Contests
          </h2>
          <div className="w-6" />
        </div>

        {/* Tabs */}
        <div className="flex bg-[#042e5a] px-4 pt-2 -mt-4 pb-0 rounded-b-2xl shadow-sm z-0 relative">
          {[{ id: 'ongoing', label: 'Ongoing' }, { id: 'upcoming', label: 'Upcoming' }, { id: 'completed', label: 'Resulted' }].map(tab => (
            <button key={tab.id} onClick={() => setContestTab(tab.id as any)}
              className={`flex-1 py-3 text-sm font-semibold transition-all relative ${contestTab === tab.id ? 'text-textPrimary' : 'text-textSecondary hover:text-gray-200'}`}>
              {tab.label}
              {contestTab === tab.id && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-bgSurface rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Contest Cards */}
        <div className="px-4 py-4 space-y-4">
          {filteredByTab.length === 0 ? (
            <div className="text-center py-16 text-textSecondary">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No {contestTab === 'completed' ? 'resulted' : contestTab} contests</p>
            </div>
          ) : filteredByTab.map(match => {
            const isFull = match.joinedPlayers?.length >= match.totalSlots;
            const spotsLeft = match.totalSlots - (match.joinedPlayers?.length || 0);
            return (
              <motion.div key={match._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedMatch(match)}
                className="bg-bgSurface rounded-xl overflow-hidden shadow-md cursor-pointer active:scale-[0.99] transition border border-borderColor">
                {/* Banner */}
                {(() => {
                  let slotImg = null;
                  const tType = match.teamType?.toLowerCase();
                  if (tType === 'solo') slotImg = 'http://localhost:5000/uploads/slot_1v1.jpeg';
                  else if (tType === 'duo') slotImg = 'http://localhost:5000/uploads/slot_2v2.jpeg';
                  else if (tType === 'squad') slotImg = 'http://localhost:5000/uploads/slot_4v4.jpeg';

                  const specialBanner = getSpecialBanner(match.category);
                  const bannerSrc = match.bannerImage || slotImg || specialBanner || getCategoryThumbnail(match.category, categoryBanners);
                  if (specialBanner) {
                    return (
                      <div className="w-full overflow-hidden relative bg-[#040914] rounded-t-xl">
                        <img src={bannerSrc} alt={match.category} className="w-full h-auto object-contain" />
                      </div>
                    );
                  }
                  return (
                    <div className={`w-full overflow-hidden relative bg-black ${bannerSrc ? '' : 'h-44'}`}>
                      {bannerSrc && <img src={bannerSrc} alt={match.category} className="w-full h-auto block" />}
                      {match.status === 'ongoing' && (
                        <div className="absolute top-3 left-3 bg-red-500 rounded px-2 py-1">
                          <span className="text-textPrimary text-xs font-bold uppercase tracking-widest animate-pulse">Live</span>
                        </div>
                      )}
                      {/* Avatar overlay - simulated */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                        <div className="w-12 h-12 rounded-full border-2 border-red-500 bg-[#042e5a] shadow-lg flex items-center justify-center overflow-hidden">
                          <User className="w-6 h-6 text-textPrimary" />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Info */}
                <div className="p-4 pt-8">
                  <p className="font-bold text-sm text-textPrimary mb-1 leading-snug">{match.title}</p>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-textSecondary text-xs font-semibold">Start: {match.date} at {match.time}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${match.status === 'ongoing' ? 'bg-red-500 text-textPrimary animate-pulse' : match.status === 'completed' ? 'bg-green-500 text-textPrimary' : 'bg-bgSurface text-textPrimary'}`}>{match.status === 'ongoing' ? 'LIVE' : match.status}</span>
                  </div>
                  {match.registrationClosingTime && match.status === 'upcoming' && (
                    <p className="text-red-500 text-[10px] font-bold mb-3 border border-red-100 bg-red-50 px-2 py-1 rounded inline-block">Reg Closes: {new Date(match.registrationClosingTime).toLocaleString()}</p>
                  )}

                  <div className="grid grid-cols-3 gap-y-4 mb-4">
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase font-bold mb-1">Prize Pool</p>
                      <p className="font-bold text-sm text-textPrimary flex items-center justify-center gap-1">🪙 {match.prizePool}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase font-bold mb-1">Per Kill</p>
                      <p className="font-bold text-sm text-textPrimary flex items-center justify-center gap-1">🪙 {match.perKill}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase font-bold mb-1">Entry Fee</p>
                      <p className="font-bold text-sm text-[#f5c518] flex items-center justify-center gap-1">🪙 {match.entryFee}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase font-bold mb-1">Type</p>
                      <p className="font-bold text-sm text-textPrimary">{match.teamType}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase font-bold mb-1">Entry Per Player</p>
                      <p className="font-bold text-sm text-textPrimary">{match.totalSlots}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-textSecondary text-[10px] uppercase font-bold mb-1">Map</p>
                      <p className="font-bold text-sm text-textPrimary">{match.map}</p>
                    </div>
                  </div>

                  {/* Spots bar & Join button */}
                  <div className="flex items-end justify-between border-t border-borderColor mt-2 pt-3">
                    <div className="flex-1 mr-4 pb-1">
                      {match.status !== 'completed' && <CountdownTimer match={match} />}
                      <div className="flex justify-between text-[11px] mb-1 font-bold">
                        <span className="text-red-500">Only {spotsLeft} Spot{spotsLeft !== 1 ? 's' : ''} Left</span>
                        <span className="text-red-500">{match.joinedPlayers?.length || 0}/{match.totalSlots}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-[3px]">
                        <div className="bg-red-500 h-[3px]"
                          style={{ width: `${Math.min(100, ((match.joinedPlayers?.length || 0) / match.totalSlots) * 100)}%` }} />
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded font-bold text-sm tracking-wide ${isFull ? 'bg-[#54a0ff] text-textPrimary' : 'bg-[#8cc63f] text-textPrimary'}`}>
                      {isFull ? 'Joining Full' : 'Join Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Admin: Create match */}
        {(user.role === 'admin' || user.role === 'host') && (
          <div className="fixed bottom-6 right-6">
            <button onClick={() => setShowCreateMatch(true)}
              className="w-14 h-14 rounded-full bg-[#f5c518] text-black flex items-center justify-center shadow-2xl">
              <Plus className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* Create Match Modal */}
        <AnimatePresence>
          {showCreateMatch && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-end">
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="w-full bg-bgSurface rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-[#132040]">Create New Match</h3>
                  <button onClick={() => setShowCreateMatch(false)} className="text-textSecondary">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateMatch} className="space-y-4">
                  <input className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary" placeholder="Match Title" value={newMatch.title} onChange={e => setNewMatch({...newMatch, title: e.target.value})} required />
                  <select className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary bg-bgSurface" value={newMatch.category} onChange={e => setNewMatch({...newMatch, category: e.target.value})}>
                    {GAME_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary" placeholder="Date (YYYY-MM-DD)" value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} required />
                    <input className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary" placeholder="Time (HH:MM AM/PM)" value={newMatch.time} onChange={e => setNewMatch({...newMatch, time: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary" placeholder="Entry Fee" value={newMatch.entryFee} onChange={e => setNewMatch({...newMatch, entryFee: e.target.value})} required />
                    <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary" placeholder="Prize Pool" value={newMatch.prizePool} onChange={e => setNewMatch({...newMatch, prizePool: e.target.value})} required />
                    <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary" placeholder="Per Kill" value={newMatch.perKill} onChange={e => setNewMatch({...newMatch, perKill: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary" placeholder="Total Slots" value={newMatch.totalSlots} onChange={e => setNewMatch({...newMatch, totalSlots: e.target.value})} required />
                    <select className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary bg-bgSurface" value={newMatch.map} onChange={e => setNewMatch({...newMatch, map: e.target.value})}>
                      <option>Bermuda</option><option>Kalahari</option><option>Purgatory</option><option>Alpine</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <select className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary bg-bgSurface" value={newMatch.teamType} onChange={e => setNewMatch({...newMatch, teamType: e.target.value})}>
                      <option>Solo</option><option>Duo</option><option>Squad</option>
                    </select>
                    <select className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary bg-bgSurface" value={newMatch.mode} onChange={e => setNewMatch({...newMatch, mode: e.target.value})}>
                      <option>Solo</option><option>1v1</option><option>2v2</option><option>4v4</option>
                    </select>
                    <select className="border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary bg-bgSurface" value={newMatch.matchType} onChange={e => setNewMatch({...newMatch, matchType: e.target.value})}>
                      <option>Paid</option><option>Free</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-textSecondary mb-1 block">Prize Distribution (format: 1st:55,2nd:40,...)</label>
                    <input className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm text-textPrimary" value={newMatch.prizeDistribution} onChange={e => setNewMatch({...newMatch, prizeDistribution: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs text-textSecondary mb-1 block">Rules (one per line)</label>
                    <textarea rows={4} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm resize-none text-textPrimary" placeholder="Room Entry Recording is compulsory..." value={newMatch.rules} onChange={e => setNewMatch({...newMatch, rules: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-bgSurface text-[#f5c518] font-bold py-4 rounded-xl text-sm tracking-widest">
                    CREATE MATCH
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ─── Main Home Screen ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-20">
      {/* Top Header */}
      <div className="bg-bgSurface px-4 pt-10 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#f5c518] to-orange-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-textPrimary" />
          </div>
          <div>
            <p className="text-textPrimary font-bold text-sm">{user.username}</p>
            <p className="text-textSecondary text-[10px]">ID: {user.ffUid || 'Set FF UID'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#f5c518]/20 rounded-full px-3 py-1.5">
            <span className="text-[#f5c518] text-sm">🪙</span>
            <span className="text-[#f5c518] font-bold text-sm">{user.coins || 0}</span>
          </div>
          <div className="flex items-center gap-3">
            {mounted && (
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-1 rounded-full hover:bg-black/10 transition">
                {theme === 'dark' ? <Sun className="w-6 h-6 text-textPrimary" /> : <Moon className="w-6 h-6 text-textPrimary" />}
              </button>
            )}
            <div className="relative">
              <button className="relative" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell className="w-6 h-6 text-textPrimary" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] text-textPrimary flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute top-10 right-0 w-64 bg-bgSurface border border-borderColor rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-2 border-b border-borderColor pb-2">
                    <h3 className="font-bold text-textPrimary text-sm">Announcements</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-textSecondary hover:text-textPrimary">
                      <XCircle size={16} />
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.map(n => (
                      <div key={n.id} className="text-xs text-textSecondary bg-bgPrimary p-2 rounded-lg border border-borderColor">
                        {n.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Global Announcement Banner */}
      {globalAnnouncement && (
        <div className="bg-[#f5c518] text-[#132040] px-4 py-2.5 flex items-center justify-between shadow-md z-40 relative border-b border-yellow-500/30">
          <div className="flex items-center gap-2 overflow-hidden">
            <Bell size={16} className="shrink-0 animate-bounce text-red-600" />
            <marquee className="text-xs font-bold whitespace-nowrap tracking-wide">{globalAnnouncement}</marquee>
          </div>
          <button onClick={() => setGlobalAnnouncement('')} className="ml-3 shrink-0 bg-black/10 rounded-full p-1 hover:bg-black/20 active:scale-95 transition">
            <XCircle size={16} />
          </button>
        </div>
      )}

      {activeNav === 'home' && (
        <>
          {/* Important Deposit Notice */}
          <div className="bg-red-50 border-b border-red-100 px-4 py-2.5 text-center flex items-center justify-center gap-2 overflow-hidden shadow-sm">
            <span className="text-xs shrink-0">📢</span>
            <div className="text-[11px] text-red-700 font-black tracking-wide animate-pulse">
              Deposit करने के बाद WhatsApp Support (<a href="https://wa.me/917017022966" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">7017022966</a>) पर UTR नंबर and Payment Screenshot ज़रूर भेजें!
            </div>
          </div>

          {showInstallBanner && (
            <div className="bg-gradient-to-r from-[#132040] to-[#1a3060] px-4 py-3 flex justify-between items-center text-textPrimary border-b border-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">📲</span>
                <div className="text-left">
                  <p className="text-xs font-bold">Install FragArena App</p>
                  <p className="text-[10px] text-gray-300">Play in full screen & get instant updates!</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setShowInstallBanner(false)} className="text-xs text-textSecondary font-bold px-2 py-1">
                  Later
                </button>
                <button onClick={handleInstallClick}
                  className="bg-[#f5c518] text-black font-black text-[10px] px-3 py-1.5 rounded-lg shadow active:scale-95 transition">
                  INSTALL
                </button>
              </div>
            </div>
          )}

          {/* My Matches */}
          <div className="px-4 py-5">
            <h2 className="text-center font-bold text-base text-[#132040] mb-4">My Matches</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'ongoing', label: 'Ongoing', icon: RefreshCw, color: '#4CAF50', count: myMatches.filter(m => m.status?.toLowerCase() === 'ongoing').length },
                { id: 'upcoming', label: 'Upcoming', icon: Clock, color: '#1a73e8', count: myMatches.filter(m => m.status?.toLowerCase() === 'upcoming').length },
                { id: 'completed', label: 'Completed', icon: CheckCircle, color: '#4CAF50', count: myMatches.filter(m => m.status?.toLowerCase() === 'completed').length },
              ].map((item, i) => (
                <div key={i} onClick={() => setSelectedMyMatchesTab(item.id)}
                  className="bg-bgSurface rounded-2xl p-4 flex flex-col items-center gap-2 shadow-sm cursor-pointer active:scale-95 hover:shadow-md transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center relative"
                    style={{ backgroundColor: item.color + '20', border: `2px solid ${item.color}` }}>
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                    {item.count > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-textPrimary font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Banners */}
          {promoBanners.length > 0 && (
            <div className="px-4 pb-4">
              <div className="flex overflow-x-auto gap-3 snap-x snap-mandatory hide-scrollbar rounded-2xl">
                {promoBanners.map((banner, i) => (
                  <a key={i} href={banner.link || '#'} target={banner.link ? "_blank" : "_self"} rel="noopener noreferrer" 
                     className="shrink-0 w-full sm:w-[85%] snap-center rounded-2xl overflow-hidden shadow-md border border-borderColor">
                    <img src={banner.image} alt="Promo Banner" className="w-full h-[180px] sm:h-[220px] object-contain bg-black" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Esports Games */}
          <div className="px-4 pb-4">
            <h2 className="font-bold text-sm text-[#132040] mb-3">Esports Games</h2>
            <div className="grid grid-cols-2 gap-3">
               {GAME_CATEGORIES.map(cat => {
                const count = tournaments.filter(t => t.category?.toLowerCase() === cat.id.toLowerCase() && t.status?.toLowerCase() === 'upcoming').length;
                return (
                  <motion.div key={cat.id} whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedCategory(cat.id); setContestTab('upcoming'); }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer shadow-md bg-black">
                    {(() => {
                      const catImage = getCategoryThumbnail(cat.id, categoryBanners);
                      return catImage ? (
                        <img src={catImage} alt={cat.label} className="w-full h-auto block" />
                      ) : (
                        <div className={`w-full h-32 relative bg-gradient-to-br ${cat.bg}`}>
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                            <span className="text-3xl mb-1">{cat.icon}</span>
                            <p className="text-textPrimary font-black text-sm text-center tracking-wider leading-tight">
                              {cat.label}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                    {/* Player count */}
                    <div className="absolute bottom-2 left-3 flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span className="text-textPrimary text-[10px] font-semibold">{count}</span>
                    </div>
                    {/* FF MAX badge */}
                    <div className="absolute top-2 right-2 bg-black/40 rounded px-1 py-0.5">
                      <span className="text-[#f5c518] text-[8px] font-bold">FF MAX</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {activeNav === 'leaderboard' && (
        <div className="px-4 py-5">
          <h2 className="font-bold text-base text-[#132040] mb-4 text-center">🏆 Leaderboard</h2>
          
          <div className="flex bg-[#0a1628] rounded-xl p-1 mb-5 border border-borderColor">
            {([
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'all', label: 'All Time' }
            ] as const).map(f => (
              <button key={f.id} onClick={() => setLeaderboardFilter(f.id)}
                className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-lg transition ${leaderboardFilter === f.id ? 'bg-[#f5c518] text-[#132040]' : 'text-textSecondary hover:text-textPrimary'}`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {tournaments
              .filter(t => {
                if (leaderboardFilter === 'all') return true;
                if (!t.date || !t.time) return false;
                const matchDate = parseMatchDate(t.date, t.time);
                const now = new Date();
                if (leaderboardFilter === 'daily') {
                  return matchDate.toDateString() === now.toDateString();
                }
                if (leaderboardFilter === 'weekly') {
                  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                  return matchDate >= oneWeekAgo && matchDate <= now;
                }
                if (leaderboardFilter === 'monthly') {
                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(now.getMonth() - 1);
                  return matchDate >= oneMonthAgo && matchDate <= now;
                }
                return true;
              })
              .flatMap(t => t.joinedPlayers || [])
              .reduce((acc: any[], p: any) => {
                const name = p.name || p.user?.username || 'Unknown';
                const ex = acc.find(a => a.name === name);
                if (ex) { ex.kills += p.kills || 0; ex.wins += p.rank === 1 ? 1 : 0; }
                else acc.push({ name, kills: p.kills || 0, wins: p.rank === 1 ? 1 : 0 });
                return acc;
              }, [])
              .sort((a, b) => b.kills - a.kills)
              .slice(0, 20)
              .map((player, i) => (
                <div key={i} className="bg-bgSurface rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm">
                  <span className={`font-black text-sm w-6 text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-textSecondary' : i === 2 ? 'text-orange-600' : 'text-textSecondary'}`}>
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-br from-[#132040] to-[#1a73e8] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-textPrimary" />
                  </div>
                  <p className="flex-1 font-semibold text-sm text-textPrimary">{player.name}</p>
                  <div className="text-right">
                    <p className="text-xs text-textSecondary">Kills: <span className="font-bold text-red-500">{player.kills}</span></p>
                    <p className="text-xs text-textSecondary">Wins: <span className="font-bold text-yellow-500">{player.wins}</span></p>
                  </div>
                </div>
              ))}
            {tournaments.length === 0 && (
              <div className="text-center py-16 text-textSecondary">No data yet</div>
            )}
          </div>
        </div>
      )}

      {activeNav === 'wallet' && (
        <div className="px-4 py-5">
          <h2 className="font-bold text-base text-[#132040] mb-4 text-center">🪙 Coin</h2>

          {/* Balance */}
          <div className="bg-gradient-to-br from-[#132040] to-[#1a3060] rounded-2xl p-5 mb-5 shadow-lg text-center">
            <p className="text-textSecondary text-xs mb-1">Your Balance</p>
            <p className="text-[#f5c518] font-black text-4xl">🪙 {user.coins || 0}</p>
            <p className="text-textSecondary text-xs mt-1">Winnings: ₹{user.winnings || 0}</p>
          </div>

          {/* Deposit */}
          <div className="bg-bgSurface rounded-2xl p-5 mb-4 shadow-sm">
            <h3 className="font-bold text-sm text-[#132040] mb-3">Deposit Coins</h3>
            <div className="flex gap-3">
              <input type="number" placeholder="Amount (₹)" value={depositAmt}
                onChange={e => setDepositAmt(e.target.value)}
                className="flex-1 border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f5c518] text-textPrimary" />
              <button onClick={handleDeposit}
                className="bg-bgSurface text-[#f5c518] font-bold px-5 py-3 rounded-xl text-sm">
                PAY
              </button>
            </div>
          </div>

          {/* QR Modal */}
          <AnimatePresence>
            {showDepositQR && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  className="bg-bgSurface rounded-2xl p-6 w-full max-w-sm text-center">
                  <h3 className="font-bold text-lg text-[#132040] mb-2">Scan & Pay</h3>
                  <p className="text-textSecondary text-xs mb-4">Pay ₹{depositAmt} via UPI</p>
                  <div className="bg-bgSurface p-3 rounded-xl border-2 border-[#f5c518] w-44 h-44 mx-auto mb-4">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=7017022966@ibl%26pn=FragArena%26am=${depositAmt}%26cu=INR`}
                      alt="UPI QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-textSecondary mb-4">Scan with GPay, PhonePe, Paytm</p>
                  <input type="text" placeholder="Enter UTR / Transaction ID" value={depositUtr}
                    onChange={e => setDepositUtr(e.target.value)}
                    className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f5c518] mb-4 text-center text-textPrimary font-semibold" />
                  <div className="flex gap-3">
                    <button onClick={() => setShowDepositQR(false)}
                      className="flex-1 py-3 border border-red-200 text-red-500 font-bold rounded-xl text-sm">Cancel</button>
                    <button onClick={handleVerifyDeposit}
                      className="flex-1 py-3 bg-bgSurface text-[#f5c518] font-bold rounded-xl text-sm">Submit UTR</button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {successWithdrawal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  className="bg-bgSurface rounded-2xl p-6 w-full max-w-sm text-center space-y-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-2xl">
                    ✅
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg text-[#132040]">Request Submitted!</h3>
                    <p className="text-textSecondary text-xs mt-1">Your withdrawal request has been registered.</p>
                  </div>

                  <div className="bg-bgPrimary rounded-xl p-4 border border-borderColor space-y-2 text-left">
                    <div>
                      <p className="text-textSecondary text-[10px] uppercase font-bold">Request ID</p>
                      <p className="text-textPrimary font-mono font-bold text-sm tracking-wider select-all">{successWithdrawal.txId}</p>
                    </div>
                    <div>
                      <p className="text-textSecondary text-[10px] uppercase font-bold">Amount</p>
                      <p className="text-green-600 font-black text-base">₹{successWithdrawal.amount}</p>
                    </div>
                  </div>

                  <div className="text-xs text-yellow-600 font-bold bg-yellow-50 rounded-xl p-3 border border-yellow-100 text-left leading-relaxed">
                    ⚠️ <b>Important Notice:</b> Copy your Request ID and send it to Customer Care on WhatsApp to get instant verification and approval!
                  </div>

                  <div className="space-y-2">
                    <button onClick={() => {
                      navigator.clipboard.writeText(successWithdrawal.txId);
                      const textMsg = encodeURIComponent(`Hello Admin, I have submitted a withdrawal request of ₹${successWithdrawal.amount}. My Request ID is: ${successWithdrawal.txId}. Please approve it.`);
                      window.open(`https://api.whatsapp.com/send?phone=917017022966&text=${textMsg}`, '_blank');
                    }}
                      className="w-full bg-green-500 text-textPrimary font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow hover:bg-green-600 active:scale-95 transition">
                      💬 Send Request ID to WhatsApp
                    </button>

                    <button onClick={() => setSuccessWithdrawal(null)}
                      className="w-full py-2.5 text-textSecondary font-bold text-xs hover:underline">
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Withdraw */}
          <div className="bg-bgSurface rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-[#132040] mb-3">Withdraw Winnings</h3>
            <div className="space-y-3">
              <input type="number" placeholder="Amount (₹)" value={withdrawAmt}
                onChange={e => setWithdrawAmt(e.target.value)}
                className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f5c518] text-textPrimary" />
              <input type="text" placeholder="Your UPI ID" value={withdrawUpi}
                onChange={e => setWithdrawUpi(e.target.value)}
                className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#f5c518] text-textPrimary" />
              <button onClick={handleWithdraw}
                className="w-full bg-green-500 text-textPrimary font-bold py-3 rounded-xl text-sm">
                WITHDRAW
              </button>
            </div>
          </div>

          {walletMsg && (
            <div className={`mt-4 p-3 rounded-xl text-center text-sm font-bold ${walletMsg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {walletMsg}
            </div>
          )}
        </div>
      )}

      {activeNav === 'earn' && (
        <div className="px-4 py-8 min-h-screen">
          <div className="bg-gradient-to-br from-[#132040] to-[#1a3060] rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Gift className="w-32 h-32 text-white" />
            </div>
            <Gift className="w-16 h-16 text-[#f5c518] mx-auto mb-4 relative z-10" />
            <h2 className="font-black text-2xl text-white mb-2 relative z-10">REFER & EARN</h2>
            <p className="text-gray-300 text-sm mb-6 relative z-10">Invite your friends and earn <span className="text-[#f5c518] font-bold">10 Coins</span> for every successful registration!</p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 relative z-10 border border-white/20">
              <p className="text-xs text-gray-300 uppercase tracking-widest font-bold mb-2">Your Referral Code</p>
              <p className="text-3xl font-black text-white tracking-widest">{user?.username}</p>
            </div>

            <button onClick={() => {
              const inviteText = encodeURIComponent(`Hey! Play Free Fire matches on FragArena & earn real cash! 🎮💸\n\nRegister using my Referral Code: ${user?.username} to get 10 Welcome Bonus Coins instantly!\n\nDownload/Join App here: ${window.location.origin}`);
              window.open(`https://api.whatsapp.com/send?text=${inviteText}`, '_blank');
            }} className="w-full bg-[#f5c518] hover:bg-yellow-400 text-[#132040] font-black py-4 rounded-2xl tracking-wide shadow-lg transition active:scale-95 relative z-10 flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              INVITE VIA WHATSAPP
            </button>
          </div>
        </div>
      )}

      {activeNav === 'menu' && (
        <div className="min-h-screen bg-[#f0f2f5] pb-24">
          {/* Top Blue Section */}
          <div className="bg-[#042e5a] px-4 pt-10 pb-6 rounded-b-3xl shadow-md text-center relative z-10">
            <div className="inline-block relative">
              <div className="w-20 h-20 bg-bgSurface rounded-full flex items-center justify-center p-1 mx-auto shadow-lg relative z-10">
                <div className="w-full h-full bg-gradient-to-br from-[#042e5a] to-[#1a73e8] rounded-full flex items-center justify-center border-2 border-dashed border-[#f5c518]">
                  <span className="text-textPrimary font-black text-3xl">{user.username.charAt(0).toUpperCase()}</span>
                </div>
              </div>
            </div>
            <h2 className="text-textPrimary font-bold text-xl mt-3">{user.username}</h2>
            <p className="text-gray-300 text-sm mt-1">{user.phone}</p>
            {user.role === 'admin' && (
              <span className="bg-red-500 text-textPrimary text-xs px-2 py-0.5 rounded font-bold mt-2 inline-block">ADMIN</span>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex justify-center gap-4 px-4 -mt-4 relative z-20">
            <div className="bg-bgSurface rounded-xl shadow-md p-3 flex-1 text-center border border-borderColor">
              <p className="text-[#042e5a] font-black text-xl">0</p>
              <p className="text-[9px] text-textSecondary font-bold uppercase mt-1">Matches<br/>Played</p>
            </div>
            <div className="bg-bgSurface rounded-xl shadow-md p-3 flex-1 text-center border border-borderColor">
              <p className="text-[#042e5a] font-black text-xl">0</p>
              <p className="text-[9px] text-textSecondary font-bold uppercase mt-1">Total<br/>Kills</p>
            </div>
            <div className="bg-bgSurface rounded-xl shadow-md p-3 flex-1 text-center border border-borderColor">
              <p className="text-[#042e5a] font-black text-xl">0</p>
              <p className="text-[9px] text-textSecondary font-bold uppercase mt-1">Total<br/>Earning</p>
            </div>
          </div>

          {/* Menu Options List */}
          <div className="px-4 mt-8 mb-6">
            <div className="bg-bgSurface rounded-2xl shadow-sm border border-borderColor overflow-hidden">
              <button onClick={() => setShowStatsModal(true)} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">📊</span> MY STATISTICS
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>

              <button onClick={() => {
                setProfileForm({ ffName: user.ffName || '', ffUid: user.ffUid || '', username: user.username, phone: user.phone });
                setShowProfileModal(true);
              }} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">👤</span> MY PROFILE
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>
              
              <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">🔐</span> CHANGE PASSWORD
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>

              <button onClick={() => setActiveNav('wallet')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">💳</span> MY COINS
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>
              
              <button onClick={() => setSelectedMyMatchesTab('completed')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">🎮</span> MY MATCHES
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>
              
              <button onClick={() => setActiveNav('leaderboard')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">📊</span> TOP PLAYERS
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>

              <a href="https://wa.me/917017022966" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">📞</span> CUSTOMER SUPPORT
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </a>

              <div className="w-full flex items-center justify-between p-4 border-b border-gray-50 bg-bgPrimary">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">🔔</span> IMPORTANT NOTICE
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={importantNoticeOn} onChange={(e) => {
                    setImportantNoticeOn(e.target.checked);
                    if(e.target.checked) alert('Important Notice Notifications Enabled!');
                  }} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#042e5a]"></div>
                </label>
              </div>

              <button onClick={() => setLegalModal('terms')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">📜</span> TERMS & CONDITIONS
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>

              <button onClick={() => setLegalModal('privacy')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">🔒</span> PRIVACY POLICY
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>

              <button onClick={() => setLegalModal('about')} className="w-full flex items-center justify-between p-4 border-b border-gray-50 hover:bg-bgPrimary active:bg-gray-100 transition">
                <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                  <span className="text-xl">ℹ️</span> ABOUT US
                </div>
                <ChevronLeft className="w-5 h-5 text-textSecondary rotate-180" />
              </button>

              <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-red-50 active:bg-red-100 transition group">
                <div className="flex items-center gap-3 text-sm font-bold text-red-500 group-hover:text-red-600">
                  <span className="text-xl">🚪</span> LOGOUT
                </div>
                <LogOut className="w-4 h-4 text-red-400 group-hover:text-red-500" />
              </button>
            </div>
          </div>

          {/* Host / Admin Panel (if applicable) */}
          {(user.role === 'admin' || user.role === 'host' || user.role === 'finance_admin') && (
            <div className="px-4 mb-6">
              <HostPanel user={user} token={token} getHeaders={getHeaders} tournaments={tournaments} setTournaments={setTournaments} setShowCreateMatch={setShowCreateMatch} setSelectedCategory={setSelectedCategory} API_URL={API_URL} categoryBanners={categoryBanners} setCategoryBanners={setCategoryBanners} />
            </div>
          )}

        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-bgSurface rounded-2xl w-full max-w-sm p-6 relative">
            <h3 className="font-black text-[#042e5a] text-lg mb-4">Edit Profile</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Username</label>
                <input required value={profileForm.username} onChange={e => setProfileForm({...profileForm, username: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Phone Number</label>
                <input required value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Free Fire UID</label>
                <input value={profileForm.ffUid} onChange={e => setProfileForm({...profileForm, ffUid: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Free Fire Name</label>
                <input value={profileForm.ffName} onChange={e => setProfileForm({...profileForm, ffName: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 font-bold text-white bg-[#042e5a] rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-bgSurface rounded-2xl w-full max-w-sm p-6 relative">
            <h3 className="font-black text-[#042e5a] text-lg mb-4">Change Password</h3>
            <form onSubmit={handleUserChangePassword} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">Old Password</label>
                <input type="password" required value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div>
                <label className="text-xs font-bold text-textSecondary ml-1">New Password</label>
                <input type="password" required value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full border border-borderColor rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#042e5a]" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-3 font-bold text-white bg-[#042e5a] rounded-xl">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-bgSurface rounded-2xl w-full max-w-sm p-6 relative">
            <h3 className="font-black text-[#042e5a] text-lg mb-4">My Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-blue-900 font-black text-2xl">{user.stats?.matches || 0}</p>
                <p className="text-[10px] text-blue-700 font-bold uppercase mt-1">Matches Played</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                <p className="text-green-900 font-black text-2xl">{user.stats?.wins || 0}</p>
                <p className="text-[10px] text-green-700 font-bold uppercase mt-1">Matches Won</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                <p className="text-red-900 font-black text-2xl">{user.stats?.kills || 0}</p>
                <p className="text-[10px] text-red-700 font-bold uppercase mt-1">Total Kills</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 text-center border border-yellow-100">
                <p className="text-yellow-900 font-black text-2xl">₹{user.stats?.earned || 0}</p>
                <p className="text-[10px] text-yellow-700 font-bold uppercase mt-1">Total Earnings</p>
              </div>
            </div>
            <button onClick={() => setShowStatsModal(false)} className="w-full mt-6 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl">Close</button>
          </div>
        </div>
      )}

      {/* Legal Modals */}
      {legalModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-bgSurface rounded-2xl w-full max-w-md p-6 relative max-h-[80vh] flex flex-col">
            <h3 className="font-black text-[#042e5a] text-lg mb-4 uppercase">
              {legalModal === 'terms' ? 'Terms & Conditions' : legalModal === 'privacy' ? 'Privacy Policy' : 'About Us'}
            </h3>
            <div className="overflow-y-auto text-sm text-gray-700 pr-2 flex-1">
              {legalModal === 'terms' && (
                <p>Welcome to our App! By using this service, you agree to abide by our terms. All tournament entry fees are final. Prize pools are distributed automatically to your winning wallet. You are responsible for ensuring your Free Fire ID is entered correctly...</p>
              )}
              {legalModal === 'privacy' && (
                <p>Your privacy is important to us. We securely store your phone number and Free Fire UID to ensure seamless tournament registrations and prize distributions. We do not sell your personal data to third parties. For data deletion requests, contact our support.</p>
              )}
              {legalModal === 'about' && (
                <p>We are the ultimate Esports Tournament platform for Free Fire players! Join daily custom rooms, clash squads, and lone wolf matches to win real cash prizes based on your skills and kills.</p>
              )}
            </div>
            <button onClick={() => setLegalModal(null)} className="w-full mt-6 py-3 font-bold text-white bg-[#042e5a] rounded-xl">Close</button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-bgSurface border-t border-borderColor flex shadow-2xl">
        {([
          { id: 'home', icon: HomeIcon, label: 'Home' },
          { id: 'earn', icon: Gift, label: 'Earn' },
          { id: 'wallet', icon: Coins, label: 'Coin' },
          { id: 'leaderboard', icon: TrendingUp, label: 'Ranking' },
          { id: 'menu', icon: Menu, label: 'Menu' },
        ] as const).map(nav => (
          <button key={nav.id} onClick={() => setActiveNav(nav.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition ${activeNav === nav.id ? 'text-[#132040]' : 'text-textSecondary'}`}>
            <nav.icon className={`w-5 h-5 ${activeNav === nav.id ? 'text-[#132040]' : ''}`} />
            <span className="text-[10px] font-semibold">{nav.label}</span>
            {activeNav === nav.id && (
              <div className="w-1 h-1 rounded-full bg-bgSurface mt-0.5" />
            )}
          </button>
        ))}
      </div>

      {/* Create Match Modal (from admin menu) */}
      <AnimatePresence>
        {showCreateMatch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full bg-bgSurface rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-[#132040]">Create New Match</h3>
                <button onClick={() => setShowCreateMatch(false)} className="text-textSecondary">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateMatch} className="space-y-4">
                <input className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Match Title" value={newMatch.title} onChange={e => setNewMatch({...newMatch, title: e.target.value})} required />
                <select className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.category} onChange={e => setNewMatch({...newMatch, category: e.target.value})}>
                  {GAME_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Date (YYYY-MM-DD)" value={newMatch.date} onChange={e => setNewMatch({...newMatch, date: e.target.value})} required />
                  <input className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Time (09:00 AM)" value={newMatch.time} onChange={e => setNewMatch({...newMatch, time: e.target.value})} required />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Entry Fee" value={newMatch.entryFee} onChange={e => setNewMatch({...newMatch, entryFee: e.target.value})} required />
                  <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Prize Pool" value={newMatch.prizePool} onChange={e => setNewMatch({...newMatch, prizePool: e.target.value})} required />
                  <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Per Kill" value={newMatch.perKill} onChange={e => setNewMatch({...newMatch, perKill: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" className="border border-borderColor rounded-xl px-4 py-3 text-sm" placeholder="Total Slots" value={newMatch.totalSlots} onChange={e => setNewMatch({...newMatch, totalSlots: e.target.value})} required />
                  <select className="border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.map} onChange={e => setNewMatch({...newMatch, map: e.target.value})}>
                    <option>Bermuda</option><option>Kalahari</option><option>Purgatory</option><option>Alpine</option>
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <select className="border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.teamType} onChange={e => setNewMatch({...newMatch, teamType: e.target.value})}>
                    <option>Solo</option><option>Duo</option><option>Squad</option>
                  </select>
                  <select className="border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.mode} onChange={e => setNewMatch({...newMatch, mode: e.target.value})}>
                    <option>Solo</option><option>1v1</option><option>2v2</option><option>4v4</option>
                  </select>
                  <select className="border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.matchType} onChange={e => setNewMatch({...newMatch, matchType: e.target.value})}>
                    <option>Paid</option><option>Free</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-textSecondary mb-1 block">Prize Distribution</label>
                  <input className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm" value={newMatch.prizeDistribution} onChange={e => setNewMatch({...newMatch, prizeDistribution: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-textSecondary mb-1 block">Rules (one per line)</label>
                  <textarea rows={4} className="w-full border border-borderColor rounded-xl px-4 py-3 text-sm resize-none" value={newMatch.rules} onChange={e => setNewMatch({...newMatch, rules: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-bgSurface text-[#f5c518] font-bold py-4 rounded-xl text-sm tracking-widest">
                  CREATE MATCH
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit App Confirmation Overlay - belongs to Home component */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a1628] border border-borderColor rounded-2xl p-6 w-full max-w-xs text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto text-red-500 text-xl font-bold">
              ⚠️
            </div>
            <div className="space-y-1">
              <h3 className="text-textPrimary font-bold text-base">Exit FragArena?</h3>
              <p className="text-textSecondary text-xs">Are you sure you want to exit the application?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl text-xs active:scale-95 transition">
                Cancel
              </button>
              <button onClick={() => { setShowExitConfirm(false); window.close(); }}
                className="flex-1 py-3 bg-red-500 text-textPrimary font-black rounded-xl text-xs hover:bg-red-600 active:scale-95 transition">
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function HostPanel({ user, token, getHeaders, tournaments, setTournaments, setShowCreateMatch, setSelectedCategory, API_URL, categoryBanners, setCategoryBanners }) {
  const handleFileUpload = async (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setMsg('Uploading image...');
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const res = await fetch(`${API_URL}/admin/upload-image`, {
        method: 'POST',
        headers: { 'x-auth-token': token },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const fullUrl = API_URL.replace('/api', '') + data.url;
        callback(fullUrl);
        setMsg('Image uploaded successfully!');
        setTimeout(() => setMsg(''), 3000);
      } else {
        setMsg('Upload failed: ' + (data.msg || 'Unknown error'));
      }
    } catch (err) {
      setMsg('Upload failed: ' + err.message);
    }
  };

  const [adminPromoBanners, setAdminPromoBanners] = useState([]);
  const [savingPromo, setSavingPromo] = useState(false);
  useEffect(() => {
    fetch(`${API_URL}/admin/settings/promo-banners`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAdminPromoBanners(d); });
  }, [API_URL]);

  const handleSavePromoBanners = async () => {
    setSavingPromo(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings/promo-banners`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ banners: adminPromoBanners })
      });
      if (res.ok) setMsg('Promo Banners updated!');
    } catch (e) {
      setMsg('Error saving promo banners');
    }
    setSavingPromo(false);
  };

  const [hostedMatches, setHostedMatches] = useState([]);
  const [draftBanners, setDraftBanners] = useState({});
  const [savingBanners, setSavingBanners] = useState(false);

  useEffect(() => {
    setDraftBanners(categoryBanners || {});
  }, [categoryBanners]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomIdInput, setRoomIdInput] = useState('');
  const [roomPassInput, setRoomPassInput] = useState('');
  const [editingNoticeId, setEditingNoticeId] = useState(null);
  const [matchNoticeInput, setMatchNoticeInput] = useState('');
  const [resolvingMatch, setResolvingMatch] = useState(null);
  const [viewingPlayersMatch, setViewingPlayersMatch] = useState(null);
  const [playerStandings, setPlayerStandings] = useState([]);
  const [resolvingSubmitLoading, setResolvingSubmitLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [pendingDeposits, setPendingDeposits] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [usersSearch, setUsersSearch] = useState('');
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [announcementMsg, setAnnouncementMsg] = useState('');

  const fetchPendingTransactions = useCallback(async () => {
    if (user.role !== 'admin' && user.role !== 'finance_admin') return;
    setLoadingTransactions(true);
    try {
      const depRes = await fetch(`${API_URL}/admin/deposits`, { headers: getHeaders() });
      if (depRes.ok) setPendingDeposits(await depRes.json());

      const witRes = await fetch(`${API_URL}/admin/withdrawals`, { headers: getHeaders() });
      if (witRes.ok) setPendingWithdrawals(await witRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTransactions(false);
    }
  }, [API_URL, getHeaders, user.role]);

  const handleResolveDeposit = async (id, action) => {
    try {
      const res = await fetch(`${API_URL}/admin/deposits/${id}/resolve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setMsg(`Deposit request ${action}ed successfully!`);
        fetchPendingTransactions();
      } else {
        const data = await res.json();
        setMsg(data.msg || 'Action failed');
      }
    } catch {
      setMsg('Connection error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleResolveWithdrawal = async (id, action) => {
    try {
      const res = await fetch(`${API_URL}/admin/withdrawals/${id}/resolve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setMsg(`Withdrawal request ${action}ed successfully!`);
        fetchPendingTransactions();
      } else {
        const data = await res.json();
        setMsg(data.msg || 'Action failed');
      }
    } catch {
      setMsg('Connection error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleChangeUserPassword = async (targetUser) => {
    const newPass = prompt(`Enter new password for ${targetUser.username}:`);
    if (!newPass) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${targetUser._id}/password`, {
        method: 'PUT', headers: getHeaders(),
        body: JSON.stringify({ newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok) setMsg(`Password changed for ${targetUser.username}`);
      else setMsg(data.msg || 'Failed to change password');
    } catch { setMsg('Action failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleBanUser = async (targetUser) => {
    if (!confirm(`Are you sure you want to ${targetUser.isBanned ? 'unban' : 'ban'} ${targetUser.username}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${targetUser._id}/ban`, {
        method: 'PUT', headers: getHeaders()
      });
      if (res.ok) {
        setMsg(`User ${targetUser.isBanned ? 'unbanned' : 'banned'}!`);
        handleSearchUsers();
      }
    } catch { setMsg('Action failed'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleAnnounceInApp = async () => {
    if (!announcementMsg.trim()) return;
    try {
      const res = await fetch(`${API_URL}/admin/settings/announcement`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ message: announcementMsg })
      });
      if (res.ok) setMsg('In-App Announcement updated!');
    } catch { setMsg('Failed to update'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleAnnouncePush = async () => {
    if (!announcementMsg.trim()) return;
    if (!confirm('Are you sure you want to send a Push Notification to ALL users?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/notifications/send`, {
        method: 'POST', headers: getHeaders(),
        body: JSON.stringify({ title: 'FragArena Update', body: announcementMsg })
      });
      if (res.ok) setMsg('Push Notifications sent!');
    } catch { setMsg('Failed to send push'); }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSearchUsers = async () => {
    if (!usersSearch.trim()) return;
    setSearchingUsers(true);
    try {
      const res = await fetch(`${API_URL}/admin/users?search=${encodeURIComponent(usersSearch)}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        setSearchedUsers(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleToggleHostRole = async (targetUser) => {
    const newRole = targetUser.role === 'host' ? 'player' : 'host';
    setUpdatingRole(targetUser._id);
    try {
      const res = await fetch(`${API_URL}/admin/users/${targetUser._id}/role`, {
        method: 'POST',
        headers: {
          ...getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        const data = await res.json();
        setSearchedUsers(prev => prev.map(u => u._id === targetUser._id ? { ...u, role: data.user.role } : u));
        setMsg(`Role for ${targetUser.username} updated to ${data.user.role}!`);
        setTimeout(() => setMsg(''), 3000);
      } else {
        const data = await res.json();
        alert(data.msg || 'Failed to update role');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingRole(null);
    }
  };

  const fetchHostedMatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/host/matches`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setHostedMatches(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMatches(false);
    }
  }, [API_URL, getHeaders]);

  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  const [schedTime, setSchedTime] = useState('09:00 AM');
  const [schedCategory, setSchedCategory] = useState('Lone Wolf 1v1');
  const [schedTitle, setSchedTitle] = useState('Lone Wolf 1v1 – ₹15 Entry');
  const [schedEntryFee, setSchedEntryFee] = useState('15');
  const [schedPrizePool, setSchedPrizePool] = useState('25');
  const [schedPerKill, setSchedPerKill] = useState('0');
  const [schedTotalSlots, setSchedTotalSlots] = useState('2');
  const [schedRules, setSchedRules] = useState('');
  const [schedNotice, setSchedNotice] = useState('');

  const fetchSchedules = useCallback(async () => {
    if (user.role !== 'admin' && user.role !== 'finance_admin') return;
    setLoadingSchedules(true);
    try {
      const res = await fetch(`${API_URL}/admin/schedules`, { headers: getHeaders() });
      if (res.ok) setSchedules(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSchedules(false);
    }
  }, [API_URL, getHeaders, user.role]);


  const handleSaveBanners = async () => {
    setSavingBanners(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings/category-banners`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ banners: draftBanners })
      });
      const data = await res.json();
      if (res.ok) {
        setCategoryBanners(data.banners);
        setMsg('Banners saved successfully!');
      } else {
        setMsg(data.msg || 'Error saving banners');
      }
    } catch (err) {
      console.error(err);
      setMsg('Network error saving banners');
    }
    setSavingBanners(false);
    setTimeout(() => setMsg(''), 3000);
  };

  const fetchStats = useCallback(async () => {
    if (user.role !== 'admin' && user.role !== 'finance_admin') return;
    setLoadingStats(true);
    try {
      const res = await fetch(`${API_URL}/admin/stats`, { headers: getHeaders() });
      if (res.ok) setStats(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  }, [API_URL, getHeaders, user.role]);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    const payload = {
      time: schedTime,
      category: schedCategory,
      title: schedTitle,
      entryFee: parseInt(schedEntryFee),
      prizePool: parseInt(schedPrizePool),
      perKill: parseInt(schedPerKill || 0),
      totalSlots: parseInt(schedTotalSlots || 20),
      rules: schedRules,
      notice: schedNotice
    };

    try {
      const url = editingSchedule ? `${API_URL}/admin/schedules/${editingSchedule._id}` : `${API_URL}/admin/schedules`;
      const method = editingSchedule ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMsg(editingSchedule ? 'Schedule updated!' : 'Schedule template added!');
        setShowScheduleForm(false);
        setEditingSchedule(null);
        fetchSchedules();
      } else {
        const data = await res.json();
        setMsg(data.msg || 'Save failed');
      }
    } catch {
      setMsg('Connection error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleToggleSchedule = async (sched) => {
    try {
      const res = await fetch(`${API_URL}/admin/schedules/${sched._id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ enabled: !sched.enabled })
      });
      if (res.ok) {
        setMsg(`Schedule ${!sched.enabled ? 'enabled' : 'disabled'}!`);
        fetchSchedules();
      }
    } catch {
      setMsg('Toggle failed');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDeleteSchedule = async (id) => {
    if (!confirm('Are you sure you want to delete this schedule template?')) return;
    try {
      const res = await fetch(`${API_URL}/admin/schedules/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setMsg('Schedule deleted!');
        fetchSchedules();
      }
    } catch {
      setMsg('Delete failed');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const startEditSchedule = (sched) => {
    setEditingSchedule(sched);
    setSchedTime(sched.time);
    setSchedCategory(sched.category);
    setSchedTitle(sched.title);
    setSchedEntryFee(String(sched.entryFee));
    setSchedPrizePool(String(sched.prizePool));
    setSchedPerKill(String(sched.perKill || 0));
    setSchedTotalSlots(String(sched.totalSlots || 20));
    setSchedRules(Array.isArray(sched.rules) ? sched.rules.join('\n') : (sched.rules || ''));
    setSchedNotice(sched.notice || '');
    setShowScheduleForm(true);
  };

  const startAddSchedule = () => {
    setEditingSchedule(null);
    setSchedTime('09:00 AM');
    setSchedCategory('Lone Wolf 1v1');
    setSchedTitle('Lone Wolf 1v1 – ₹15 Entry');
    setSchedEntryFee('15');
    setSchedPrizePool('25');
    setSchedPerKill('0');
    setSchedTotalSlots('2');
    setSchedRules('');
    setSchedNotice('');
    setShowScheduleForm(true);
  };

  useEffect(() => {
    fetchHostedMatches();
    fetchPendingTransactions();
    fetchSchedules();
    fetchStats();
  }, [fetchHostedMatches, fetchPendingTransactions, fetchSchedules, fetchStats]);

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match history?')) return;
    try {
      const res = await fetch(`${API_URL}/host/match/${matchId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setMsg('Match deleted successfully!');
        fetchHostedMatches();
      } else {
        const errData = await res.json();
        alert(errData.msg || 'Error deleting match');
      }
    } catch (e) {
      console.error(e);
      alert('Network error');
    }
  };

  const handleSaveRoom = async (matchId) => {
    try {
      const res = await fetch(`${API_URL}/host/match/${matchId}/room`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ roomId: roomIdInput, roomPass: roomPassInput })
      });
      if (res.ok) {
        setMsg('Room info updated!');
        setEditingRoomId(null);
        fetchHostedMatches();
      } else {
        const data = await res.json();
        setMsg(data.msg || 'Update failed');
      }
    } catch {
      setMsg('Connection error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const handleSaveNotice = async (matchId) => {
    try {
      const res = await fetch(`${API_URL}/host/match/${matchId}/notice`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ notice: matchNoticeInput })
      });
      if (res.ok) {
        setMsg('Match notice announcement updated!');
        setEditingNoticeId(null);
        fetchHostedMatches();
      } else {
        const data = await res.json();
        setMsg(data.msg || 'Update failed');
      }
    } catch {
      setMsg('Connection error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  const startResolve = (match) => {
    setResolvingMatch(match);
    const standings = match.joinedPlayers.map(p => ({
      uid: p.uid || p.user?.ffUid || '',
      name: p.name || p.user?.username || '',
      kills: p.kills || 0,
      rank: p.rank || 0
    }));
    setPlayerStandings(standings);
  };

  const handleUpdateStanding = (index, field, value) => {
    const updated = [...playerStandings];
    updated[index] = {
      ...updated[index],
      [field]: field === 'name' || field === 'uid' ? value : parseInt(value) || 0
    };
    setPlayerStandings(updated);
  };

  const handleResolveSubmit = async () => {
    setResolvingSubmitLoading(true);
    try {
      const res = await fetch(`${API_URL}/host/match/${resolvingMatch._id}/resolve`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ playerResults: playerStandings })
      });
      if (res.ok) {
        setMsg('Match resolved successfully!');
        setResolvingMatch(null);
        fetchHostedMatches();
      } else {
        const data = await res.json();
        setMsg(data.msg || 'Resolve failed');
      }
    } catch {
      setMsg('Connection error');
    } finally {
      setResolvingSubmitLoading(false);
    }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="bg-bgSurface rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b pb-3 border-borderColor">
        <h3 className="font-bold text-sm text-[#132040]">🛠️ Host/Admin Panel</h3>
        {user.role === 'admin' && (
          <button onClick={() => { setSelectedCategory('BR Survival'); setShowCreateMatch(true); }}
            className="bg-[#f5c518] text-black font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 active:scale-95 transition">
            + Create Match
          </button>
        )}
      </div>


      {/* Promo Banners Manager */}
      {(user.role === 'admin' || user.role === 'finance_admin') && (
        <div className="border border-borderColor rounded-2xl p-4 bg-bgSurface space-y-3">
          <p className="text-xs text-textSecondary font-bold">📢 Manage Promo Banners</p>
          <div className="space-y-3">
            {adminPromoBanners.map((banner, i) => (
              <div key={i} className="border border-borderColor rounded-xl p-3 bg-bgPrimary flex flex-col gap-2 relative">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-textSecondary">Banner Image (Upload File)</label>
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*"
                      onChange={(e) => handleFileUpload(e, (url) => {
                        const newBanners = [...adminPromoBanners];
                        newBanners[i].image = url;
                        setAdminPromoBanners(newBanners);
                      })}
                      className="flex-1 border border-borderColor rounded-lg px-2 py-1.5 text-xs bg-bgSurface text-textPrimary" />
                    {banner.image && <img src={banner.image} alt="preview" className="w-12 h-10 object-cover rounded shadow-sm" />}
                  </div>
                </div>
                <input type="text" placeholder="Redirect Link (e.g., YouTube/WhatsApp URL)" value={banner.link || ''}
                  onChange={e => {
                    const newBanners = [...adminPromoBanners];
                    newBanners[i].link = e.target.value;
                    setAdminPromoBanners(newBanners);
                  }} className="w-full border border-borderColor rounded-lg px-3 py-2 text-xs bg-bgSurface text-textPrimary" />
                <button onClick={() => {
                  const newBanners = [...adminPromoBanners];
                  newBanners.splice(i, 1);
                  setAdminPromoBanners(newBanners);
                }} className="absolute top-2 right-2 text-red-500 text-xs font-bold bg-red-100 px-2 py-1 rounded">Remove</button>
              </div>
            ))}
            <button onClick={() => setAdminPromoBanners([...adminPromoBanners, { image: '', link: '' }])}
              className="w-full py-2 bg-blue-100 text-blue-700 font-bold rounded-xl text-xs">+ Add Banner Slot</button>
            <button onClick={handleSavePromoBanners} disabled={savingPromo}
              className="w-full py-2 bg-green-500 text-textPrimary font-bold rounded-xl text-xs shadow-sm active:scale-95 transition">
              {savingPromo ? 'Saving...' : 'Save All Promo Banners'}
            </button>
          </div>
        </div>
      )}
      {(user.role === 'admin' || user.role === 'finance_admin') && (
        <div className="border border-borderColor rounded-2xl p-4 bg-bgSurface space-y-3">
          <p className="text-xs text-textSecondary font-bold">📊 Platform Analytics</p>
          {loadingStats ? (
            <p className="text-xs text-textSecondary text-center py-2">Loading stats...</p>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bgSurface border border-borderColor rounded-xl p-3 shadow-sm text-left">
                <p className="text-[10px] text-textSecondary font-bold uppercase">Total Users</p>
                <p className="font-black text-base text-[#132040]">{stats.totalUsers}</p>
              </div>
              <div className="bg-bgSurface border border-borderColor rounded-xl p-3 shadow-sm text-left">
                <p className="text-[10px] text-textSecondary font-bold uppercase">Success Deposits</p>
                <p className="font-black text-base text-green-600">₹{stats.totalDeposits}</p>
                {stats.totalPendingDeposits > 0 && (
                  <p className="text-[9px] text-yellow-600 font-bold">Pending: ₹{stats.totalPendingDeposits}</p>
                )}
              </div>
              <div className="bg-bgSurface border border-borderColor rounded-xl p-3 shadow-sm text-left">
                <p className="text-[10px] text-textSecondary font-bold uppercase">Success Withdraws</p>
                <p className="font-black text-base text-blue-600">₹{stats.totalWithdrawals}</p>
              </div>
              <div className="bg-bgSurface border border-borderColor rounded-xl p-3 shadow-sm text-left">
                <p className="text-[10px] text-textSecondary font-bold uppercase">Pending Withdraws</p>
                <p className="font-black text-base text-orange-600">₹{stats.totalPendingWithdrawals}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-red-500 text-center py-2">Failed to load statistics</p>
          )}
        </div>
      )}

      {msg && (
        <div className="bg-blue-50 text-blue-700 text-xs font-semibold p-2.5 rounded-lg text-center">
          {msg}
        </div>
      )}

      {/* Pending Withdrawals (Admin Only) */}
      {(user.role === 'admin' || user.role === 'finance_admin') && (
        <div className="border-t pt-4 border-borderColor">
          <p className="text-xs text-textSecondary font-bold mb-3">Pending Withdrawals ({pendingWithdrawals.length})</p>
          {pendingWithdrawals.length === 0 ? (
            <p className="text-xs text-textSecondary text-center py-2 bg-bgPrimary rounded-lg">No pending withdrawals.</p>
          ) : (
            <div className="space-y-3">
              {pendingWithdrawals.map((wit) => (
                <div key={wit._id} className="border border-orange-200 bg-orange-50/30 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-textPrimary">{wit.user?.username || 'Player'}</span>
                    <span className="text-textSecondary">{wit.user?.phone}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="text-gray-600 font-semibold">Amount: ₹{wit.amount}</p>
                      <p className="text-[10px] text-textSecondary font-mono">UPI: {wit.upiId}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleResolveWithdrawal(wit._id, 'reject')}
                        className="px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg text-[10px]">
                        Reject
                      </button>
                      <button onClick={() => handleResolveWithdrawal(wit._id, 'approve')}
                        className="px-3 py-1.5 bg-green-500 text-textPrimary font-bold rounded-lg text-[10px]">
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Daily Schedule Builder (Admin Only) */}
      {user.role === 'admin' && (
        <div className="border-t pt-4 border-borderColor space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-textSecondary font-bold">📅 Daily Schedule Builder</p>
            <button onClick={startAddSchedule}
              className="bg-bgSurface text-[#f5c518] font-bold px-2.5 py-1 rounded text-[10px] hover:opacity-90 active:scale-95 transition">
              + Add Slot
            </button>
          </div>

          {loadingSchedules ? (
            <p className="text-xs text-textSecondary text-center py-2">Loading schedule slots...</p>
          ) : schedules.length === 0 ? (
            <p className="text-xs text-textSecondary text-center py-2 bg-bgPrimary rounded-lg">No active schedules. Create one to auto-publish matches daily!</p>
          ) : (
            <div className="space-y-2">
              {schedules.map((sched) => (
                <div key={sched._id} className="border border-borderColor rounded-xl p-3 bg-bgSurface flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-textPrimary">{sched.time}</span>
                      <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-1.5 py-0.5 rounded">
                        {sched.category}
                      </span>
                    </div>
                    <p className="text-textSecondary font-medium text-[10px]">{sched.title}</p>
                    <p className="text-textSecondary text-[9px]">Fee: 🪙 {sched.entryFee} | Prize: 🪙 {sched.prizePool} | Slots: {sched.totalSlots}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleSchedule(sched)}
                      className={`px-2 py-1 rounded text-[10px] font-bold ${
                        sched.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {sched.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <button onClick={() => startEditSchedule(sched)}
                      className="px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded text-[10px]">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteSchedule(sched._id)}
                      className="px-2 py-1 bg-red-100 text-red-700 font-bold rounded text-[10px]">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
        <p className="text-xs text-textSecondary font-bold mb-2">Hosted Matches ({hostedMatches.filter(m => (Date.now() - new Date(m.dateCreated || m.date).getTime()) <= 24 * 60 * 60 * 1000).length})</p>
        
        {loadingMatches ? (
          <div className="text-center py-4 text-xs text-textSecondary">Loading hosted matches...</div>
        ) : hostedMatches.length === 0 ? (
          <div className="text-center py-4 text-xs text-textSecondary">No matches hosted yet.</div>
        ) : (
          <div className="space-y-3">
            {hostedMatches.filter(m => (Date.now() - new Date(m.dateCreated || m.date).getTime()) <= 24 * 60 * 60 * 1000).map((match) => (
              <div key={match._id} className="border border-borderColor rounded-xl p-3 bg-bgSurface space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-bgSurface/10 text-[#132040] font-bold px-2 py-0.5 rounded-full">
                      {match.category}
                    </span>
                    <h4 className="font-bold text-xs text-textPrimary mt-1">{match.title}</h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-textSecondary font-mono">ID: {match.matchId}</span>
                      <span className="text-[10px] text-gray-300">|</span>
                      <button onClick={() => setViewingPlayersMatch(match)}
                        className="text-[10px] text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded transition">
                        Slots: {match.joinedPlayers?.length || 0}/{match.totalSlots} (View List)
                      </button>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase ${
                    match.status === 'completed' ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    {match.status}
                  </span>
                </div>

                {match.status !== 'completed' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => {
                      setEditingRoomId(match._id);
                      setRoomIdInput(match.roomId || '');
                      setRoomPassInput(match.roomPass || '');
                    }}
                      className="flex-1 py-1.5 bg-gray-100 text-gray-700 font-semibold rounded-lg text-[10px] hover:bg-gray-200">
                      Set Room ID/Pass
                    </button>
                    {user.role !== 'finance_admin' && (
                      <>
                        <button onClick={() => {
                          setEditingNoticeId(match._id);
                          setMatchNoticeInput(match.notice || '');
                        }}
                          className="flex-1 py-1.5 bg-yellow-100 text-yellow-800 font-semibold rounded-lg text-[10px] hover:bg-yellow-200">
                          📢 Notice
                        </button>
                        <button onClick={() => startResolve(match)}
                          className="flex-1 py-1.5 bg-bgSurface text-[#f5c518] font-bold rounded-lg text-[10px] hover:opacity-90">
                          Resolve Match
                        </button>
                      </>
                    )}
                  </div>
                )}

                {match.status === 'completed' && user.role !== 'finance_admin' && (
                  <div className="flex pt-1">
                    <button onClick={() => handleDeleteMatch(match._id)}
                      className="w-full py-1.5 bg-red-100 text-red-700 font-bold rounded-lg text-[10px] hover:bg-red-200">
                      Delete Match History
                    </button>
                  </div>
                )}

                {editingRoomId === match._id && (
                  <div className="bg-bgSurface border border-borderColor rounded-lg p-3 space-y-2 mt-2">
                    <p className="text-[10px] font-bold text-gray-600">Set Room Credentials</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Room ID" value={roomIdInput}
                        onChange={e => setRoomIdInput(e.target.value)}
                        className="border border-borderColor rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-textPrimary" />
                      <input type="text" placeholder="Password" value={roomPassInput}
                        onChange={e => setRoomPassInput(e.target.value)}
                        className="border border-borderColor rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-textPrimary" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingRoomId(null)}
                        className="flex-1 py-1 border border-red-200 text-red-500 rounded text-[10px]">
                        Cancel
                      </button>
                      <button onClick={() => handleSaveRoom(match._id)}
                        className="flex-1 py-1 bg-green-500 text-textPrimary font-bold rounded text-[10px]">
                        Save
                      </button>
                    </div>
                  </div>
                )}

                {editingNoticeId === match._id && (
                  <div className="bg-bgSurface border border-borderColor rounded-lg p-3 space-y-2 mt-2">
                    <p className="text-[10px] font-bold text-gray-600">📢 Edit Announcement Notice</p>
                    <input type="text" placeholder="Notice text (e.g. Delayed by 15 mins)" value={matchNoticeInput}
                      onChange={e => setMatchNoticeInput(e.target.value)}
                      className="w-full border border-borderColor rounded-lg px-2.5 py-1.5 text-xs focus:outline-none text-textPrimary" />
                    <div className="flex gap-2">
                      <button onClick={() => setEditingNoticeId(null)}
                        className="flex-1 py-1 border border-red-200 text-red-500 rounded text-[10px]">
                        Cancel
                      </button>
                      <button onClick={() => handleSaveNotice(match._id)}
                        className="flex-1 py-1 bg-green-500 text-textPrimary font-bold rounded text-[10px]">
                        Save Notice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Manual Deposits (Admin Only) */}
      {(user.role === 'admin' || user.role === 'finance_admin') && (
        <div className="border-t pt-4 border-borderColor">
          <p className="text-xs text-textSecondary font-bold mb-3">Pending Deposits ({pendingDeposits.length})</p>
          {pendingDeposits.length === 0 ? (
            <p className="text-xs text-textSecondary text-center py-2 bg-bgPrimary rounded-lg">No pending deposits.</p>
          ) : (
            <div className="space-y-3">
              {pendingDeposits.map((dep) => (
                <div key={dep._id} className="border border-yellow-200 bg-yellow-50/30 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-textPrimary">{dep.user?.username || 'Player'}</span>
                    <span className="text-textSecondary">{dep.user?.phone}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="text-gray-600 font-semibold">Amount: ₹{dep.amount}</p>
                      <p className="text-[10px] text-textSecondary font-mono">UTR: {dep.utr}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleResolveDeposit(dep._id, 'reject')}
                        className="px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg text-[10px]">
                        Reject
                      </button>
                      <button onClick={() => handleResolveDeposit(dep._id, 'approve')}
                        className="px-3 py-1.5 bg-green-500 text-textPrimary font-bold rounded-lg text-[10px]">
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* Schedule Form Modal */}
          {showScheduleForm && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-bgSurface rounded-2xl p-5 w-full max-w-sm max-h-[85vh] overflow-y-auto space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-sm text-[#132040]">
                    {editingSchedule ? 'Edit Schedule Slot' : 'Add Daily Schedule Slot'}
                  </h3>
                  <button onClick={() => setShowScheduleForm(false)} className="text-textSecondary font-bold">✕</button>
                </div>

                <form onSubmit={handleSaveSchedule} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Time Slot (e.g. 06:00 AM, 10:30 PM)</label>
                    <input type="text" value={schedTime} onChange={e => setSchedTime(e.target.value)}
                      className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                  </div>

                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Category</label>
                    <select value={schedCategory} onChange={e => setSchedCategory(e.target.value)}
                      className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]">
                      {GAME_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Match Title</label>
                    <input type="text" value={schedTitle} onChange={e => setSchedTitle(e.target.value)}
                      className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-textSecondary font-bold block mb-1">Entry Fee (🪙)</label>
                      <input type="number" value={schedEntryFee} onChange={e => setSchedEntryFee(e.target.value)}
                        className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                    </div>
                    <div>
                      <label className="text-[10px] text-textSecondary font-bold block mb-1">Prize Pool (🪙)</label>
                      <input type="number" value={schedPrizePool} onChange={e => setSchedPrizePool(e.target.value)}
                        className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-textSecondary font-bold block mb-1">Per Kill (🪙)</label>
                      <input type="number" value={schedPerKill} onChange={e => setSchedPerKill(e.target.value)}
                        className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-textSecondary font-bold block mb-1">Total Slots</label>
                      <input type="number" value={schedTotalSlots} onChange={e => setSchedTotalSlots(e.target.value)}
                        className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]" required />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Rules (one per line)</label>
                    <textarea rows={3} value={schedRules} onChange={e => setSchedRules(e.target.value)}
                      className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518] resize-none" placeholder="No emulator allowed..." />
                  </div>

                  <div>
                    <label className="text-[10px] text-textSecondary font-bold block mb-1">Announcement Notice (Optional)</label>
                    <input type="text" value={schedNotice} onChange={e => setSchedNotice(e.target.value)}
                      placeholder="e.g. Delayed by 10 mins or Map changes"
                      className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]" />
                  </div>

                  <button type="submit"
                    className="w-full bg-bgSurface text-[#f5c518] font-bold py-3 rounded-xl text-xs tracking-wider">
                    {editingSchedule ? 'UPDATE SCHEDULE' : 'SAVE SCHEDULE'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Host Management (Admin Only) */}
      {(user.role === 'admin' || user.role === 'finance_admin') && (
        <div className="border-t pt-4 border-borderColor space-y-3">
          <p className="text-xs text-textSecondary font-bold">👥 Host Management</p>
          
          <div className="flex gap-2">
            <input type="text" placeholder="Search user by Phone or Username" value={usersSearch}
              onChange={e => setUsersSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchUsers()}
              className="flex-1 border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518]" />
            <button onClick={handleSearchUsers} disabled={searchingUsers}
              className="bg-bgSurface text-[#f5c518] font-bold px-3 py-2 rounded-xl text-xs hover:opacity-90 active:scale-95 transition">
              {searchingUsers ? 'Searching...' : 'Search'}
            </button>
          </div>

          {searchedUsers.length > 0 && (
            <div className="border border-borderColor rounded-xl p-3 bg-bgSurface space-y-2 max-h-[40vh] overflow-y-auto">
              {searchedUsers.map(u => (
                <div key={u._id} className="flex justify-between items-center text-xs py-1.5 border-b border-borderColor last:border-b-0">
                  <div>
                    <p className="font-bold text-textPrimary">{u.username}</p>
                    <p className="text-[10px] text-textSecondary font-mono">Phone: {u.phone} | Role: <span className="font-bold text-[#132040]">{u.role}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleToggleHostRole(u)} disabled={updatingRole === u._id}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                        u.role === 'host' 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-green-500 text-textPrimary hover:bg-green-600'
                      }`}>
                      {updatingRole === u._id ? 'Updating...' : u.role === 'host' ? 'Remove Host' : 'Make Host'}
                    </button>
                    {(user.role === 'admin' || user.role === 'finance_admin') && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <button onClick={() => handleChangeUserPassword(u)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 bg-blue-100 text-blue-700 hover:bg-blue-200">
                          Change Pass
                        </button>
                        <button onClick={() => handleBanUser(u)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition active:scale-95 ${
                          u.isBanned 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-black text-textPrimary hover:bg-bgSurface'
                        }`}>
                        {u.isBanned ? 'Unban' : 'Ban'}
                      </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Announcements (Admin & Finance Admin) */}
      {(user.role === 'admin' || user.role === 'finance_admin') && (
        <div className="border-t pt-4 border-borderColor space-y-3">
          <p className="text-xs text-textSecondary font-bold">📢 App Announcements</p>
          <textarea
            value={announcementMsg}
            onChange={e => setAnnouncementMsg(e.target.value)}
            rows={2}
            placeholder="Write announcement message..."
            className="w-full border border-borderColor rounded-xl px-3 py-2 text-xs text-textPrimary focus:outline-none focus:border-[#f5c518] resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handleAnnounceInApp}
              className="flex-1 bg-bgSurface text-[#f5c518] font-bold py-2 rounded-xl text-xs hover:opacity-90 active:scale-95 transition">
              Announce In-App
            </button>
            <button onClick={handleAnnouncePush}
              className="flex-1 bg-red-600 text-textPrimary font-bold py-2 rounded-xl text-xs hover:bg-red-700 active:scale-95 transition">
              Push Notification
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Category Banners (First Admin Only) */}
      {user.phone === '7017022966' && (
        <div className="border-t pt-4 border-borderColor space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-textSecondary font-bold">🎨 Dynamic Category Banners</p>
            <button onClick={handleSaveBanners} disabled={savingBanners}
              className="bg-bgSurface text-[#f5c518] font-bold px-3 py-1.5 rounded-xl text-[10px] hover:opacity-90 active:scale-95 transition">
              {savingBanners ? 'Saving...' : 'Save Banners'}
            </button>
          </div>
          <p className="text-[10px] text-textSecondary leading-tight">Paste an image URL for any category. Leave blank to use default. This changes the image everywhere.</p>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {GAME_CATEGORIES.map(cat => (
              <div key={cat.id} className="flex flex-col gap-1 border border-borderColor p-2 rounded-xl bg-bgSurface">
                <label className="text-[10px] font-bold text-gray-700">{cat.label}</label>
                <div className="flex items-center gap-2">
                    <input type="file" accept="image/*"
                      onChange={(e) => handleFileUpload(e, (url) => setDraftBanners({ ...draftBanners, [cat.id]: url }))}
                      className="w-full border border-borderColor rounded-lg px-2 py-1.5 text-xs bg-bgSurface" />
                    {draftBanners[cat.id] && <img src={draftBanners[cat.id]} alt="banner" className="w-10 h-10 object-cover rounded" />}
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolvingMatch && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-bgSurface rounded-2xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#132040]">Resolve: {resolvingMatch.title}</h3>
                <p className="text-[10px] text-textSecondary">{resolvingMatch.matchId}</p>
              </div>
              <button onClick={() => setResolvingMatch(null)} className="text-textSecondary font-bold">✕</button>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-600">Enter Standings for Joined Players</p>
              
              {playerStandings.length === 0 ? (
                <p className="text-xs text-textSecondary text-center py-4">No players joined this match.</p>
              ) : (
                <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                  {playerStandings.map((p, idx) => (
                    <div key={idx} className="border border-borderColor rounded-xl p-3 bg-bgSurface space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-textPrimary">{p.name || 'Anonymous'}</span>
                        <span className="text-[10px] text-textSecondary">UID: {p.uid}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-textSecondary font-medium block mb-0.5">Kills</label>
                          <input type="number" min="0" value={p.kills}
                            onChange={e => handleUpdateStanding(idx, 'kills', e.target.value)}
                            className="w-full border border-borderColor rounded-lg px-2 py-1 text-xs text-textPrimary" />
                        </div>
                        <div>
                          <label className="text-[9px] text-textSecondary font-medium block mb-0.5">Rank (1 for winner)</label>
                          <input type="number" min="1" value={p.rank}
                            onChange={e => handleUpdateStanding(idx, 'rank', e.target.value)}
                            className="w-full border border-borderColor rounded-lg px-2 py-1 text-xs text-textPrimary" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setResolvingMatch(null)}
                className="flex-1 py-3 border border-red-200 text-red-500 font-bold rounded-xl text-xs">
                Cancel
              </button>
              <button onClick={handleResolveSubmit} disabled={resolvingSubmitLoading}
                className="flex-1 py-3 bg-green-500 text-textPrimary font-bold rounded-xl text-xs hover:bg-green-600 active:scale-95 transition">
                {resolvingSubmitLoading ? 'Resolving Standings...' : 'Disburse Prize & Finish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingPlayersMatch && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-bgSurface rounded-2xl p-5 w-full max-w-sm max-h-[80vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#132040]">Joined Players</h3>
                <p className="text-[10px] text-textSecondary">{viewingPlayersMatch.title} – {viewingPlayersMatch.matchId}</p>
              </div>
              <button onClick={() => setViewingPlayersMatch(null)} className="text-textSecondary font-bold">✕</button>
            </div>

            <div className="space-y-2">
              {!viewingPlayersMatch.joinedPlayers || viewingPlayersMatch.joinedPlayers.length === 0 ? (
                <p className="text-xs text-textSecondary text-center py-6">No players have joined this match yet.</p>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto pr-1">
                  {viewingPlayersMatch.joinedPlayers.map((p: any, idx: number) => (
                    <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-textPrimary">{p.name || p.user?.username || 'Player'}</p>
                        <p className="text-[10px] text-textSecondary font-mono">UID: {p.uid || p.user?.ffUid || '--'}</p>
                      </div>
                      <div className="text-right text-[10px] text-textSecondary">
                        <p>Team: {p.teamNo || idx + 1}</p>
                        <p>Pos: {p.position || 'A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button onClick={() => setViewingPlayersMatch(null)}
              className="w-full py-3 bg-bgSurface text-textPrimary font-bold rounded-xl text-xs">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
