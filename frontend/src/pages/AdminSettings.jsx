import React, { useState } from 'react';
import { Camera, MonitorPlay, Sliders, Play, Pause, Save, CheckCircle2, LayoutTemplate, Edit, Upload, Trash2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * AdminSettings
 *
 * Camera feed and detection model configuration page.
 * All inputs are controlled and "saved" locally during the prototype stage.
 *
 * When the Flask backend is ready, replace the local setSaved() in handleSave()
 * with a call to saveDetectionSettings() from api/detectionApi.js.
 *
 * @param {boolean}  simEnabled  - Whether the simulation is active.
 * @param {Function} onToggleSim - Callback to pause / resume the simulation.
 */
const AdminSettings = ({ simEnabled = false, onToggleSim }) => {
  const [settings, setSettings] = useState({
    rtspUrl: 'rtsp://192.168.1.100:554/stream1',
    fps: '15',
    confidence: 75,
  });

 // ==================== CMS CONFIG ====================
  const [cmsConfig, setCmsConfig] = useState({
    brandName: 'TABLEYE',
    welcomeMessage: 'Live Occupancy Dashboard',
    themeColor: '#3b82f6',
    sidebarColor: '#0f172a',
    accentColor: '#10b981',
    textColor: '#1e2937',
    backgroundColor: '#f8fafc',
    showLiveVideoPublicly: false,
    showOccupancyStats: true,
    showTableList: true,
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [bgImagePreview, setBgImagePreview] = useState(null);

  const [isCmsOpen, setIsCmsOpen] = useState(false);

  const updateField = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleCmsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCmsConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      setCmsConfig(prev => ({ ...prev, logo: previewUrl }));
    }
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setBgImagePreview(previewUrl);
      setCmsConfig(prev => ({ ...prev, backgroundImage: previewUrl }));
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setCmsConfig(prev => ({ ...prev, logo: null }));
  };

  const removeBgImage = () => {
    setBgImagePreview(null);
    setCmsConfig(prev => ({ ...prev, backgroundImage: null }));
  };

  const handleSave = () => {
    toast.success('Configuration Saved', {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
    });
  };

  const handleCmsSave = () => {
    setIsCmsOpen(false);
    toast.success('CMS Updated - Dashboard settings have been applied.', {
      position: "top-center",
      autoClose: 3000,
      theme: "dark",
    });
  };

  return (
    <div className="p-8">
      {/* Inline Topbar Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">System Settings</h1>
          <p className="text-slate-500 text-sm">Configure the camera feed and detection model used by TABLEYE.</p>
        </div>
        <div>
          <button
            onClick={onToggleSim}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-sm transition
              ${simEnabled
                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
          >
            {simEnabled ? <Pause size={16} /> : <Play size={16} />}
            {simEnabled ? 'Pause Simulation' : 'Start Simulation'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT SIDE: Camera & Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Camera size={20} /> Camera & Feed
          </h3>

          <div className="w-full h-48 bg-slate-900 rounded-lg flex items-center justify-center text-slate-500 mb-4 relative overflow-hidden">
            <MonitorPlay size={32} />
            <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-1 rounded">
              RTSP Stream Preview
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">RTSP Stream URL</label>
              <input
                type="text"
                value={settings.rtspUrl}
                onChange={e => updateField('rtspUrl', e.target.value)}
                placeholder="rtsp://<camera-ip>:554/stream1"
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:border-blue-500 outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">
                Address of the overhead CCTV camera. Used by the detection engine once connected.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Processing FPS</label>
              <select
                value={settings.fps}
                onChange={e => updateField('fps', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 focus:border-blue-500 outline-none"
              >
                <option value="10">10 FPS (Low CPU)</option>
                <option value="15">15 FPS (Recommended)</option>
                <option value="30">30 FPS (High Performance)</option>
              </select>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Detection Model & CMS */}
        <div className="flex flex-col gap-8">
          
          {/* Detection Model */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Sliders size={20} /> Detection Model
            </h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confidence Trigger: {(settings.confidence / 100).toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.confidence}
                onChange={e => updateField('confidence', Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-400">
                Minimum confidence a YOLOv8 person detection needs before it counts toward a table.
              </p>
            </div>
          </div>

          {/* CMS Modal Trigger Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <LayoutTemplate size={20} className="text-blue-500" /> Manage Your Content
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Full control over your public dashboard — logos, colors, images, and visibility.
            </p>
            
            <button 
              onClick={() => setIsCmsOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide transition"
            >
              <Edit size={16} /> Open CMS Editor
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM CENTER: Save bar */}
      <div className="mt-12 flex flex-col items-center justify-center gap-3">
        <button
          onClick={handleSave}
          className="w-full max-w-md flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white transition hover:bg-blue-700 shadow-md"
        >
          <Save size={18} /> Save Settings
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. CMS CONTENT MANAGEMENT MODAL OVERLAY */}
      {/* ========================================================= */}
      {isCmsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <LayoutTemplate className="text-blue-600" size={28} />
                  Dashboard Live CMS
                </h3>
                <p className="text-sm text-slate-500 mt-1">Customize your public-facing occupancy dashboard</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-10">

              {/* ==================== GENERAL ==================== */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">
                  <span className="text-blue-600">General</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Restaurant / Brand Name</label>
                    <input type="text" name="brandName" value={cmsConfig.brandName} onChange={handleCmsChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Welcome / Tagline</label>
                    <input type="text" name="welcomeMessage" value={cmsConfig.welcomeMessage} onChange={handleCmsChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* ==================== MEDIA ==================== */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">Media Assets</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Logo */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Logo</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-400 transition">
                      {logoPreview ? (
                        <div className="relative inline-block">
                          <img src={logoPreview} alt="Logo preview" className="h-20 mx-auto object-contain rounded-lg" />
                          <button onClick={removeLogo} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                          <p className="text-sm text-slate-600">Click to upload logo</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                      <label htmlFor="logo-upload" className="cursor-pointer text-blue-600 text-sm font-medium hover:underline mt-2 block">
                        Choose Image
                      </label>
                    </div>
                  </div>

                  {/* Background Image */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Background Image (Optional)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-blue-400 transition">
                      {bgImagePreview ? (
                        <div className="relative">
                          <img src={bgImagePreview} alt="Background preview" className="w-full h-32 object-cover rounded-xl" />
                          <button onClick={removeBgImage} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                          <p className="text-sm text-slate-600">Upload background image</p>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleBgImageUpload} className="hidden" id="bg-upload" />
                      <label htmlFor="bg-upload" className="cursor-pointer text-blue-600 text-sm font-medium hover:underline mt-2 block">
                        Choose Image
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ==================== APPEARANCE ==================== */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">Appearance</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Topbar / Theme</label>
                    <input type="color" name="themeColor" value={cmsConfig.themeColor} onChange={handleCmsChange}
                      className="w-full h-12 border border-slate-200 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Sidebar</label>
                    <input type="color" name="sidebarColor" value={cmsConfig.sidebarColor} onChange={handleCmsChange}
                      className="w-full h-12 border border-slate-200 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Accent</label>
                    <input type="color" name="accentColor" value={cmsConfig.accentColor} onChange={handleCmsChange}
                      className="w-full h-12 border border-slate-200 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Background</label>
                    <input type="color" name="backgroundColor" value={cmsConfig.backgroundColor} onChange={handleCmsChange}
                      className="w-full h-12 border border-slate-200 rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Text Color</label>
                    <input type="color" name="textColor" value={cmsConfig.textColor} onChange={handleCmsChange}
                      className="w-full h-12 border border-slate-200 rounded-xl cursor-pointer" />
                  </div>
                </div>
              </div>

              {/* ==================== DISPLAY OPTIONS ==================== */}
              <div>
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2 border-b pb-2">Display Options</h4>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="showLiveVideoPublicly" checked={cmsConfig.showLiveVideoPublicly} onChange={handleCmsChange}
                      className="w-5 h-5 accent-blue-600" />
                    <span>Show Live Camera Feed publicly</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="showOccupancyStats" checked={cmsConfig.showOccupancyStats} onChange={handleCmsChange}
                      className="w-5 h-5 accent-blue-600" />
                    <span>Show Occupancy Statistics</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="showTableList" checked={cmsConfig.showTableList} onChange={handleCmsChange}
                      className="w-5 h-5 accent-blue-600" />
                    <span>Show Detailed Table List</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
              <button 
                onClick={() => setIsCmsOpen(false)}
                className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-2xl font-medium transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCmsSave}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-sm transition flex items-center gap-2"
              >
                <Save size={18} /> Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
    </div>
  );
};

export default AdminSettings;