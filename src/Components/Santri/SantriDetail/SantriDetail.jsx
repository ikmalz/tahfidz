import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function SantriDetail({ santri, close, theme = "light" }) {
  const [hafalan, setHafalan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const loadHafalan = async () => {
      if (!santri?.id) {
        console.log("No santri ID provided");
        return;
      }

      console.log("Loading hafalan for santri ID:", santri.id);
      setLoading(true);
      
      try {
        // HANYA select kolom yang ada di database (tanpa keterangan)
        const { data, error } = await supabase
          .from("hafalan")
          .select("id, tanggal, surah, ayat_awal, ayat_akhir, status, created_at")
          .eq("santri_id", santri.id)
          .order("tanggal", { ascending: false });

        if (error) {
          console.error("Supabase error details:", error);
          alert(`Error loading hafalan: ${error.message}`);
        } else if (data) {
          console.log("Data loaded successfully, count:", data.length);
          setHafalan(data);
        } else {
          console.log("No data returned from query");
          setHafalan([]);
        }
      } catch (err) {
        console.error("Error loading hafalan:", err);
        alert("Terjadi kesalahan saat memuat data hafalan");
      } finally {
        setLoading(false);
      }
    };

    loadHafalan();
  }, [santri]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const hafalanStats = {
    total: hafalan.length,
    lastUpdate: hafalan.length > 0 ? hafalan[0].tanggal : null,
  };

  // Fungsi untuk ekspor PDF
  const exportToPDF = () => {
    try {
      if (hafalan.length === 0) {
        alert("Tidak ada data hafalan untuk diekspor");
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(8, 51, 88);
      doc.text("Laporan Hafalan Santri", pageWidth / 2, 15, { align: "center" });
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Santri: ${santri.nama}`, 14, 25);
      doc.text(`Kelas: ${santri.kelas || "-"}`, 14, 32);
      doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 39);
      
      // Statistik
      doc.setFontSize(10);
      doc.text(`Total Hafalan: ${hafalanStats.total}`, 14, 48);
      
      // Tabel hafalan
      const tableColumn = ["Tanggal", "Surah", "Ayat", "Status"];
      const tableRows = hafalan.map(h => [
        formatDate(h.tanggal),
        h.surah || "-",
        `${h.ayat_awal}-${h.ayat_akhir}`,
        h.status || "pending"
      ]);
      
      // Gunakan autoTable dari import yang benar
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [8, 51, 88],
          textColor: 255,
          fontStyle: "bold"
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });
      
      // Footer
      const finalY = doc.lastAutoTable?.finalY || 70;
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Dicetak dari Sistem Tahfidz - ${new Date().toLocaleString("id-ID")}`,
        pageWidth / 2,
        finalY + 10,
        { align: "center" }
      );
      
      // Save PDF
      doc.save(`hafalan-${santri.nama.replace(/\s+/g, "-").toLowerCase()}-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Gagal mengekspor PDF. Pastikan ada data hafalan.");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={close}
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp 0.2s ease" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white bg-blue-900">
              {santri.nama.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-800 leading-tight truncate mb-1">
                {santri.nama}
              </h3>
              <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                <span>Kelas: {santri.kelas || "-"}</span>
                <span>•</span>
                <span>Bergabung: {formatDate(santri.created_at)}</span>
              </div>
            </div>
          </div>
          <button 
            className="w-6 h-6 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded flex items-center justify-center transition-colors"
            onClick={close}
            title="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border-b border-gray-200 px-4">
          <button
            className={`flex-1 py-3 px-4 border-b-2 text-sm font-medium transition-colors ${
              activeTab === "info" 
                ? "text-blue-900 border-b-2 border-blue-900" 
                : "text-gray-500 border-transparent hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("info")}
          >
            Informasi
          </button>
          <button
            className={`flex-1 py-3 px-4 border-b-2 text-sm font-medium transition-colors relative ${
              activeTab === "hafalan" 
                ? "text-blue-900 border-b-2 border-blue-900" 
                : "text-gray-500 border-transparent hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("hafalan")}
          >
            Hafalan
            {hafalan.length > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-blue-900 text-white px-2 py-0.5 rounded-full min-w-[18px] text-center font-medium">
                {hafalan.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 text-sm">
          {activeTab === "info" ? (
            <div className="space-y-3">
              <div className="flex justify-between items-start py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600 min-w-[100px]">Nama Santri</span>
                <span className="text-gray-800 text-right break-words max-w-[250px]">{santri.nama}</span>
              </div>
              <div className="flex justify-between items-start py-3 border-b border-gray-200">
                <span className="font-medium text-gray-600 min-w-[100px]">Kelas</span>
                <span className="text-gray-800 text-right break-words max-w-[250px]">{santri.kelas || "-"}</span>
              </div>
              <div className="flex justify-between items-start py-3">
                <span className="font-medium text-gray-600 min-w-[100px]">Bergabung</span>
                <span className="text-gray-800 text-right break-words max-w-[250px]">{formatDateTime(santri.created_at)}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Hafalan Stats */}
              <div className="flex gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex-1 text-center">
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Total Hafalan</span>
                  <span className="block text-lg font-semibold text-blue-900">{hafalanStats.total}</span>
                </div>
                <div className="flex-1 text-center">
                  <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Terakhir Update</span>
                  <span className="block text-lg font-semibold text-gray-700">
                    {hafalanStats.lastUpdate ? formatDate(hafalanStats.lastUpdate) : "-"}
                  </span>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end mb-4">
                <button 
                  onClick={exportToPDF}
                  className={`px-4 py-2 text-sm font-medium rounded flex items-center gap-2 transition-colors ${
                    hafalan.length === 0 
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                      : "bg-blue-900 text-white hover:bg-blue-800"
                  }`}
                  title="Ekspor ke PDF"
                  disabled={hafalan.length === 0}
                >
                  <span>📄</span>
                  <span>Ekspor ke PDF</span>
                </button>
              </div>

              {/* Hafalan List */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-gray-800">Riwayat Hafalan</h4>
                  <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded font-medium">
                    {hafalan.length} hafalan
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                    <p className="text-sm text-gray-500">Memuat data hafalan...</p>
                  </div>
                ) : hafalan.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="text-2xl opacity-50 mb-2">📭</div>
                    <p className="text-sm text-gray-500 font-medium">Belum ada hafalan</p>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <div className="px-3 py-2 border-r border-gray-300">Tanggal</div>
                      <div className="px-3 py-2 border-r border-gray-300">Surah</div>
                      <div className="px-3 py-2 border-r border-gray-300">Ayat</div>
                      <div className="px-3 py-2">Status</div>
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                      {hafalan.map((h) => (
                        <div key={h.id} className="grid grid-cols-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                          <div className="px-3 py-2 border-r border-gray-200 text-xs text-gray-700 flex items-center min-h-8">
                            {formatDate(h.tanggal)}
                          </div>
                          <div className="px-3 py-2 border-r border-gray-200 text-xs text-gray-700 flex items-center min-h-8">
                            {h.surah || "-"}
                          </div>
                          <div className="px-3 py-2 border-r border-gray-200 text-xs text-gray-700 flex items-center min-h-8">
                            {h.ayat_awal}-{h.ayat_akhir}
                          </div>
                          <div className="px-3 py-2 text-xs flex items-center min-h-8">
                            <span className={`px-2 py-1 rounded text-xs font-medium text-center min-w-[60px] ${
                              h.status === "hafal" 
                                ? "bg-green-50 text-green-700 border border-green-200" 
                                : h.status === "setor" 
                                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                                  : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}>
                              {h.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 flex justify-end">
          <button 
            className="px-4 py-1.5 text-sm font-medium rounded border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 transition-colors"
            onClick={close}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}