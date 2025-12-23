import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import DashboardLayout from "../Dashboard/DashboardLayout";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

export default function TahfidzList() {
  const navigate = useNavigate();

  const [santri, setSantri] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [kelas, setKelas] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadSantri();
  }, [search, kelas, page]);

  const loadSantri = async () => {
    setLoading(true);

    let query = supabase
      .from("santri")
      .select("id, nama, kelas", { count: "exact" })
      .order("nama", { ascending: true })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

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

  const totalPage = Math.ceil(total / PAGE_SIZE);

  return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">
          📖 Daftar Santri Tahfidz
        </h2>

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
            <option value="sore">Sore</option>
          </select>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Kelas</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    Memuat data...
                  </td>
                </tr>
              )}

              {!loading && santri.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-6 text-gray-500">
                    Data tidak ditemukan
                  </td>
                </tr>
              )}

              {santri.map((s, idx) => (
                <tr
                  key={s.id}
                  className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                >
                  <td className="px-4 py-3 font-medium">{s.nama}</td>
                  <td className="px-4 py-3 capitalize">{s.kelas}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => navigate(`/tahfidz/${s.id}`)}
                      className="px-3 py-1 text-xs bg-blue-700 text-white rounded hover:bg-blue-600"
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPage > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              ◀ Prev
            </button>

            <span className="text-sm text-gray-600">
              Halaman {page} dari {totalPage}
            </span>

            <button
              disabled={page === totalPage}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        )}
      </div>
  );
}
