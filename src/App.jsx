import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Pengaturan from "./Components/Pengaturan/Pengaturan";
import { useSettings } from "./context/settingsContext";
import ProtectedRoute from "./Components/Auth/ProtectedRoute";
import Login from "./Components/Auth/Login";
import MurajaahList from "./Components/Murajaah/MurajaahList";
import GuruList from "./Components/Guru/GuruList";
import DetailList from "./Components/Tahfidz/DetailList";
import HubungiKami from "./pages/HubungiKami";
import Campus from "./Components/Campus/Campus";
import Testimonials from "./Components/Testimonials/Testimonials";
import Footer from "./Components/Footer/Footer";
import { AuthProvider } from "./context/AuthContext";

const Hero = lazy(() => import("./Components/Hero/Hero"));
const Programs = lazy(() => import("./Components/Programs/Programs"));
const Title = lazy(() => import("./Components/Title/Title"));
const About = lazy(() => import("./Components/About/About"));
const SantriList = lazy(() =>
  import("./Components/Santri/SantriList/SantriList")
);
const TahfidzList = lazy(() => import("./Components/Tahfidz/TahfidzList"));
const HafalanList = lazy(() => import("./Components/Hafalan/HafalanList"));

const FastLoader = () => (
  <div
    style={{
      padding: "20px",
      textAlign: "center",
      fontSize: "14px",
      opacity: 0.7,
    }}
  >
    Memuat...
  </div>
);

const App = () => {
  const { settings } = useSettings();

  useEffect(() => {
    console.log("Settings applied:", settings);
  }, [settings]);

  return (
    <AuthProvider>
      <BrowserRouter>
        {window.location.pathname !== "/login" && <Navbar />}

        <Suspense fallback={<FastLoader />}>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/santri"
              element={
                <ProtectedRoute>
                  <SantriList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/hafalan"
              element={
                <ProtectedRoute>
                  <HafalanList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/murajaah"
              element={
                <ProtectedRoute>
                  <MurajaahList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/guru"
              element={
                <ProtectedRoute>
                  <GuruList />
                </ProtectedRoute>
              }
            />

            <Route path="/tahfidz/:id" element={<DetailList />} />
            <Route path="/tahfidz" element={<TahfidzList />} />
            <Route path="/hubungi-kami" element={<HubungiKami />} />

            <Route
              path="/"
              element={
                <>
                  <section id="hero">
                    <Hero />
                  </section>

                  <div className="container">
                    <section id="program">
                      <Title subTitle="Our PROGRAM" title="What We Offer" />
                      <Programs />
                    </section>

                    <section id="about">
                      <About />
                    </section>

                    <section id="campus">
                      <Campus />
                    </section>

                    <section id="testimonials">
                      <Testimonials />
                    </section>

                    <Footer />
                  </div>
                </>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
