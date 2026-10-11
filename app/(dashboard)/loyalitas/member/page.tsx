"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  Award,
  CreditCard,
  QrCode,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Sparkles,
  Phone,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { LoyaltyNav } from "@/components/loyalty/LoyaltyNav";
import { formatRupiah, formatTanggal } from "@/lib/format";
import {
  initialMemberBalances,
  MemberBalance,
  memberTiers,
  initialPointHistory,
  PointHistoryRecord,
} from "@/data/loyalty";

export default function LoyaltyMemberPage() {
  const { showToast } = useToast();

  const [members, setMembers] = useState<MemberBalance[]>(initialMemberBalances);
  const [pointHistory, setPointHistory] = useState<PointHistoryRecord[]>(initialPointHistory);

  // Filters
  const [filterTier, setFilterTier] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedMember, setSelectedMember] = useState<MemberBalance | null>(null);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchTier = filterTier === "Semua" || m.tier === filterTier;
      const matchSearch =
        !searchQuery ||
        m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.nomorKartu.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.telepon.includes(searchQuery);
      return matchTier && matchSearch;
    });
  }, [members, filterTier, searchQuery]);

  const memberHistory = useMemo(() => {
    if (!selectedMember) return [];
    return pointHistory.filter((h) => h.memberId === selectedMember.id);
  }, [pointHistory, selectedMember]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-[#C9772E]/10 text-[#C9772E]">
              <Users size={20} />
            </span>
            <h1 className="text-2xl font-bold text-[#1F2937]">Daftar Member & Riwayat Poin</h1>
          </div>
          <p className="text-sm text-[#6B7280]">
            Database member loyalti PawMart, tingkatan tier, dan riwayat mutasi perolehan poin anabul.
          </p>
        </div>
      </div>

      {/* Sub Nav */}
      <LoyaltyNav />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ECE8E1] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari nama member, no kartu, atau telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F5F1] rounded-xl text-xs border-none focus:outline-none focus:ring-2 focus:ring-[#C9772E]/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 bg-[#F7F5F1] rounded-xl text-xs font-semibold text-[#374151] border-none"
          >
            <option value="Semua">Semua Tingkat Tier</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
          </select>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-[#ECE8E1] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#6B7280] border-b border-[#ECE8E1]">
              <tr>
                <th className="py-3 px-4 font-semibold">No. Kartu Member</th>
                <th className="py-3 px-4 font-semibold">Nama Pelanggan</th>
                <th className="py-3 px-4 font-semibold">Tingkat Tier</th>
                <th className="py-3 px-4 font-semibold">Saldo Poin</th>
                <th className="py-3 px-4 font-semibold">Total Belanja Akumulasi</th>
                <th className="py-3 px-4 font-semibold">Tanggal Bergabung</th>
                <th className="py-3 px-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E1]">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="hover:bg-[#FDFBF9] cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#1F2937]">
                    {member.nomorKartu}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#1F2937] text-sm">{member.nama}</div>
                    <div className="text-[11px] text-[#6B7280]">{member.telepon}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${memberTiers[member.tier].badgeBg}`}
                    >
                      {member.tier}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-[#C9772E] text-sm">
                    {member.poin} Poin
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1F2937]">
                    {formatRupiah(member.totalBelanja)}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B7280]">
                    {formatTanggal(member.tanggalBergabung)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMember(member);
                      }}
                      className="text-xs py-1"
                    >
                      <Eye size={13} /> Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Member & Riwayat Poin */}
      {selectedMember && (
        <Modal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={`Profil Member: ${selectedMember.nama}`}
        >
          <div className="space-y-4">
            {/* Digital Card Replica */}
            <div
              className={`p-5 rounded-2xl text-white shadow-md relative overflow-hidden ${
                selectedMember.tier === "Gold"
                  ? "bg-gradient-to-r from-amber-600 to-amber-800"
                  : selectedMember.tier === "Silver"
                  ? "bg-gradient-to-r from-slate-600 to-slate-800"
                  : "bg-gradient-to-r from-[#8C471E] to-[#5C2E12]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/80 font-bold">
                    PawMart Club • {selectedMember.tier}
                  </div>
                  <h3 className="text-lg font-bold mt-0.5">{selectedMember.nama}</h3>
                  <div className="text-xs font-mono text-white/70">{selectedMember.nomorKartu}</div>
                </div>
                <QrCode size={36} className="text-white/90" />
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs">
                <div>
                  <span className="text-white/70 block text-[10px]">Saldo Poin Aktif</span>
                  <span className="text-lg font-extrabold text-amber-200">
                    {selectedMember.poin} POIN
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white/70 block text-[10px]">Total Belanja</span>
                  <span className="font-bold">{formatRupiah(selectedMember.totalBelanja)}</span>
                </div>
              </div>
            </div>

            {/* Riwayat Poin Table */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-[#1F2937] flex items-center gap-1.5">
                <Clock size={14} className="text-[#C9772E]" /> Riwayat Mutasi Poin
              </h4>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {memberHistory.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#9CA3AF] bg-[#F7F5F1] rounded-xl">
                    Belum ada riwayat poin tercatat untuk member ini.
                  </div>
                ) : (
                  memberHistory.map((item) => {
                    const isPositive = item.perubahan > 0;
                    return (
                      <div
                        key={item.id}
                        className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#ECE8E1] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#1F2937]">{item.keterangan}</div>
                          <div className="text-[10px] text-[#6B7280]">
                            {formatTanggal(item.tanggal)} • Saldo: {item.saldoAkhir} Poin
                          </div>
                        </div>

                        <span
                          className={`font-extrabold text-xs px-2 py-0.5 rounded-lg ${
                            isPositive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {isPositive ? `+${item.perubahan}` : item.perubahan} Poin
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#ECE8E1]">
              <Button variant="outline" onClick={() => setSelectedMember(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
