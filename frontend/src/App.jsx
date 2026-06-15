import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Send, Users, LogOut, CheckCircle, AlertCircle } from 'lucide-react';

// Dynamically sets the API URL depending on whether you're previewing locally or running live
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://she-can-backend-5rch.onrender.com/api';

function App() {
  // Navigation & View States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  
  // Public Form State
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  // Admin Auth & Dashboard State
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [submissions, setSubmissions] = useState([]);
  const [authError, setAuthError] = useState('');

  // Fetch Submissions if authenticated
  useEffect(() => {
    if (token && isAdminMode) {
      fetchSubmissions();
    }
  }, [token, isAdminMode]);

  const fetchSubmissions = async () => {
    try {
      const res = await axios.get(`${API_URL}/forms/submissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmissions(res.data);
    } catch (err) {
      handleLogout();
    }
  };

  // Client-side Validation
  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (formData.message.length < 10) errors.message = "Message must be at least 10 characters";
    return errors;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    
    try {
      const res = await axios.post(`${API_URL}/forms/submit`, formData);
      setSubmitStatus({ success: true, message: res.data.msg });
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setSubmitStatus({ success: false, message: err.response?.data?.errors?.[0]?.msg || "Submission failed" });
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, authData);
      localStorage.setItem('adminToken', res.data.token);
      setToken(res.data.token);
      setAuthError('');
    } catch (err) {
      setAuthError(err.response?.data?.msg || 'Login Failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setIsAdminMode(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      {/* Header Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-pink-600 text-white rounded-lg font-bold tracking-wider text-xl">🚀</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">She Can <span className="text-pink-600">Foundation</span></span>
          </div>
          <button 
            onClick={() => setIsAdminMode(!isAdminMode)} 
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {isAdminMode ? <Users className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            {isAdminMode ? "Go to Public Form" : "Admin Panel"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {!isAdminMode ? (
          /* PUBLIC FORM INTERFACE */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-w-lg mx-auto">
            <div className="bg-gradient-to-r from-pink-600 to-indigo-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold">Empower Her Journey</h2>
              <p className="text-pink-100 text-sm mt-1">Get in touch or join our volunteer network today.</p>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {submitStatus && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${submitStatus.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'}`}>
                  {submitStatus.success ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />}
                  <span className="text-sm font-medium">{submitStatus.message}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${formErrors.name ? 'border-rose-400' : 'border-slate-300'}`}
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                {formErrors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${formErrors.email ? 'border-rose-400' : 'border-slate-300'}`}
                  placeholder="jane@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                {formErrors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Your Message / Intent</label>
                <textarea 
                  rows="4"
                  className={`w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all ${formErrors.message ? 'border-rose-400' : 'border-slate-300'}`}
                  placeholder="How would you like to contribute or connect..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
                {formErrors.message && <p className="text-xs text-rose-500 mt-1 font-medium">{formErrors.message}</p>}
              </div>

              <button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" /> Submit Application
              </button>
            </form>
          </div>
        ) : (
          /* ADMIN PORTAL INTERFACE */
          <div className="space-y-6">
            {!token ? (
              /* Admin Login Form */
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-sm mx-auto p-6">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Admin Gate</h3>
                  <p className="text-slate-500 text-sm mt-0.5">Authorized access only.</p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-4">
                  {authError && <p className="text-xs bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-lg text-center font-medium">{authError}</p>}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Admin Email</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setAuthData({...authData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Password</label>
                    <input 
                      type="password" 
                      required
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                    />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors cursor-pointer">
                    Authenticate
                  </button>
                </form>
              </div>
            ) : (
              /* Authenticated Admin Dashboard Grid */
              <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Submission Inbox</h2>
                    <p className="text-sm text-slate-500">Review real-time community engagement submissions</p>
                  </div>
                  <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-lg transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>

                <div className="space-y-4">
                  {submissions.length === 0 ? (
                    <p className="text-center text-slate-400 py-8 text-sm">No submissions recorded yet.</p>
                  ) : (
                    submissions.map((sub) => (
                      <div key={sub._id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all bg-slate-50/50">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">{sub.name}</h4>
                            <p className="text-xs text-indigo-600 font-medium">{sub.email}</p>
                          </div>
                          <span className="text-[11px] font-medium text-slate-400">
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 border-t border-slate-200/60 pt-2 mt-2 italic">
                          "{sub.message}"
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;