import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Pengaturan from "./Components/Pengaturan/Pengaturan";
import { useSettings } from "./context/settingsContext";

const Hero = lazy(() => import("./Components/Hero/Hero"));
const Programs = lazy(() => import("./Components/Programs/Programs"));
const Title = lazy(() => import("./Components/Title/Title"));
const About = lazy(() => import("./Components/About/About"));
const SantriList = lazy(() => import("./Components/Santri/SantriList/SantriList"));
const HafalanList = lazy(() => import("./Components/Hafalan/HafalanList"));

const FastLoader = () => (
  <div style={{
    padding: "20px",
    textAlign: "center",
    fontSize: "14px",
    opacity: 0.7
  }}>
    Memuat...
  </div>
);

const App = () => {
  const { settings } = useSettings();

  useEffect(() => {
    console.log('Settings applied:', settings);
  }, [settings]);

  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<FastLoader />}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <div className="container">
                  <Title subTitle="Our PROGRAM" title="What We Offer" />
                  <Programs />
                  <About />
                </div>
              </>
            }
          />

          <Route path="/santri" element={<SantriList />} />
          <Route path="/hafalan" element={<HafalanList />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;