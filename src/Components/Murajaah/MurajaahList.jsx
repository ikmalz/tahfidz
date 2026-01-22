import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import DashboardLayout from "../Dashboard/DashboardLayout";

export default function MurajaahList() {
  const [data, setData] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [guru, setGuru] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({
    id: null,
    santri_id: "",
    tanggal: "",
    surah: "",
    ayat_awal: "",
    ayat_akhir: "",
    kualitas: "",
    catatan: "",
    guru_id: "",
  });

  const loadGuru = async () => {
    const { data } = await supabase.from("guru").select("id, nama");
    setGuru(data || []);
  };

  useEffect(() => {
    loadGuru();
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("murajaah")
      .select(
        `
      id,
      tanggal,
      surah,
      ayat_awal,
      ayat_akhir,
      kualitas,
      catatan,
      santri:santri_id (id, nama),
      guru:guru_id (id, nama)
    `,
        { count: "exact" },
      )
      .order("tanggal", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike("surah", `%${search}%`);
    }

    const { data, error, count } = await query;

    if (!error) {
      setData(data || []);
      setTotal(count || 0);
    }

    setLoading(false);
  };

  const loadSantri = async () => {
    const { data } = await supabase
      .from("santri")
      .select("id, nama")
      .order("nama", { ascending: true });

    setSantriList(data || []);
  };

  useEffect(() => {
    loadData();
    loadSantri();
  }, [page, search]);

  const openAdd = () => {
    setForm({
      id: null,
      santri_id: "",
      tanggal: "",
      surah: "",
      ayat_awal: "",
      ayat_akhir: "",
      kualitas: "",
      catatan: "",
      guru_id: "",
    });
    setIsEdit(false);
    setIsOpen(true);
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      santri_id: item.santri?.id,
      tanggal: item.tanggal,
      surah: item.surah,
      ayat_awal: item.ayat_awal,
      ayat_akhir: item.ayat_akhir,
      kualitas: item.kualitas,
      catatan: item.catatan,
      guru_id: item.guru?.id || "",
    });
    setIsEdit(true);
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.santri_id || !form.tanggal || !form.surah) {
      alert("❗ Lengkapi semua field wajib!");
      return;
    }

    if (!form.guru_id) {
      alert("❗ Pilih guru terlebih dahulu!");
      return;
    }

    const payload = {
      santri_id: form.santri_id,
      tanggal: form.tanggal,
      surah: form.surah,
      ayat_awal: form.ayat_awal ? Number(form.ayat_awal) : null,
      ayat_akhir: form.ayat_akhir ? Number(form.ayat_akhir) : null,
      kualitas: form.kualitas,
      catatan: form.catatan,
      guru_id: form.guru_id,
    };

    let res;

    if (isEdit) {
      res = await supabase.from("murajaah").update(payload).eq("id", form.id);
    } else {
      res = await supabase.from("murajaah").insert([payload]);
    }

    if (res.error) {
      alert("❌ Gagal menyimpan!\n" + res.error.message);
      console.error(res.error);
      return;
    }

    setIsOpen(false);
    loadData();
  };

  const deleteData = async (id) => {
    if (!confirm("Hapus data ini?")) return;

    await supabase.from("murajaah").delete().eq("id", id);
    loadData();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.setProperty("--modal-z-index", "9999");
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const SkeletonRow = () => (
    <tr className="animate-pulse">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );

  const SkeletonCard = () => (
    <div className="border rounded-lg p-4 shadow-sm bg-white animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      <div className="h-3 bg-gray-200 rounded w-1/3"></div>

      <div className="space-y-2 mt-3">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
      </div>

      <div className="flex gap-2 mt-4">
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
        <div className="h-8 bg-gray-200 rounded flex-1"></div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 relative z-0">
        <h2 className="text-2xl font-bold text-blue-900 mb-5">
          📖 Data Murajaah
        </h2>

        <button
          onClick={openAdd}
          className="mb-4 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition z-10"
        >
          + Tambah Murajaah
        </button>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="🔍 Cari surah..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg w-full md:w-72
               focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white relative z-0">
          <div className="hidden md:block">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-blue-900 text-white">
                <tr>
                  <th className="px-4 py-3">Santri</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Surah</th>
                  <th className="px-4 py-3">Ayat</th>
                  <th className="px-4 py-3">Kualitas</th>
                  <th className="px-4 py-3">Catatan</th>
                  <th className="px-4 py-3">Guru</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                ) : data.length > 0 ? (
                  data.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="px-4 py-3">{item.santri?.nama}</td>
                      <td className="px-4 py-3">{item.tanggal}</td>
                      <td className="px-4 py-3">{item.surah}</td>
                      <td className="px-4 py-3">
                        {item.ayat_awal} - {item.ayat_akhir}
                      </td>
                      <td className="px-4 py-3">{item.kualitas || "-"}</td>
                      <td className="px-4 py-3">{item.catatan || "-"}</td>
                      <td className="px-4 py-3">{item.guru?.nama || "-"}</td>
                      <td className="px-4 py-3 space-x-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteData(item.id)}
                          className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-500"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center py-5 text-gray-500 italic"
                    >
                      Belum ada data murajaah.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="block md:hidden space-y-4">
            {loading ? (
              [...Array(5)].map((_, i) => <SkeletonCard key={i} />)
            ) : data.length > 0 ? (
              data.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-4 shadow-sm bg-white"
                >
                  <p className="font-semibold text-blue-900">
                    {item.santri?.nama}
                  </p>
                  <p className="text-sm text-gray-600">{item.tanggal}</p>

                  <div className="mt-2 text-sm space-y-1">
                    <p>
                      <b>Surah:</b> {item.surah}
                    </p>
                    <p>
                      <b>Ayat:</b> {item.ayat_awal} - {item.ayat_akhir}
                    </p>
                    <p>
                      <b>Kualitas:</b> {item.kualitas || "-"}
                    </p>
                    <p>
                      <b>Guru:</b> {item.guru?.nama || "-"}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => openEdit(item)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteData(item.id)}
                      className="flex-1 py-2 bg-red-600 text-white rounded"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 italic">
                Belum ada data murajaah.
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">Total Data: {total}</p>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              ◀ Prev
            </button>

            <span className="px-3 py-1 bg-blue-900 text-white rounded">
              {page}
            </span>

            <button
              disabled={page * limit >= total}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-[2px] z-[9999]
                    flex items-center justify-center p-4 animate-fadeIn"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-xl shadow-2xl animate-scaleIn relative z-[10000]"
            style={{
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
              maxHeight: "95vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Sticky */}
            <div
              className="flex justify-between items-center border-b px-6 py-4 bg-white sticky top-0 z-10"
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "white",
                borderBottom: "1px solid #e5e7eb",
                zIndex: 10,
              }}
            >
              <h3 className="text-xl font-semibold text-blue-900">
                {isEdit ? "✏️ Edit Murajaah" : "➕ Tambah Murajaah"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl p-1 bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body dengan Scroll yang dikontrol */}
            <div
              className="p-6 overflow-y-auto flex-grow"
              style={{ maxHeight: "calc(95vh - 80px)" }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* BARIS 1: Santri, Tanggal, Guru */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* SANTRI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Santri <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.santri_id}
                      onChange={(e) =>
                        setForm({ ...form, santri_id: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition duration-200 bg-white"
                      style={{ zIndex: 20 }}
                    >
                      <option value="">-- Pilih Santri --</option>
                      {santriList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TANGGAL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.tanggal}
                      onChange={(e) =>
                        setForm({ ...form, tanggal: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition duration-200 bg-white"
                    />
                  </div>

                  {/* GURU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guru <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.guru_id}
                      onChange={(e) =>
                        setForm({ ...form, guru_id: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition duration-200 bg-white"
                    >
                      <option value="">-- Pilih Guru --</option>
                      {guru?.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* BARIS 2: Surah, Kualitas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SURAH */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Surah <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.surah}
                      onChange={(e) =>
                        setForm({ ...form, surah: e.target.value })
                      }
                      required
                      placeholder="Contoh: Al-Fatihah, Al-Baqarah, dll"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition duration-200 bg-white"
                    />
                  </div>

                  {/* KUALITAS */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kualitas
                    </label>
                    <select
                      value={form.kualitas}
                      onChange={(e) =>
                        setForm({ ...form, kualitas: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               transition duration-200 bg-white"
                    >
                      <option value="">-- Pilih Kualitas --</option>
                      <option value="Sangat Baik">Sangat Baik</option>
                      <option value="Baik">Baik</option>
                      <option value="Cukup">Cukup</option>
                      <option value="Kurang">Kurang</option>
                      <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                    </select>
                  </div>
                </div>

                {/* BARIS 3: Ayat Awal & Akhir */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ayat Awal
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={form.ayat_awal}
                        onChange={(e) =>
                          setForm({ ...form, ayat_awal: e.target.value })
                        }
                        placeholder="1"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 transition duration-200 bg-white"
                      />
                      <span className="ml-3 text-gray-600">ayat</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ayat Akhir
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        value={form.ayat_akhir}
                        onChange={(e) =>
                          setForm({ ...form, ayat_akhir: e.target.value })
                        }
                        placeholder="7"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 transition duration-200 bg-white"
                      />
                      <span className="ml-3 text-gray-600">ayat</span>
                    </div>
                  </div>
                </div>

                {/* BARIS 4: Catatan (full width) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={form.catatan}
                    onChange={(e) =>
                      setForm({ ...form, catatan: e.target.value })
                    }
                    placeholder="Catatan tambahan mengenai hafalan..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition duration-200 bg-white resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    * Isi catatan jika ada hal khusus yang perlu diperhatikan
                  </p>
                </div>

                {/* BUTTON - Sticky Bottom */}
                <div
                  className="flex gap-4 pt-4 border-t bg-white sticky bottom-0 pb-2"
                  style={{
                    position: "sticky",
                    bottom: 0,
                    backgroundColor: "white",
                    paddingTop: "1rem",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg 
                             hover:bg-gray-200 transition-colors font-medium
                             border border-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-900 text-white rounded-lg 
                             hover:bg-blue-800 transition-colors font-medium
                             shadow-md hover:shadow-lg"
                  >
                    {isEdit ? "Update Data Murajaah" : "Simpan Data Murajaah"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tambahkan CSS untuk animasi dan layer ordering */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95) translateY(-20px);
            opacity: 0;
          }
          to {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        body.modal-open {
          overflow: hidden;
          position: fixed;
          width: 100%;
          height: 100%;
        }

        .modal-backdrop {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 9998 !important;
        }

        /* Style untuk modal container */
        .modal-container {
          position: fixed !important;
          z-index: 9999 !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
