import React, { useState, useEffect } from "react";
import { X, Check, Edit3 } from "lucide-react";
import useMobileStore from "../../store/useMobileStore";
import { useLanguage } from "../../i18n/translations";

/**
 * EditItemModal
 * Allows patient to correct or refine an extracted entity (medicine dosage, timing, diagnosis text).
 */
export const EditItemModal = () => {
  const { editingEntity, setEditingEntity, updateMedicine, updateDiagnosis } =
    useMobileStore();
  const { isHindi } = useLanguage();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [schedule, setSchedule] = useState("");

  useEffect(() => {
    if (editingEntity) {
      if (editingEntity.type === "medicine") {
        setName(editingEntity.data.name || "");
        setDosage(editingEntity.data.dosage || "");
        setSchedule(editingEntity.data.schedule || "");
      } else if (editingEntity.type === "diagnosis") {
        setName(editingEntity.data.name || "");
      }
    }
  }, [editingEntity]);

  if (!editingEntity) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (editingEntity.type === "medicine") {
      updateMedicine(editingEntity.data.id, {
        name,
        dosage,
        schedule,
      });
    } else if (editingEntity.type === "diagnosis") {
      updateDiagnosis({
        name,
      });
    }
    setEditingEntity(null);
  };

  const isMedicine = editingEntity.type === "medicine";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150"
      onClick={() => setEditingEntity(null)}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {isMedicine
                  ? (isHindi ? "दवा संपादित करें" : "Edit Medication")
                  : (isHindi ? "निदान संपादित करें" : "Edit Diagnosis")}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isHindi ? "ओसीआर पठन सुधारें" : "Correct OCR reading"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingEntity(null)}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {isMedicine
                ? (isHindi ? "दवा का नाम व मात्रा" : "Medicine Name & Strength")
                : (isHindi ? "निदान शीर्षक" : "Diagnosis Title")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-12 px-3.5 rounded-xl border border-slate-300 text-sm font-semibold focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
              placeholder={isHindi ? "उदा. पैरासिटामोल 650 mg" : "e.g. Paracetamol 650 mg"}
            />
          </div>

          {isMedicine && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isHindi ? "खुराक" : "Dosage"}
                  </label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                    placeholder={isHindi ? "उदा. 650 mg" : "e.g. 650 mg"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    {isHindi ? "समय / अनुसूची" : "Schedule / Timing"}
                  </label>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 text-sm font-semibold focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-none"
                    placeholder={isHindi ? "उदा. दिन में दो बार" : "e.g. BD · Twice daily"}
                  />
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={() => setEditingEntity(null)}
              className="flex-1 min-h-[48px] rounded-xl border border-slate-300 font-bold text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="submit"
              className="flex-1 min-h-[48px] rounded-xl bg-[#006666] hover:bg-[#005454] active:bg-[#004747] text-white font-bold text-sm transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isHindi ? "सुधार सहेजें" : "Save Correction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
