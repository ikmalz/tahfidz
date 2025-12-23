import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const PAGE_SIZE = 10;

export default function TahfidzDetail() {
  const { id } = useParams();

  const [santri, setSantri] = useState(null);
  const [tab, setTab] = useState("hafalan");

  const [hafalan, setHafalan] = useState([]);
  const [hafalanPage, setHafalanPage] = useState(1);
  const [hafalanTotal, setHafalanTotal] = useState(0);

  const [murajaah, setMurajaah] = useState([]);
  const [murajaahPage, setMurajaahPage] = useState(1);
  const [murajaahTotal, setMurajaahTotal] = useState(0);

  const [bulan, setBulan] = useState("");
  const [surah, setSurah] = useState("");

  useEffect(() => {
    loadSantri();
  }, []);

  useEffect(() => {
    setHafalanPage(1);
  }, [bulan, surah]);

  useEffect(() => {
    tab === "hafalan" ? loadHafalan() : loadMurajaah();
  }, [tab, hafalanPage, murajaahPage]);

  const loadSantri = async () => {
    const { data } = await supabase
      .from("santri")
      .select("nama, kelas, tanggal_masuk")
      .eq("id", id)
      .single();

    setSantri(data);
  };

  const [debouncedSurah, setDebouncedSurah] = useState("");
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSurah(surah);
    }, 500);
    return () => clearTimeout(t);
  }, [surah]);

  const BULAN = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];

  const loadHafalan = async () => {
    let query = supabase
      .from("hafalan")
      .select("*", { count: "exact" })
      .eq("santri_id", id)
      .order("tanggal", { ascending: false });

    if (bulan) {
      query = query
        .gte("tanggal", `2025-${bulan}-01`)
        .lte("tanggal", `2025-${bulan}-31`);
    }

    if (surah) {
      query = query.ilike("surah", `%${surah}%`);
    }

    const { data, count } = await query.range(
      (hafalanPage - 1) * PAGE_SIZE,
      hafalanPage * PAGE_SIZE - 1
    );

    setHafalan(data || []);
    setHafalanTotal(count || 0);
  };

  const loadMurajaah = async () => {
    const { data, count } = await supabase
      .from("murajaah")
      .select("*, guru:guru_id(nama)", { count: "exact" })
      .eq("santri_id", id)
      .order("tanggal", { ascending: false })
      .range((murajaahPage - 1) * PAGE_SIZE, murajaahPage * PAGE_SIZE - 1);

    setMurajaah(data || []);
    setMurajaahTotal(count || 0);
  };

  const grafikData = hafalan.reduce((acc, h) => {
    const bulan = h.tanggal.slice(0, 7);
    acc[bulan] = (acc[bulan] || 0) + (h.ayat_akhir - h.ayat_awal + 1);
    return acc;
  }, {});

  const grafik = Object.entries(grafikData)
    .filter(([b]) => (bulan ? b.endsWith(`-${bulan}`) : true))
    .map(([b, ayat]) => ({
      bulan: b,
      ayat,
    }));

  if (!santri) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Memuat data santri...
      </div>
    );
  }

  const totalAyat = grafik.reduce((sum, g) => sum + g.ayat, 0);

  const rataRataAyat = grafik.length
    ? Math.round(totalAyat / grafik.length)
    : 0;

  const bulanTerbaik = grafik.reduce(
    (best, curr) => (curr.ayat > best.ayat ? curr : best),
    grafik[0] || { ayat: 0 }
  );

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-4 md:space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">
          {santri.nama}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Kelas <span className="font-medium">{santri.kelas}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              📊 Perkembangan Hafalan
            </h3>
            <p className="text-xs text-gray-500 hidden md:block">
              Grafik jumlah ayat yang dihafal setiap bulan
            </p>
          </div>

          {/* TOGGLE MOBILE */}
          <button
            onClick={() => setShowChart(!showChart)}
            className="text-xs text-blue-600 hover:underline"
          >
            <span className="md:hidden">
              {showChart ? "Sembunyikan" : "Lihat Grafik"}
            </span>
            <span className="hidden md:inline">
              {showChart ? "Sembunyikan Grafik" : "Toggle Grafik"}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <SummaryCard title="Total" value={`${totalAyat} ayat`} />
          <SummaryCard title="Rata-rata" value={`${rataRataAyat} / bln`} />
          <SummaryCard
            title="Terbaik"
            value={
              bulanTerbaik?.bulan ? formatBulanLabel(bulanTerbaik.bulan) : "-"
            }
          />
          <SummaryCard title="Max Ayat" value={`${bulanTerbaik?.ayat || 0}`} />
        </div>

        {(showChart || window.innerWidth >= 768) && (
          <div className="mt-4">
            {grafik.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-6">
                Tidak ada data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={grafik}>
                  <XAxis
                    dataKey="bulan"
                    tickFormatter={formatBulanLabel}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />

                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;

                      const ayat = payload[0].value;
                      const status =
                        ayat >= rataRataAyat
                          ? "👍 Bagus"
                          : "⚠ Perlu ditingkatkan";

                      return (
                        <div className="bg-white border rounded-lg px-3 py-2 text-sm shadow">
                          <p className="font-medium">
                            Bulan {formatBulanLabel(label)}
                          </p>
                          <p>
                            Total: <b>{ayat} ayat</b>
                          </p>
                          <p className="text-xs text-gray-500">{status}</p>
                        </div>
                      );
                    }}
                  />
                  <ReferenceLine
                    y={rataRataAyat}
                    stroke="#22c55e"
                    strokeDasharray="3 3"
                    label={{
                      value: "Rata-rata",
                      position: "right",
                      fontSize: 10,
                      fill: "#16a34a",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ayat"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="flex border-b">
          <TabButton
            active={tab === "hafalan"}
            onClick={() => setTab("hafalan")}
            label="📘 Hafalan"
          />
          <TabButton
            active={tab === "murajaah"}
            onClick={() => setTab("murajaah")}
            label="🔁 Murajaah"
          />
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <select
              className="border rounded-md px-3 py-2 text-sm"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
            >
              <option value="">Semua Bulan</option>
              {BULAN.map((b) => (
                <option key={b} value={b}>
                  Bulan {b}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Cari surah..."
              className="border rounded-md px-3 py-2 text-sm"
              value={surah}
              onChange={(e) => setSurah(e.target.value)}
            />
          </div>

          {tab === "hafalan" && (
            <DataTable
              headers={["Tanggal", "Surah", "Ayat", "Status"]}
              rows={hafalan.map((h) => [
                <div className="flex flex-col">
                  <span className="font-medium">
                    {formatTanggal(h.tanggal)}
                  </span>
                  <span className="text-xs text-gray-400">{h.tanggal}</span>
                </div>,
                h.surah,
                `${h.ayat_awal}-${h.ayat_akhir}`,
                <span
                  className={`badge ${
                    h.status === "lancar" ? "badge-success" : "badge-warning"
                  }`}
                >
                  {h.status}
                </span>,
              ])}
              page={hafalanPage}
              total={hafalanTotal}
              onPageChange={setHafalanPage}
            />
          )}

          {tab === "murajaah" && (
            <div className="max-h-[65vh] overflow-y-auto pr-1">
              <DataTable
                headers={["Tanggal", "Surah", "Ayat", "Guru", "Kualitas"]}
                rows={murajaah.map((m) => [
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatTanggal(m.tanggal)}
                    </span>
                    <span className="text-xs text-gray-400">{m.tanggal}</span>
                  </div>,
                  m.surah,
                  `${m.ayat_awal}-${m.ayat_akhir}`,
                  m.guru?.nama ?? "-",
                  m.kualitas ?? "-",
                ])}
                page={murajaahPage}
                total={murajaahTotal}
                onPageChange={setMurajaahPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="border rounded-lg p-3 bg-blue-50 text-center">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-lg font-bold text-blue-700">{value}</p>
    </div>
  );
}

function formatBulanLabel(value) {
  const [year, month] = value.split("-");
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
}

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(tanggal);
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 text-sm font-medium border-b-2 transition
        ${
          active
            ? "border-blue-700 text-blue-700"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
    >
      {label}
    </button>
  );
}

function DataTable({ headers, rows, page, total, onPageChange }) {
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      {/* DESKTOP TABLE */}
      <div className="overflow-x-auto rounded-lg border hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-2">
        {rows.map((row, i) => (
          <div
            key={i}
            className="border rounded-lg p-3 bg-white flex justify-between items-center"
          >
            {/* LEFT */}
            <div className="space-y-1">
              <div className="text-sm font-medium">{row[1]}</div>
              <div className="text-xs text-gray-400">{row[0]}</div>
            </div>

            {/* RIGHT */}
            <div className="text-right space-y-1">
              <div className="text-xs">{row[2]}</div>
              <div>{row[3]}</div>
            </div>
          </div>
        ))}
      </div>

      {pages > 1 && (
        <div className="flex justify-between items-center md:justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            ← Prev
          </button>

          <span className="text-xs text-gray-500 md:hidden">
            {page} / {pages}
          </span>

          <button
            disabled={page === pages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
