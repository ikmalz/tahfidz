import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import DashboardLayout from "../Dashboard/DashboardLayout";

export default function GuruList() {
  const [guru, setGuru] = useState([]);
  const [form, setForm] = useState({
    id: null,
    nama: "",
    tanggal_bergabung: "",
    kontak: "",
    alamat: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const loadGuru = async () => {
    const { data, error } = await supabase
      .from("guru")
      .select("*")
      .order("nama", { ascending: true });

    if (!error) setGuru(data);
  };

  useEffect(() => {
    loadGuru();
  }, []);

  const openAddModal = () => {
    setIsEdit(false);
    setForm({
      id: null,
      nama: "",
      tanggal_bergabung: "",
      kontak: "",
      alamat: "",
    });
    setShowModal(true);
  };

  const openEditModal = (g) => {
    setIsEdit(true);
    setForm(g);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveGuru = async () => {
    if (isEdit) {
      await supabase
        .from("guru")
        .update({
          nama: form.nama,
          tanggal_bergabung: form.tanggal_bergabung,
          kontak: form.kontak,
          alamat: form.alamat,
        })
        .eq("id", form.id);
    } else {
      await supabase.from("guru").insert({
        nama: form.nama,
        tanggal_bergabung: form.tanggal_bergabung,
        kontak: form.kontak,
        alamat: form.alamat,
      });
    }

    setShowModal(false);
    loadGuru();
  };

  const deleteGuru = async (id) => {
    if (!window.confirm("Yakin hapus data guru?")) return;
    await supabase.from("guru").delete().eq("id", id);
    loadGuru();
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">👨‍🏫 Data Guru</h2>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            onClick={openAddModal}
          >
            + Tambah Guru
          </button>
        </div>

        {/* TABEL */}
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Bergabung</th>
                <th className="px-4 py-3">Kontak</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {guru.map((g) => (
                <tr key={g.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-4 py-3">{g.nama}</td>
                  <td className="px-4 py-3">{g.tanggal_bergabung}</td>
                  <td className="px-4 py-3">{g.kontak || "-"}</td>
                  <td className="px-4 py-3">{g.alamat || "-"}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                      onClick={() => openEditModal(g)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                      onClick={() => deleteGuru(g.id)}
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                {isEdit ? "Edit Guru" : "Tambah Guru"}
              </h3>

              <label className="block text-sm mb-1">Nama</label>
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                className="w-full p-2 mb-3 border rounded"
              />

              <label className="block text-sm mb-1">Tanggal Bergabung</label>
              <input
                type="date"
                name="tanggal_bergabung"
                value={form.tanggal_bergabung}
                onChange={handleChange}
                className="w-full p-2 mb-3 border rounded"
              />

              <label className="block text-sm mb-1">Kontak</label>
              <input
                type="text"
                name="kontak"
                value={form.kontak}
                onChange={handleChange}
                className="w-full p-2 mb-3 border rounded"
              />

              <label className="block text-sm mb-1">Alamat</label>
              <input
                type="text"
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                className="w-full p-2 mb-4 border rounded"
              />

              <div className="flex justify-between">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={saveGuru}
                >
                  {isEdit ? "Simpan" : "Tambah"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
