import React, { createContext, useState, useContext, useEffect } from "react";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const defaultSettings = {
    admin: {
      name: "Admin Tahfidz",
      email: "admin@tahfidz.com",
      avatar: "",
    },
    display: {
      theme: "light",
      fontSize: "medium",
      animations: true,
      dataSaving: false,
    },
    tahfidz: {
      weeklyTarget: 3,
      assessmentType: "mingguan",
      reminderType: "popup",
      autoSave: true,
      notificationSound: true,
      itemsPerPage: 5,
    },
    general: {
      language: "id",
      timezone: "Asia/Jakarta",
      dateFormat: "DD/MM/YYYY",
    },
  };

  // Load from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem("tahfidz_settings");
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("tahfidz_settings", JSON.stringify(settings));

    // Apply theme
    document.body.setAttribute("data-theme", settings.display.theme);

    // Apply font size
    const fontSizeMap = {
      small: "14px",
      medium: "16px",
      large: "18px",
    };
    document.documentElement.style.fontSize =
      fontSizeMap[settings.display.fontSize] || "16px";

    // Apply animations
    if (!settings.display.animations) {
      document.body.classList.add("no-animations");
    } else {
      document.body.classList.remove("no-animations");
    }
  }, [settings]);

  const updateSettings = (category, updates) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const exportData = (type = "settings") => {
    let data;
    const timestamp = new Date().toISOString().split("T")[0];

    if (type === "settings") {
      data = settings;
    } else if (type === "all") {
      data = {
        settings,
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
      };
    }

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;
    const exportFileName = `tahfidz-${type}-${timestamp}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileName);
    linkElement.click();

    return true;
  };

  const importData = (jsonData) => {
    try {
      const parsed = JSON.parse(jsonData);
      const importedSettings = parsed.settings || parsed;
      setSettings(importedSettings);
      return { success: true, message: "Data berhasil diimport" };
    } catch (error) {
      return { success: false, message: "Format file tidak valid" };
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        exportData,
        importData,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};