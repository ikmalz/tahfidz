import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import DashboardLayout from "../Dashboard/DashboardLayout";

export default function MurajaahList() {
  const [data, setData] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [guru, setGuru] = useState([]);

  const [form, setForm] = useState({
    id: null,
    santri_id: "",
    tanggal: "",
    surah: "",
    ayat_awal: "",
    ayat_akhir: "",
    kualitas: "",
    catatan: "",
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

  const loadData = async () => {
    const { data, error } = await supabase
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
        santri:santri_id (id, nama)
      `
      )
      .order("tanggal", { ascending: false });

    if (!error) setData(data);
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
  }, []);

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

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-5">
          📖 Data Murajaah
        </h2>

        <button
          onClick={openAdd}
          className="mb-4 px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 transition"
        >
          + Tambah Murajaah
        </button>

        <div className="overflow-x-auto shadow rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-blue-900 text-white">
              <tr>
                <th className="px-4 py-3">Santri</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Surah</th>
                <th className="px-4 py-3">Ayat</th>
                <th className="px-4 py-3">Kualitas</th>
                <th className="px-4 py-3">Catatan</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, idx) => (
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
              ))}

              {data.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-5 text-gray-500 italic"
                  >
                    Belum ada data murajaah.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 
                  flex items-center justify-center animate-fadeIn"
        >
          <div className="bg-white w-[400px] p-6 rounded-xl shadow-xl animate-scaleIn">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">
              {isEdit ? "Edit Murajaah" : "Tambah Murajaah"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SANTRI */}
              <div>
                <label className="text-sm font-medium">Santri *</label>
                <select
                  value={form.santri_id}
                  onChange={(e) =>
                    setForm({ ...form, santri_id: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200"
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
                <label className="text-sm font-medium">Tanggal *</label>
                <input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) =>
                    setForm({ ...form, tanggal: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200"
                />
              </div>

              <label className="block text-sm mb-1">Guru</label>
              <select
                name="guru_id"
                value={form.guru_id}
                onChange={(e) => setForm({ ...form, guru_id: e.target.value })}
                className="w-full p-2 mb-3 border rounded"
              >
                <option value="">-- Pilih Guru --</option>
                {guru?.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nama}
                  </option>
                ))}
              </select>

              {/* SURAH */}
              <div>
                <label className="text-sm font-medium">Surah *</label>
                <input
                  type="text"
                  value={form.surah}
                  onChange={(e) => setForm({ ...form, surah: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200"
                />
              </div>

              {/* AYAT */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Ayat Awal</label>
                  <input
                    type="number"
                    value={form.ayat_awal}
                    onChange={(e) =>
                      setForm({ ...form, ayat_awal: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Ayat Akhir</label>
                  <input
                    type="number"
                    value={form.ayat_akhir}
                    onChange={(e) =>
                      setForm({ ...form, ayat_akhir: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* KUALITAS */}
              <div>
                <label className="text-sm font-medium">Kualitas</label>
                <input
                  type="text"
                  placeholder="Contoh: Baik / Kurang"
                  value={form.kualitas}
                  onChange={(e) =>
                    setForm({ ...form, kualitas: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:ring focus:ring-blue-200"
                />
              </div>

              {/* CATATAN */}
              <div>
                <label className="text-sm font-medium">Catatan</label>
                <textarea
                  value={form.catatan}
                  onChange={(e) =>
                    setForm({ ...form, catatan: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md h-20 resize-none focus:ring focus:ring-blue-200"
                />
              </div>

              {/* BUTTON */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
