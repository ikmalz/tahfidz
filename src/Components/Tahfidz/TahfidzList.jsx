import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";


const TableSkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </td>
    <td className="px-4 py-3">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </td>
    <td className="px-4 py-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
    </td>
    <td className="px-4 py-3 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
    </td>
    <td className="px-4 py-3 text-center">
      <div className="h-7 bg-gray-200 rounded w-16 mx-auto"></div>
    </td>
  </tr>
);

export default function TahfidzList() {
  const navigate = useNavigate();
  
  const [santri, setSantri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);
  
  const [santriHafalan, setSantriHafalan] = useState({});
  const [santriMurajaah, setSantriMurajaah] = useState({});
  const [todayDate, setTodayDate] = useState("");

  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setTodayDate(today);

    loadSantri();
  }, [search, kelas, page]);

  useEffect(() => {
    // Setelah data santri dimuat, load data hafalan & murajaah untuk setiap santri
    if (santri.length > 0) {
      loadSantriData();
    }
  }, [santri]);

  const loadSantri = async () => {
    setLoading(true);

    let query = supabase
      .from("santri")
      .select("id, nama, kelas", { count: "exact" })
      .order("nama", { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (search) {
      query = query.ilike("nama", `%${search}%`);
    }

    if (kelas) {
      query = query.eq("kelas", kelas);
    }

    const { data, count, error } = await query;

    if (!error) {
      setSantri(data || []);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  // Load data hafalan & murajaah untuk semua santri yang ditampilkan
  const loadSantriData = async () => {
    try {
      const santriIds = santri.map((s) => s.id);

      if (santriIds.length === 0) return;

      // Load hafalan terbaru untuk setiap santri (1 terbaru per santri)
      const { data: hafalanData } = await supabase
        .from("hafalan")
        .select("id, tanggal, surah, ayat_awal, ayat_akhir, status, santri_id")
        .in("santri_id", santriIds)
        .order("tanggal", { ascending: false });

      // Load murajaah terbaru untuk setiap santri (1 terbaru per santri)
      const { data: murajaahData } = await supabase
        .from("murajaah")
        .select("id, tanggal, surah, ayat_awal, ayat_akhir, santri_id")
        .in("santri_id", santriIds)
        .order("tanggal", { ascending: false });

      // Organize data by santri_id
      const hafalanBySantri = {};
      const murajaahBySantri = {};

      // Ambil hafalan terbaru untuk setiap santri
      hafalanData?.forEach((h) => {
        if (!hafalanBySantri[h.santri_id]) {
          hafalanBySantri[h.santri_id] = h;
        }
      });

      // Ambil murajaah terbaru untuk setiap santri
      murajaahData?.forEach((m) => {
        if (!murajaahBySantri[m.santri_id]) {
          murajaahBySantri[m.santri_id] = m;
        }
      });

      setSantriHafalan(hafalanBySantri);
      setSantriMurajaah(murajaahBySantri);
    } catch (error) {
      console.error("Error loading santri data:", error);
    }
  };

  // Format tanggal singkat
  const formatShortDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });
    }
  };

  // Format tanggal untuk header
  const formatIndonesianDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const totalPage = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        📖 Daftar Santri Tahfidz
      </h2>

      {/* INFO HARI INI */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          📅 {formatIndonesianDate(todayDate)}
        </h3>
        <p className="text-sm text-gray-600">
          Menampilkan hafalan dan murajaah terbaru setiap santri
        </p>
      </div>

      {/* FILTER */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama santri..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="px-4 py-2 border rounded-md w-full md:w-1/3"
        />

        <select
          value={kelas}
          onChange={(e) => {
            setPage(1);
            setKelas(e.target.value);
          }}
          className="px-4 py-2 border rounded-md w-full md:w-1/5"
        >
          <option value="">Semua Kelas</option>
          <option value="pagi">Pagi</option> 
          <option value="siang">Siang</option> 
          <option value="sore">Sore</option>
          <option value="malam">Malam</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-3 gap-2 text-sm text-gray-600">
        <div>
          Menampilkan <b>{(page - 1) * pageSize + 1}</b> –{" "}
          <b>{Math.min(page * pageSize, total)}</b> dari <b>{total}</b> santri
        </div>

        {/* PAGE SIZE SELECT */}
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>baris</span>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-auto bg-white border rounded-lg shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-900 text-white sticky top-0 z-10">
            <tr>
              <th className="px-3 py-3 text-center w-12">No</th>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">Kelas</th>
              <th className="px-4 py-3 text-left">Hafalan Terbaru</th>
              <th className="px-4 py-3 text-left">Murajaah Terbaru</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {/* SKELETON LOADING
            {loading &&
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <TableSkeletonRow key={index} />
              ))} */}

            {/* DATA KOSONG */}
            {!loading && santri.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Data tidak ditemukan
                </td>
              </tr>
            )}

            {/* DATA ASLI */}
            {!loading &&
              santri.map((s, idx) => {
                const latestHafalan = santriHafalan[s.id];
                const latestMurajaah = santriMurajaah[s.id];

                return (
                  <tr
                    key={s.id}
                    className={`transition hover:bg-blue-50 ${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="px-3 py-3 text-center text-gray-500">
                      {(page - 1) * pageSize + idx + 1}
                    </td>

                    <td className="px-4 py-3 font-medium">{s.nama}</td>
                    <td className="px-4 py-3 capitalize">{s.kelas}</td>

                    <td className="px-4 py-3">
                      {latestHafalan ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-blue-700">
                              {latestHafalan.surah}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                latestHafalan.status === "hafal"
                                  ? "bg-green-100 text-green-800"
                                  : latestHafalan.status === "setor"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {latestHafalan.status || "Pending"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            Ayat {latestHafalan.ayat_awal}-
                            {latestHafalan.ayat_akhir}
                            <span className="ml-2 text-gray-500">
                              {formatShortDate(latestHafalan.tanggal)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {latestMurajaah ? (
                        <div className="space-y-1">
                          <div className="font-medium text-purple-700">
                            {latestMurajaah.surah}
                          </div>
                          <div className="text-xs text-gray-600">
                            Ayat {latestMurajaah.ayat_awal}-
                            {latestMurajaah.ayat_akhir}
                            <span className="ml-2 text-gray-500">
                              {formatShortDate(latestMurajaah.tanggal)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => navigate(`/tahfidz/${s.id}`)}
                        className="px-3 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-600"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPage > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3">
          {/* INFO */}
          <span className="text-sm text-gray-600">
            Halaman <b>{page}</b> dari <b>{totalPage}</b>
          </span>

          {/* NAVIGATION */}
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              ◀
            </button>

            {/* JUMP PAGE */}
            <input
              type="number"
              min="1"
              max={totalPage}
              value={page}
              onChange={(e) => {
                let val = Number(e.target.value);
                if (val >= 1 && val <= totalPage) {
                  setPage(val);
                }
              }}
              className="w-16 text-center border rounded py-1"
            />

            <button
              disabled={page === totalPage}
              onClick={() => setPage(page + 1)}
              className="px-3 py-2 border rounded disabled:opacity-50"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
