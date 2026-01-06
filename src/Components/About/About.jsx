import React, { useRef, useState } from "react";
import video_mengaji from "../../assets/video_mengaji.mp4";
import play_icon from "../../assets/play-icon.png";

const About = () => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="max-w-7xl mx-auto my-20 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center gap-10">
        {/* VIDEO */}
        <div className="w-full md:w-2/5">
          <div
            className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              src={video_mengaji}
              className="w-full h-72 md:h-[420px] object-cover"
              muted={muted}
              loop
              playsInline
            />

            {/* PLAY OVERLAY */}
            {!playing && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <img
                  src={play_icon}
                  alt="Play"
                  className="w-16 hover:scale-110 transition-transform"
                />
              </div>
            )}

            {/* SOUND BUTTON */}
            <button
              onClick={(e) => {
                e.stopPropagation(); 
                toggleMute();
              }}
              className="
      absolute bottom-3 right-3
      bg-black/60 text-white text-xs
      px-3 py-1 rounded-full
      hover:bg-black/80 transition
    "
            >
              {muted ? "🔇 Aktifkan Suara" : "🔊 Matikan Suara"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Cuplikan kegiatan belajar mengaji di Daarul Qira&apos;ah
          </p>
        </div>

        {/* TEXT */}
        <div className="w-full md:w-3/5">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">
            TENTANG KAMI
          </h3>

          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">
            Daarul Qira&apos;ah
            <br />
            Rumah Qur&apos;an untuk Generasi Berakhlak
          </h2>

          <div className="space-y-4 text-gray-600">
            <p className="text-justify">
              <b>Daarul Qira&apos;ah</b> adalah lembaga pengajian Al-Qur&apos;an
              yang berfokus pada pembinaan hafalan, bacaan, dan akhlak santri
              dalam suasana yang tenang dan penuh keberkahan.
            </p>

            <p className="text-justify">
              Dengan metode pembelajaran terstruktur dan bimbingan asatidz
              berpengalaman, santri dibina agar mampu membaca Al-Qur&apos;an
              dengan baik, menghafalnya secara bertahap, serta membiasakan adab
              Islami.
            </p>

            <p className="text-justify">
              Daarul Qira&apos;ah hadir sebagai ikhtiar mencetak generasi
              Qur&apos;ani yang kuat hafalannya, lembut akhlaknya, dan siap
              menjadi cahaya kebaikan di tengah masyarakat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
