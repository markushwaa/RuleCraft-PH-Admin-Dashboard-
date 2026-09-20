import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaPalette, FaServer, FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../supabase/config";
import { validateStrongPassword } from "../utils/security";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("");
  };

  const handleChangePassword = async () => {
    setMessage("");
    if (newPassword !== confirmPassword) return setMessage("New passwords do not match.");
    const passwordError = validateStrongPassword(newPassword);
    if (passwordError) return setMessage(passwordError);
    if (newPassword === currentPassword) return setMessage("Choose a password different from the current password.");

    try {
      setLoading(true);
      const { error: reauthenticationError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (reauthenticationError) throw reauthenticationError;
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setMessage("Password updated successfully.");
      window.setTimeout(closePasswordModal, 1200);
    } catch (error) {
      setMessage(error.message || "Unable to update the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div><h1 className="text-3xl font-bold text-slate-800">Settings</h1><p className="mt-2 text-slate-500">Manage the active administrator account and workspace preferences.</p></div>

      <Section icon={FaUser} color="bg-blue-600" title="Administrator Profile" subtitle="Profile data is loaded from public.profiles.">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ReadOnlyField label="Name" value={user?.displayName || "Administrator"} />
          <ReadOnlyField label="Email" value={user?.email || "No email available"} />
          <ReadOnlyField label="Role" value={user?.profile?.role || "admin"} />
          <ReadOnlyField label="Status" value={user?.profile?.status || "unknown"} />
        </div>
      </Section>

      <Section icon={FaLock} color="bg-red-600" title="Security" subtitle="Update the password for this administrator account.">
        <button onClick={() => setShowPasswordModal(true)} className="rounded-xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-700">Change Password</button>
      </Section>

      <Section icon={FaPalette} color="bg-purple-600" title="Appearance" subtitle="Choose the administrator workspace appearance.">
        <div className="grid max-w-lg grid-cols-2 gap-3">
          {[["light", "Light", "Bright workspace"], ["dark", "Dark", "Reduced-light workspace"]].map(([value, label, detail]) => (
            <button key={value} onClick={() => setTheme(value)} className={`rounded-xl border px-5 py-4 text-left transition ${theme === value ? "border-blue-600 bg-blue-50 text-blue-700" : "hover:bg-slate-50"}`}><b>{label}</b><span className="mt-1 block text-xs opacity-70">{detail}</span></button>
          ))}
        </div>
      </Section>

      <Section icon={FaServer} color="bg-green-600" title="Backend Connection" subtitle="The dashboard is connected to the RuleCraft PH mobile application.">
        <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4 text-green-800"><span className="h-3 w-3 rounded-full bg-green-500" /><b>Backend connection configured</b></div>
      </Section>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
            <h2 className="text-xl font-bold">Change Password</h2>
            <div className="mt-5 space-y-4">
              <PasswordField label="Current Password" value={currentPassword} setValue={setCurrentPassword} visible={visible.current} toggle={() => setVisible((state) => ({ ...state, current: !state.current }))} />
              <PasswordField label="New Password" value={newPassword} setValue={setNewPassword} visible={visible.next} toggle={() => setVisible((state) => ({ ...state, next: !state.next }))} />
              <PasswordField label="Confirm New Password" value={confirmPassword} setValue={setConfirmPassword} visible={visible.confirm} toggle={() => setVisible((state) => ({ ...state, confirm: !state.confirm }))} />
              {message && <p className={`text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{message}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3"><button onClick={closePasswordModal} className="rounded-xl border px-5 py-2">Cancel</button><button onClick={handleChangePassword} disabled={loading} className="rounded-xl bg-blue-600 px-5 py-2 text-white disabled:bg-blue-400">{loading ? "Updating..." : "Update Password"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, color, title, subtitle, children }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-6 flex items-center gap-3"><div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${color}`}><Icon /></div><div><h2 className="text-lg font-bold text-slate-800">{title}</h2><p className="text-sm text-slate-500">{subtitle}</p></div></div>{children}</section>;
}

function ReadOnlyField({ label, value }) {
  return <label><span className="text-sm font-semibold text-slate-700">{label}</span><input value={value} readOnly className="mt-2 w-full rounded-xl border bg-slate-50 px-4 py-3 capitalize" /></label>;
}

function PasswordField({ label, value, setValue, visible, toggle }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span><div className="relative"><input type={visible ? "text" : "password"} value={value} onChange={(event) => setValue(event.target.value)} className="w-full rounded-xl border px-4 py-3 pr-12" /><button type="button" onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{visible ? <FaEyeSlash /> : <FaEye />}</button></div></label>;
}
