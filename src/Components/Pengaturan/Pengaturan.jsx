import React, { useState, useRef } from "react";
import DashboardLayout from "../Dashboard/DashboardLayout";
import "./pengaturan.css";
import { useSettings } from "../../context/settingsContext";

export default function Pengaturan() {
  const {
    settings,
    updateSettings,
    resetSettings,
    exportData,
    importData,
  } = useSettings();

  const [localAdmin, setLocalAdmin] = useState(settings.admin);
  const [localDisplay, setLocalDisplay] = useState(settings.display);
  const [localTahfidz, setLocalTahfidz] = useState(settings.tahfidz);
  const [localGeneral, setLocalGeneral] = useState(settings.general);
  
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef(null);

  const handleSaveAdmin = () => {
    updateSettings('admin', localAdmin);
    alert("Profil admin berhasil disimpan!");
  };

  const handleSaveDisplay = () => {
    updateSettings('display', localDisplay);
    alert("Pengaturan tampilan berhasil diperbarui!");
  };

  const handleSaveTahfidz = () => {
    updateSettings('tahfidz', localTahfidz);
    alert("Pengaturan sistem tahfidz tersimpan!");
  };

  const handleSaveGeneral = () => {
    updateSettings('general', localGeneral);
    alert("Pengaturan umum berhasil disimpan!");
  };

  const handleExport = (type) => {
    exportData(type);
    alert(`Data ${type} berhasil diexport!`);
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = importData(e.target.result);
        if (result.success) {
          setImportMessage("✅ Data berhasil diimport!");
          setTimeout(() => setImportMessage(""), 3000);
          
          // Refresh local state
          setLocalAdmin(settings.admin);
          setLocalDisplay(settings.display);
          setLocalTahfidz(settings.tahfidz);
          setLocalGeneral(settings.general);
        } else {
          setImportMessage("❌ " + result.message);
        }
      } catch (error) {
        setImportMessage("❌ Terjadi kesalahan saat import");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin mereset semua pengaturan ke default?")) {
      resetSettings();
      alert("Pengaturan berhasil direset ke default!");
    }
  };

  return (
    <DashboardLayout>
      <div className="pengaturan-container">
        <h2 className="pengaturan-title">⚙️ Pengaturan Sistem</h2>

        {importMessage && (
          <div className={`import-message ${importMessage.includes('✅') ? 'success' : 'error'}`}>
            {importMessage}
          </div>
        )}

        {/* 1. PENGATURAN PROFIL ADMIN */}
        <div className="pengaturan-section">
          <h3>👤 Pengaturan Profil Admin</h3>

          <label>Nama Admin</label>
          <input
            type="text"
            value={localAdmin.name}
            onChange={(e) => setLocalAdmin({...localAdmin, name: e.target.value})}
            placeholder="Masukkan nama admin"
          />

          <label>Email Admin</label>
          <input
            type="email"
            value={localAdmin.email}
            onChange={(e) => setLocalAdmin({...localAdmin, email: e.target.value})}
            placeholder="admin@tahfidz.com"
          />

          <label>Avatar URL (opsional)</label>
          <input
            type="text"
            value={localAdmin.avatar || ''}
            onChange={(e) => setLocalAdmin({...localAdmin, avatar: e.target.value})}
            placeholder="https://example.com/avatar.jpg"
          />

          <button onClick={handleSaveAdmin} className="btn-save">
            Simpan Profil
          </button>
        </div>

        {/* 2. PENGATURAN TAMPILAN */}
        <div className="pengaturan-section">
          <h3>🎨 Pengaturan Tampilan Dashboard</h3>

          <label>Tema</label>
          <select 
            value={localDisplay.theme} 
            onChange={(e) => setLocalDisplay({...localDisplay, theme: e.target.value})}
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="green">Tahfidz Green</option>
            <option value="blue">Ocean Blue</option>
          </select>

          <label>Ukuran Teks</label>
          <select
            value={localDisplay.fontSize}
            onChange={(e) => setLocalDisplay({...localDisplay, fontSize: e.target.value})}
          >
            <option value="small">Kecil (14px)</option>
            <option value="medium">Sedang (16px)</option>
            <option value="large">Besar (18px)</option>
          </select>

          <div className="toggle-row">
            <span>Aktifkan Animasi</span>
            <input
              type="checkbox"
              checked={localDisplay.animations}
              onChange={() => setLocalDisplay({...localDisplay, animations: !localDisplay.animations})}
            />
          </div>

          <div className="toggle-row">
            <span>Mode Hemat Data</span>
            <input
              type="checkbox"
              checked={localDisplay.dataSaving}
              onChange={() => setLocalDisplay({...localDisplay, dataSaving: !localDisplay.dataSaving})}
            />
            <small className="helper-text">(Menyembunyikan gambar yang tidak perlu)</small>
          </div>

          <button onClick={handleSaveDisplay} className="btn-save">
            Simpan Tampilan
          </button>
        </div>

        {/* 3. PENGATURAN SISTEM TAHFIDZ */}
        <div className="pengaturan-section">
          <h3>📚 Pengaturan Sistem Tahfidz</h3>

          <label>Target Hafalan per Minggu</label>
          <div className="input-with-unit">
            <input
              type="range"
              min="1"
              max="10"
              value={localTahfidz.weeklyTarget}
              onChange={(e) => setLocalTahfidz({...localTahfidz, weeklyTarget: parseInt(e.target.value)})}
            />
            <span className="unit">{localTahfidz.weeklyTarget} halaman</span>
          </div>

          <label>Jenis Penilaian</label>
          <select
            value={localTahfidz.assessmentType}
            onChange={(e) => setLocalTahfidz({...localTahfidz, assessmentType: e.target.value})}
          >
            <option value="harian">Harian</option>
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
          </select>

          <label>Pengingat Hafalan</label>
          <select
            value={localTahfidz.reminderType}
            onChange={(e) => setLocalTahfidz({...localTahfidz, reminderType: e.target.value})}
          >
            <option value="email">Email</option>
            <option value="popup">Popup Dashboard</option>
            <option value="both">Email & Popup</option>
            <option value="none">Tidak Ada</option>
          </select>

          <div className="toggle-row">
            <span>Auto Save</span>
            <input
              type="checkbox"
              checked={localTahfidz.autoSave}
              onChange={() => setLocalTahfidz({...localTahfidz, autoSave: !localTahfidz.autoSave})}
            />
          </div>

          <div className="toggle-row">
            <span>Suara Notifikasi</span>
            <input
              type="checkbox"
              checked={localTahfidz.notificationSound}
              onChange={() => setLocalTahfidz({...localTahfidz, notificationSound: !localTahfidz.notificationSound})}
            />
          </div>

          <button onClick={handleSaveTahfidz} className="btn-save">
            Simpan Sistem Tahfidz
          </button>
        </div>

        {/* 4. PENGATURAN UMUM */}
        <div className="pengaturan-section">
          <h3>🌐 Pengaturan Umum</h3>

          <label>Bahasa</label>
          <select
            value={localGeneral.language}
            onChange={(e) => setLocalGeneral({...localGeneral, language: e.target.value})}
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>

          <label>Zona Waktu</label>
          <select
            value={localGeneral.timezone}
            onChange={(e) => setLocalGeneral({...localGeneral, timezone: e.target.value})}
          >
            <option value="Asia/Jakarta">WIB (Jakarta)</option>
            <option value="Asia/Makassar">WITA (Makassar)</option>
            <option value="Asia/Jayapura">WIT (Jayapura)</option>
          </select>

          <label>Format Tanggal</label>
          <select
            value={localGeneral.dateFormat}
            onChange={(e) => setLocalGeneral({...localGeneral, dateFormat: e.target.value})}
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>

          <button onClick={handleSaveGeneral} className="btn-save">
            Simpan Pengaturan Umum
          </button>
        </div>

        {/* 5. BACKUP & RESET */}
        <div className="pengaturan-section">
          <h3>🗂 Backup & Reset</h3>

          <div className="button-group">
            <button 
              onClick={() => handleExport('settings')}
              className="btn-export"
            >
              Export Pengaturan
            </button>
            
            <button 
              onClick={() => handleExport('all')}
              className="btn-export"
            >
              Export Semua Data
            </button>
          </div>

          <div className="import-section">
            <label>Import Pengaturan</label>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button 
              onClick={() => fileInputRef.current.click()}
              className="btn-import"
            >
              Pilih File JSON
            </button>
            <small className="helper-text">Hanya file JSON yang didukung</small>
          </div>

          <button
            className="btn-reset"
            onClick={handleReset}
          >
            Reset Semua Pengaturan
          </button>
        </div>

        {/* 6. INFO SISTEM */}
        <div className="pengaturan-section system-info">
          <h3>ℹ️ Info Sistem</h3>
          
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Versi Aplikasi:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tema Aktif:</span>
              <span className="info-value">{settings.display.theme}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Target Hafalan:</span>
              <span className="info-value">{settings.tahfidz.weeklyTarget} halaman/minggu</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mode Hemat Data:</span>
              <span className="info-value">{settings.display.dataSaving ? 'Aktif' : 'Nonaktif'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Terakhir Diupdate:</span>
              <span className="info-value">{new Date().toLocaleDateString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}