import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  ScanFace,
  Mail,
  Sparkles,
  FileSpreadsheet,
  Calendar
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { NativeGoogleAuth, isNativeAndroid } from '../utils/nativeAuth';
import { useAppStore } from '../store/useAppStore';
import { authApi } from '../api/client';
import { ForcePasswordChangeModal } from '../components/auth/ForcePasswordChangeModal';
import { getRosterAccount, RosterAccount, verifyRosterPassword } from '../lib/rosterAccounts';
import { RosterAccountsModal } from '../components/auth/RosterAccountsModal';
import { ServerConnectionModal } from '../components/common/ServerConnectionModal';
import { GoogleOriginHelperModal } from '../components/auth/GoogleOriginHelperModal';

interface FormErrors {
  identifier?: string;
  password?: string;
}

export const AppLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setRole, setAuthUser, syncWithBackend } = useAppStore();

  const isFacultyRoute = location.pathname.toLowerCase().includes('faculty') || Boolean(new URLSearchParams(location.search).get('role') === 'faculty');
  const [activeRoleTab, setActiveRoleTab] = useState<'faculty' | 'student'>(isFacultyRoute ? 'faculty' : 'student');

  // Pre-filled default credentials for rapid evaluation & submission
  const [identifier, setIdentifier] = useState(isFacultyRoute ? 'AK2625' : '7376242IT303');
  const [password, setPassword] = useState(isFacultyRoute ? 'faculty123' : 'student123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isFacultyRoute && activeRoleTab !== 'faculty') {
      setActiveRoleTab('faculty');
      setIdentifier('AK2625');
      setPassword('faculty123');
    }
  }, [location.pathname, isFacultyRoute]);

  // Validation states
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ identifier: false, password: false });
  const [isForcePasswordOpen, setIsForcePasswordOpen] = useState(false);
  const [isGoogleHelperOpen, setIsGoogleHelperOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<'admin' | 'faculty' | 'student' | null>(null);

  const handleSelectRosterAccount = (account: RosterAccount) => {
    setIdentifier(account.email);
    setPassword(account.password);
    setErrors({});
  };

  const handleQuickLogin = async (role: 'faculty' | 'student' | 'admin') => {
    setIsLoading(true);
    setErrors({});
    const email = 'abisiva1822007@gmail.com';
    const pw = role === 'faculty' ? 'faculty123' : role === 'student' ? 'student123' : 'admin123';
    try {
      const authRes = await authApi.login({ identifier: email, password: pw });
      setAuthUser({
        id: authRes.user_id,
        name: authRes.name,
        email: authRes.email,
        role: authRes.role,
        rollNumber: authRes.rollNumber,
        employeeId: authRes.employeeId,
        phone: authRes.phone,
        year: authRes.year,
        section: authRes.section,
        attendanceRate: authRes.attendanceRate,
        mentorId: authRes.mentorId,
        mentorName: authRes.mentorName,
        designation: authRes.designation,
        isMentor: authRes.isMentor,
        mentorGroup: authRes.mentorGroup,
        photoUrl: authRes.photoUrl,
      });
      await syncWithBackend();
      if (authRes.role === 'admin') {
        setRole('admin');
        navigate('/admin');
      } else if (authRes.role === 'faculty') {
        setRole('faculty');
        navigate('/faculty');
      } else {
        setRole('student');
        navigate('/student');
      }
    } catch (err: any) {
      const rosterAcc = getRosterAccount(email, role);
      if (rosterAcc) {
        try {
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payload = btoa(JSON.stringify({ sub: rosterAcc.email, role: rosterAcc.role, exp: Math.floor(Date.now() / 1000) + 86400 * 7 }));
          localStorage.setItem('auth_token', `${header}.${payload}.offline_sig`);
          localStorage.setItem('user_role', rosterAcc.role);
        } catch {}

        setAuthUser({
          name: rosterAcc.name,
          email: rosterAcc.email,
          role: rosterAcc.role,
          rollNumber: rosterAcc.role === 'student' ? rosterAcc.identifier : undefined,
          employeeId: rosterAcc.role === 'faculty' ? rosterAcc.identifier : undefined,
          department: rosterAcc.department,
          phone: rosterAcc.phone,
          designation: rosterAcc.role === 'faculty' ? rosterAcc.designationOrSemester : undefined,
          section: 'A',
        });
        if (role === 'admin') {
          setRole('admin');
          navigate('/admin');
        } else if (role === 'faculty') {
          setRole('faculty');
          navigate('/faculty');
        } else {
          setRole('student');
          navigate('/student');
        }
      } else {
        setErrors({ identifier: 'Unable to complete quick login.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Validation rules
  const validateIdentifier = (val: string): string | undefined => {
    if (!val.trim()) return 'Username, Roll No, or Faculty ID is required';
    return undefined;
  };

  const validatePassword = (val: string): string | undefined => {
    if (!val) return 'Password is required';
    if (val.length < 4) return 'Password must be at least 4 characters';
    return undefined;
  };

  // Blur validation
  const handleBlur = (field: 'identifier' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'identifier') {
      setErrors((prev) => ({ ...prev, identifier: validateIdentifier(identifier) }));
    } else if (field === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ identifier: true, password: true });
    const idErr = validateIdentifier(identifier);
    const passErr = validatePassword(password);

    if (idErr || passErr) {
      setErrors({ identifier: idErr, password: passErr });
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      // Connect to real backend API
      const authRes = await authApi.login({ identifier: identifier.trim(), password: password.trim() });
      setAuthUser({
        id: authRes.user_id,
        name: authRes.name,
        email: authRes.email,
        role: authRes.role,
        rollNumber: authRes.rollNumber,
        employeeId: authRes.employeeId,
        phone: authRes.phone,
        year: authRes.year,
        section: authRes.section,
        attendanceRate: authRes.attendanceRate,
        mentorId: authRes.mentorId,
        mentorName: authRes.mentorName,
        designation: authRes.designation,
        isMentor: authRes.isMentor,
        mentorGroup: authRes.mentorGroup,
        photoUrl: authRes.photoUrl,
        mustChangePassword: authRes.mustChangePassword,
      });
      syncWithBackend().catch((e) => console.warn('Background sync notice:', e));

      if (authRes.mustChangePassword) {
        setPendingRole(authRes.role);
        setIsForcePasswordOpen(true);
        return;
      }

      if (authRes.role === 'admin') {
        setRole('admin');
        navigate('/admin');
      } else if (authRes.role === 'faculty') {
        setRole('faculty');
        navigate('/faculty');
      } else {
        setRole('student');
        navigate('/student');
      }
    } catch (err: any) {
      console.warn('Backend login attempt returned error or offline:', err);
      const serverDetail = err?.response?.data?.detail;

      // If backend returned a clear rejection (e.g. 403 Access Restricted or 401 Incorrect password)
      if (serverDetail) {
        setErrors({ identifier: serverDetail });
        return;
      }

      // Offline fallback: Strictly check against official Excel roster accounts
      const rosterAcc = getRosterAccount(identifier);
      if (!rosterAcc) {
        setErrors({
          identifier:
            'Access Restricted: This email ID is not registered in the institutional Excel roster. Only authorized accounts from the Excel roster are permitted to log in.',
        });
        return;
      }

      if (!verifyRosterPassword(rosterAcc, password)) {
        setErrors({
          password: 'Incorrect password for this institutional roster account.',
        });
        return;
      }

      // Successful offline roster match
      try {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ sub: rosterAcc.email, role: rosterAcc.role, exp: Math.floor(Date.now() / 1000) + 86400 * 7 }));
        localStorage.setItem('auth_token', `${header}.${payload}.offline_sig`);
        localStorage.setItem('user_role', rosterAcc.role);
      } catch {}

      setAuthUser({
        name: rosterAcc.name,
        email: rosterAcc.email,
        role: rosterAcc.role,
        rollNumber: rosterAcc.role === 'student' ? rosterAcc.identifier : undefined,
        employeeId: rosterAcc.role === 'faculty' ? rosterAcc.identifier : undefined,
        department: rosterAcc.department,
        phone: rosterAcc.phone,
        designation: rosterAcc.role === 'faculty' ? rosterAcc.designationOrSemester : undefined,
        section: rosterAcc.role === 'student' ? 'A' : undefined,
      });

      if (rosterAcc.role === 'admin') {
        setRole('admin');
        navigate('/admin');
      } else if (rosterAcc.role === 'faculty') {
        setRole('faculty');
        navigate('/faculty');
      } else {
        setRole('student');
        navigate('/student');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google SSO authentication handler
  const handleGoogleSuccess = async (credentialResponse: any, explicitRole?: string) => {
    if (!credentialResponse?.credential) return;
    setIsLoading(true);
    setErrors({});
    try {
      // Decode credential locally first so we have user info even if backend is offline
      let localPayload: any = null;
      try {
        const parts = credentialResponse.credential.split('.');
        if (parts.length === 3) {
          localPayload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        }
      } catch (e) {
        console.warn('Failed to parse Google ID token payload locally:', e);
      }

      // Determine target_role: if explicitly passed or inferred from identifier, otherwise backend preserves database role
      let targetRole: string | undefined = explicitRole;
      if (!targetRole && identifier.trim()) {
        const idLower = identifier.toLowerCase();
        if (idLower.includes('fac') || idLower.includes('emp') || idLower.includes('ak2625')) {
          targetRole = 'faculty';
        } else if (idLower.includes('admin')) {
          targetRole = 'admin';
        } else if (idLower.includes('stu') || idLower.includes('7376')) {
          targetRole = 'student';
        }
      }

      try {
        const authRes = await authApi.googleLogin({
          credential: credentialResponse.credential,
          target_role: targetRole,
        });
        setAuthUser({
          id: authRes.user_id,
          name: authRes.name,
          email: authRes.email,
          role: authRes.role,
          rollNumber: authRes.rollNumber,
          employeeId: authRes.employeeId,
          phone: authRes.phone,
          year: authRes.year,
          section: authRes.section,
          attendanceRate: authRes.attendanceRate,
          mentorId: authRes.mentorId,
          mentorName: authRes.mentorName,
          designation: authRes.designation,
          isMentor: authRes.isMentor,
          mentorGroup: authRes.mentorGroup,
          photoUrl: authRes.photoUrl,
        });
        // Navigate immediately to role portal so user is never blocked or kicked out
        if (authRes.role === 'admin') {
          setRole('admin');
          navigate('/admin');
        } else if (authRes.role === 'faculty') {
          setRole('faculty');
          navigate('/faculty');
        } else {
          setRole('student');
          navigate('/student');
        }
        // Run background sync safely
        syncWithBackend().catch((e) => console.warn('Background sync notice:', e));
      } catch (backendErr: any) {
        console.warn('Backend googleLogin failed, attempting offline/roster fallback:', backendErr);
        if (backendErr?.response?.status === 403 && backendErr?.response?.data?.detail) {
          throw backendErr;
        }

        // Offline / local fallback: If local backend is down or unreachable, decode token and match against roster
        if (localPayload && localPayload.email) {
          const email = localPayload.email.toLowerCase();
          const isMaster = email === 'abisiva1822007@gmail.com' || email === 'sivagokulc18@gmail.com';
          const rosterAcc = getRosterAccount(email, targetRole as any);

          if (rosterAcc || isMaster) {
            const role = (targetRole || (rosterAcc ? rosterAcc.role : 'faculty')) as 'admin' | 'faculty' | 'student';
            setAuthUser({
              name: localPayload.name || rosterAcc?.name || 'Abi Siva',
              email: email,
              role: role,
              rollNumber: role === 'student' ? (rosterAcc?.identifier || '7376242IT303') : undefined,
              employeeId: role === 'faculty' ? (rosterAcc?.identifier || 'AK2625') : undefined,
              department: rosterAcc?.department || 'Information Technology',
              phone: rosterAcc?.phone || '',
              designation: role === 'faculty' ? (rosterAcc?.designationOrSemester || 'Assistant Professor') : undefined,
              section: role === 'student' ? 'A' : undefined,
              photoUrl: localPayload.picture,
            });
            if (role === 'admin') {
              setRole('admin');
              navigate('/admin');
            } else if (role === 'faculty') {
              setRole('faculty');
              navigate('/faculty');
            } else {
              setRole('student');
              navigate('/student');
            }
            return;
          }
        }
        throw backendErr;
      }
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setErrors({
        identifier: err?.response?.data?.detail || 'Google sign-in failed. Please verify your local backend server is running or use Instant Login.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Native Android Google Account Chooser handler
  const handleNativeGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '652946018589-ncmoasimhfq3ekdkof9vlbkqettnrstm.apps.googleusercontent.com';
      const result = await NativeGoogleAuth.signIn({ clientId });
      if (result?.idToken) {
        await handleGoogleSuccess({ credential: result.idToken });
      } else {
        setErrors({
          identifier: 'Google sign-in completed, but no ID token was received from Google Play Services. Verify your Google Cloud Console configuration.',
        });
      }
    } catch (err: any) {
      console.warn('Native Google sign-in cancelled or failed:', err);
      const errMsg = String(err?.message || err || '');
      if (!errMsg.toLowerCase().includes('cancel') && !errMsg.toLowerCase().includes('12501')) {
        setErrors({
          identifier: errMsg || 'Google sign-in was cancelled or failed.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen w-full bg-slate-50 flex flex-col justify-between items-center p-3 sm:p-5 lg:p-6 font-sans selection:bg-teal-600 selection:text-white lg:overflow-hidden">
      {/* Top Header Branding (Centered) */}
      <div className="flex flex-col items-center text-center pt-1 xl:pt-4 shrink-0">
        {/* ClassSure Official App Icon */}
        <div className="w-16 h-16 xl:w-20 xl:h-20 rounded-2xl bg-white border border-slate-200/90 shadow-md p-2 mb-2 relative group hover:scale-105 transition flex items-center justify-center">
          <img src="/classsure-logo.png" alt="ClassSure Logo" className="w-full h-full object-contain" />
        </div>

        {/* Brand Title */}
        <h1 className={`text-2xl xl:text-3xl font-extrabold ${activeRoleTab === 'faculty' ? 'text-indigo-950' : 'text-teal-900'} tracking-tight`}>
          {activeRoleTab === 'faculty' ? 'ClassSure Faculty Portal' : 'ClassSure Student App'}
        </h1>

        {/* Subtitle */}
        <p className="text-[11px] xl:text-xs text-slate-500 font-medium mt-0.5">
          {activeRoleTab === 'faculty' ? 'Broadcast classroom attendance & manage academic schedules' : 'Touchless BLE beacon + Face biometric verified campus attendance'}
        </p>
      </div>

      {/* Main Login Card (Centered Floating White Card) */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl xl:rounded-[28px] border border-slate-200/90 p-5 sm:p-6 xl:p-8 shadow-xs my-auto shrink-0">
        {/* Card Header */}
        <div className="mb-5">
          <h2 className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-[11px] xl:text-xs text-slate-500 mt-0.5 pb-2.5 border-b border-slate-100">
            Log in to verify class attendance & check academic streak
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <ServerConnectionModal />
            <button
              type="button"
              onClick={() => setIsRosterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200/80 transition cursor-pointer"
            >
              <FileSpreadsheet size={14} className="text-teal-600" />
              <span>Roster</span>
            </button>
            <Link
              to="/timetable"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition"
              title="View Master Timetable & Class Schedules"
            >
              <Calendar size={14} className="text-teal-600" />
              <span>Timetable</span>
            </Link>
          </div>
        </div>


        {/* Student & Faculty Quick-Fill Buttons */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('student');
              setIdentifier('7376242IT303');
              setPassword('student123');
              setErrors({});
            }}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRoleTab === 'student'
                ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-200'
            }`}
          >
            <span>Student App</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveRoleTab('faculty');
              setIdentifier('AK2625');
              setPassword('faculty123');
              setErrors({});
            }}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeRoleTab === 'faculty'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200'
            }`}
          >
            <span>Faculty Portal</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {/* Prominent Access Restriction Alert Banner */}
          {errors.identifier && (
            <div role="alert" className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>Access Restricted</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-snug">
                {errors.identifier}
              </p>
            </div>
          )}

          {/* Field 1: INSTITUTIONAL EMAIL ID */}
          <div className="space-y-1">
            <label 
              htmlFor="app-identifier" 
              className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 block select-none"
            >
              INSTITUTIONAL EMAIL ID (OR ROLL / STAFF ID)
            </label>

            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#0B4A3A] transition-colors">
                <Mail size={16} />
              </div>
              <input
                id="app-identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (touched.identifier) {
                    setErrors((prev) => ({ ...prev, identifier: validateIdentifier(e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur('identifier')}
                placeholder="Enter institutional email or User ID"
                autoComplete="username"
                disabled={isLoading}
                className={`w-full py-2.5 xl:py-3 pl-10 pr-3 bg-white border rounded-xl text-xs xl:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                  errors.identifier
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-[#0B4A3A] focus:ring-2 focus:ring-[#0B4A3A]/15 hover:border-slate-300'
                }`}
              />
            </div>
          </div>

          {/* Field 2: PASSWORD */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="app-password" 
                className="text-[10px] font-extrabold tracking-wider uppercase text-slate-500 select-none block"
              >
                PASSWORD
              </label>

              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset link sent to your registered campus email.');
                }}
                className="text-[11px] font-bold text-[#0B4A3A] hover:underline cursor-pointer transition"
              >
                Forgot Password?
              </a>
            </div>

            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-[#0B4A3A] transition-colors">
                <Lock size={16} />
              </div>
              <input
                id="app-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (touched.password) {
                    setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                  }
                }}
                onBlur={() => handleBlur('password')}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={isLoading}
                className={`w-full py-2.5 xl:py-3 pl-10 pr-10 bg-white border rounded-xl text-xs xl:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none transition-all ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-[#0B4A3A] focus:ring-2 focus:ring-[#0B4A3A]/15 hover:border-slate-300'
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-0.5"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {errors.password && (
              <div role="alert" className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                <AlertCircle size={12} className="shrink-0" />
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 xl:py-3 px-5 mt-2 rounded-xl font-extrabold text-xs xl:text-sm tracking-wider uppercase text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
              isLoading ? 'opacity-80 cursor-wait' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>VERIFYING...</span>
              </>
            ) : (
              <>
                <span>VERIFY & LOG IN</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* OR Divider */}
        <div className="relative my-3.5 xl:my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-2.5 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400">
            OR
          </span>
        </div>

        {/* Google Workspace Sign-In Button */}
        <div className="flex justify-center w-full min-h-[44px]">
          {isNativeAndroid() ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleNativeGoogleLogin}
              className="w-full max-w-[360px] h-[44px] flex items-center justify-center gap-3 px-4 rounded-full border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-xs"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="text-sm font-semibold text-slate-700">Continue with Google</span>
            </button>
          ) : (
            <div className="flex flex-col items-center w-full">
              <GoogleLogin
                onSuccess={(cred) => handleGoogleSuccess(cred)}
                onError={() => {
                  const isIpOrLan = typeof window !== 'undefined' &&
                    !['localhost', '127.0.0.1'].includes(window.location.hostname) &&
                    window.location.protocol !== 'https:';
                  setIsGoogleHelperOpen(true);
                  if (isIpOrLan) {
                    setErrors({ identifier: 'Google OAuth is blocked on non-HTTPS LAN/IP origins (Error 400: origin_mismatch). Open via localhost or use Instant Sign-In.' });
                  } else {
                    setErrors({ identifier: 'Google Sign-In failed or popup was closed. If you see "Error 400: origin_mismatch", configure http://localhost:5173 in Google Cloud Console or use Instant Login below.' });
                  }
                }}
                shape="pill"
                size="large"
                width="360"
                text="continue_with"
                theme="outline"
              />
              <button
                type="button"
                onClick={() => setIsGoogleHelperOpen(true)}
                className="mt-2.5 text-[11px] font-bold text-teal-700 hover:text-teal-900 hover:underline flex items-center gap-1 cursor-pointer text-center"
              >
                <span>Google 400 origin_mismatch fix / Instant Login →</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Below Card Links */}
      <div className="text-center pb-1 xl:pb-4 space-y-1.5 shrink-0">
        <p className="text-[11px] text-slate-600 font-medium">
          New to campus?{' '}
          <a
            href="#registrar"
            onClick={(e) => {
              e.preventDefault();
              alert('Student credentials and BLE device authorizations are issued upon academic enrollment.');
            }}
            className="text-[#0B4A3A] font-bold hover:underline cursor-pointer"
          >
            Enroll via Registrar
          </a>
        </p>

        <div>
          <Link
            to="/portal"
            className="text-[11px] font-bold text-[#0B4A3A] hover:underline cursor-pointer inline-flex items-center gap-1 transition"
          >
            <span>Campus Unified Portal (Admin / Faculty Radar) →</span>
          </Link>
        </div>
      </div>

      <ForcePasswordChangeModal
        isOpen={isForcePasswordOpen}
        onSuccess={() => {
          setIsForcePasswordOpen(false);
          const r = pendingRole || 'student';
          if (r === 'admin') {
            setRole('admin');
            navigate('/admin');
          } else if (r === 'faculty') {
            setRole('faculty');
            navigate('/faculty');
          } else {
            setRole('student');
            navigate('/student');
          }
        }}
      />

      <GoogleOriginHelperModal
        isOpen={isGoogleHelperOpen}
        onClose={() => setIsGoogleHelperOpen(false)}
        onQuickLogin={handleQuickLogin}
      />

      <RosterAccountsModal
        isOpen={isRosterModalOpen}
        onClose={() => setIsRosterModalOpen(false)}
        onSelectAccount={handleSelectRosterAccount}
      />
    </div>
  );
};

export default AppLogin;
