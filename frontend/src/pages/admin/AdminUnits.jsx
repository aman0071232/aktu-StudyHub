import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Edit3,
  Layers,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { semesters } from "../../data/semesters";
import { supabase } from "../../lib/supabase";

export default function AdminUnits() {
  const navigate = useNavigate();

  /* -----------------------------------------
     Selection
  ----------------------------------------- */

  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  /* -----------------------------------------
     Database subjects
  ----------------------------------------- */

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  /* -----------------------------------------
     Units
  ----------------------------------------- */

  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  /* -----------------------------------------
     Form / actions
  ----------------------------------------- */

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [unitNumber, setUnitNumber] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [description, setDescription] = useState("");

  /* -----------------------------------------
     Messages
  ----------------------------------------- */

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* -----------------------------------------
     Current semester
  ----------------------------------------- */

  const currentSemester = semesters.find(
    (semester) => semester.id === Number(selectedSemester),
  );

  /* -----------------------------------------
     Selected database subject
     
     IMPORTANT:
     This comes from Supabase now, not from
     semesters.js.
  ----------------------------------------- */

  const selectedSubjectData = subjects.find(
    (subject) => String(subject.id) === String(selectedSubject),
  );

  /* -----------------------------------------
     Clear messages
  ----------------------------------------- */

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /* =========================================
     FETCH SUBJECTS FROM SUPABASE
     
     This is the important fix.
     
     Previously AdminUnits used:
       currentSemester.subjects
     
     Now it uses:
       subjects table
     
     Therefore Semester 8 works automatically.
  ========================================== */

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedSemester) {
        setSubjects([]);
        setSelectedSubject("");
        return;
      }

      try {
        setLoadingSubjects(true);
        clearMessages();

        const { data, error: subjectsError } = await supabase
          .from("subjects")
          .select("id, semester_id, name, slug")
          .eq("semester_id", Number(selectedSemester))
          .order("id", { ascending: true });

        if (subjectsError) {
          throw new Error(subjectsError.message);
        }

        setSubjects(data || []);

        /*
         * If the currently selected subject does not
         * belong to the newly selected semester,
         * clear it.
         */
        if (
          selectedSubject &&
          !(data || []).some(
            (subject) =>
              String(subject.id) === String(selectedSubject),
          )
        ) {
          setSelectedSubject("");
          resetForm();
        }
      } catch (err) {
        console.error(err);
        setSubjects([]);
        setSelectedSubject("");
        setError(err.message || "Unable to load subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [selectedSemester]);

  /* =========================================
     FETCH UNITS WHEN SUBJECT CHANGES
  ========================================== */

  useEffect(() => {
    if (!selectedSubjectData) {
      setUnits([]);
      return;
    }

    fetchUnits();
  }, [selectedSubjectData?.id]);

  /* =========================================
     GET DATABASE SUBJECT
     
     No extra Supabase lookup is necessary.
     selectedSubjectData is already the actual
     database subject returned from Supabase.
  ========================================== */

  const getDatabaseSubject = () => {
    if (!selectedSubjectData) {
      throw new Error("Please select a subject.");
    }

    return selectedSubjectData;
  };

  /* =========================================
     FETCH UNITS
  ========================================== */

  const fetchUnits = async () => {
    try {
      clearMessages();
      setLoadingUnits(true);

      const subject = getDatabaseSubject();

      const { data, error: unitsError } = await supabase
        .from("units")
        .select("*")
        .eq("subject_id", subject.id)
        .order("unit_number", { ascending: true });

      if (unitsError) {
        throw new Error(unitsError.message);
      }

      setUnits(data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load units.");
      setUnits([]);
    } finally {
      setLoadingUnits(false);
    }
  };

  /* =========================================
     RESET FORM
  ========================================== */

  const resetForm = () => {
    setEditingId(null);
    setUnitNumber("");
    setUnitTitle("");
    setDescription("");
  };

  /* =========================================
     SCROLL TO EDITOR
  ========================================== */

  const scrollToEditor = () => {
    requestAnimationFrame(() => {
      document
        .getElementById("unit-editor")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  /* =========================================
     START EDITING
  ========================================== */

  const handleEdit = (unit) => {
    clearMessages();

    setEditingId(unit.id);
    setUnitNumber(String(unit.unit_number));
    setUnitTitle(unit.title || "");
    setDescription(unit.description || "");

    scrollToEditor();
  };

  /* =========================================
     NEW UNIT
  ========================================== */

  const handleNewUnit = () => {
    resetForm();
    clearMessages();

    if (selectedSemester && selectedSubject) {
      scrollToEditor();
    }
  };

  /* =========================================
     SAVE / UPDATE UNIT
  ========================================== */

  const handleSave = async (event) => {
    event.preventDefault();
    clearMessages();

    /* -----------------------------------------
       Validation
    ----------------------------------------- */

    if (!selectedSemester) {
      setError("Please select a semester.");
      return;
    }

    if (!selectedSubjectData) {
      setError("Please select a subject.");
      return;
    }

    if (!unitNumber) {
      setError("Please enter a unit number.");
      return;
    }

    if (!unitTitle.trim()) {
      setError("Please enter a unit title.");
      return;
    }

    const parsedUnitNumber = Number(unitNumber);

    if (
      !Number.isInteger(parsedUnitNumber) ||
      parsedUnitNumber < 1
    ) {
      setError("Unit number must be a positive whole number.");
      return;
    }

    try {
      setSaving(true);

      const subject = getDatabaseSubject();

      /* -----------------------------------------
         Prevent duplicate unit numbers
      ----------------------------------------- */

      const duplicate = units.find(
        (unit) =>
          Number(unit.unit_number) === parsedUnitNumber &&
          unit.id !== editingId,
      );

      if (duplicate) {
        setError(
          `Unit ${parsedUnitNumber} already exists for this subject.`,
        );
        return;
      }

      /* -----------------------------------------
         Unit data
      ----------------------------------------- */

      const unitData = {
        subject_id: subject.id,
        unit_number: parsedUnitNumber,
        title: unitTitle.trim(),
        description: description.trim() || null,
      };

      /* -----------------------------------------
         UPDATE
      ----------------------------------------- */

      if (editingId) {
        const { error: updateError } = await supabase
          .from("units")
          .update(unitData)
          .eq("id", editingId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        setMessage("Unit updated successfully.");
      } else {
        /* ---------------------------------------
           INSERT
        --------------------------------------- */

        const { error: insertError } = await supabase
          .from("units")
          .insert(unitData);

        if (insertError) {
          throw new Error(insertError.message);
        }

        setMessage("Unit added successfully.");
      }

      resetForm();
      await fetchUnits();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save unit.");
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE UNIT
  ========================================== */

  const handleDelete = async (unit) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Unit ${unit.unit_number} - "${unit.title}"?\n\nThis may also affect resources connected to this unit.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      clearMessages();
      setDeletingId(unit.id);

      const { error: deleteError } = await supabase
        .from("units")
        .delete()
        .eq("id", unit.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      if (editingId === unit.id) {
        resetForm();
      }

      setMessage("Unit deleted successfully.");

      await fetchUnits();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete this unit. Make sure it is not being used by resources.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =========================================
     UI
  ========================================== */

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fffdfb] px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ====================================== */}

        <div className="mb-6 flex flex-col gap-5 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">

            {/* Back */}

            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e9e0f8] bg-white text-[#7046E8] shadow-sm transition hover:-translate-x-1 hover:shadow-md sm:mt-0"
              title="Back to dashboard"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <Layers
                  size={17}
                  className="shrink-0 text-[#7046E8]"
                />

                <span className="text-xs font-bold tracking-wide text-[#7046E8] sm:text-sm">
                  ADMIN PANEL
                </span>
              </div>

              <h1 className="font-display text-2xl font-bold leading-tight text-[#272230] sm:text-4xl">
                Manage Units
              </h1>

              <p className="mt-1 max-w-xl text-xs leading-5 text-[#7d7488] sm:text-sm">
                Create and organize units for every subject.
              </p>
            </div>
          </div>

          {/* New Unit */}

          <button
            type="button"
            onClick={handleNewUnit}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7046E8] to-[#9B72F2] px-5 py-3 font-semibold text-white shadow-lg shadow-[#7046E8]/20 transition hover:-translate-y-1 hover:shadow-xl sm:w-auto"
          >
            <Plus size={19} />
            New Unit
          </button>
        </div>

        {/* =====================================
            SELECT SUBJECT CARD
        ====================================== */}

        <div className="mb-6 rounded-[24px] border border-[#eee7f5] bg-white p-4 shadow-[0_15px_45px_rgba(91,61,122,0.07)] sm:mb-7 sm:rounded-[28px] sm:p-7">

          {/* Card heading */}

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#EEE7FF] text-[#7046E8] sm:h-11 sm:w-11">
              <BookOpen size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-base font-bold text-[#302a38] sm:text-lg">
                Select Subject
              </h2>

              <p className="text-xs leading-5 text-[#8a8291] sm:text-sm">
                Choose where you want to manage units.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {/* ---------------------------------
                SEMESTER
            ---------------------------------- */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#403747]">
                Semester
              </label>

              <select
                value={selectedSemester}
                onChange={(e) => {
                  setSelectedSemester(e.target.value);
                  setSelectedSubject("");
                  setSubjects([]);
                  setUnits([]);
                  resetForm();
                  clearMessages();
                }}
                className="min-h-12 w-full rounded-2xl border border-[#e6dff0] bg-[#fcfaff] px-4 py-3 text-sm font-medium text-[#3d3545] outline-none transition focus:border-[#7046E8] focus:ring-4 focus:ring-[#7046E8]/10"
              >
                <option value="">
                  Select semester
                </option>

                {semesters.map((semester) => (
                  <option
                    key={semester.id}
                    value={semester.id}
                  >
                    {semester.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ---------------------------------
                SUBJECT
            ---------------------------------- */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#403747]">
                Subject
              </label>

              <select
                value={selectedSubject}
                disabled={
                  !selectedSemester || loadingSubjects
                }
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  resetForm();
                  clearMessages();
                }}
                className="min-h-12 w-full rounded-2xl border border-[#e6dff0] bg-[#fcfaff] px-4 py-3 text-sm font-medium text-[#3d3545] outline-none transition disabled:cursor-not-allowed disabled:opacity-50 focus:border-[#7046E8] focus:ring-4 focus:ring-[#7046E8]/10"
              >
                <option value="">
                  {loadingSubjects
                    ? "Loading subjects..."
                    : selectedSemester
                      ? "Select subject"
                      : "Select semester first"}
                </option>

                {subjects.map((subject) => (
                  <option
                    key={subject.id}
                    value={subject.id}
                  >
                    {subject.name}
                  </option>
                ))}
              </select>

              {/* Subject count */}

              {selectedSemester && !loadingSubjects && (
                <p className="mt-2 text-xs text-[#9a91a1]">
                  {subjects.length === 0
                    ? "No subjects found for this semester."
                    : `${subjects.length} subject${
                        subjects.length === 1 ? "" : "s"
                      } available`}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* =====================================
            SUCCESS MESSAGE
        ====================================== */}

        {message && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#bde8d2] bg-[#effcf5] px-4 py-3.5 text-sm font-semibold text-[#218653] sm:mb-6 sm:items-center sm:px-5 sm:py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7f6e5]">
              <Check size={17} />
            </div>

            <span>{message}</span>
          </div>
        )}

        {/* =====================================
            ERROR MESSAGE
        ====================================== */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-[#ffd0dc] bg-[#fff2f5] px-4 py-3.5 text-sm font-semibold text-[#c63768] sm:mb-6 sm:items-center sm:px-5 sm:py-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffe0e9]">
              <X size={17} />
            </div>

            <span className="break-words">
              {error}
            </span>
          </div>
        )}

        {/* =====================================
            NO SELECTION
        ====================================== */}

        {!selectedSemester || !selectedSubject ? (
          <div className="rounded-[24px] border border-[#eee7f5] bg-gradient-to-br from-[#EEE7FF] via-[#FFF8FC] to-[#FFF4DA] px-5 py-14 text-center shadow-[0_20px_50px_rgba(91,61,122,0.06)] sm:rounded-[30px] sm:px-6 sm:py-16">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md sm:h-16 sm:w-16 sm:rounded-3xl">
              <Layers
                size={26}
                className="text-[#7046E8]"
              />
            </div>

            <h2 className="font-display text-xl font-bold text-[#302a38] sm:text-2xl">
              {!selectedSemester
                ? "Select a semester to begin"
                : subjects.length === 0 && !loadingSubjects
                  ? "No subjects available"
                  : "Select a subject to begin"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7f7587]">
              {!selectedSemester
                ? "Choose a semester above to load its subjects."
                : subjects.length === 0 && !loadingSubjects
                  ? "Create a subject from Manage Subjects first, then return here to add its units."
                  : "Choose a subject above to view, create and edit its units."}
            </p>

            {/* Helpful button when semester has no subjects */}

            {selectedSemester &&
              subjects.length === 0 &&
              !loadingSubjects && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/admin/subjects")
                  }
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7046E8] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Plus size={17} />
                  Manage Subjects
                </button>
              )}
          </div>
        ) : (
          /* =====================================
             MAIN CONTENT
          ====================================== */

          <div className="grid gap-6 lg:grid-cols-[360px_1fr] lg:gap-7">

            {/* =================================
                FORM
            ================================== */}

            <div
              id="unit-editor"
              className="scroll-mt-5 rounded-[24px] border border-[#eee7f5] bg-white p-5 shadow-[0_15px_45px_rgba(91,61,122,0.07)] sm:rounded-[28px] sm:p-6 lg:sticky lg:top-5 lg:self-start"
            >
              <div className="mb-5 sm:mb-6">

                {/* Mode badge */}

                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#EEE7FF] px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#7046E8] sm:text-xs">
                  {editingId ? (
                    <>
                      <Edit3 size={13} />
                      EDITING UNIT
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      ADD UNIT
                    </>
                  )}
                </div>

                <h2 className="font-display text-xl font-bold text-[#302a38]">
                  {editingId
                    ? "Edit Unit"
                    : "Create New Unit"}
                </h2>

                <p className="mt-1 break-words text-sm leading-5 text-[#8a8291]">
                  {selectedSubjectData?.name}
                </p>
              </div>

              <form
                onSubmit={handleSave}
                className="space-y-4 sm:space-y-5"
              >

                {/* ---------------------------------
                    UNIT NUMBER
                ---------------------------------- */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#403747]">
                    Unit Number
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={unitNumber}
                    onChange={(e) =>
                      setUnitNumber(e.target.value)
                    }
                    placeholder="Example: 1"
                    inputMode="numeric"
                    className="min-h-12 w-full rounded-2xl border border-[#e6dff0] bg-[#fcfaff] px-4 py-3 text-sm outline-none transition focus:border-[#7046E8] focus:ring-4 focus:ring-[#7046E8]/10"
                  />
                </div>

                {/* ---------------------------------
                    UNIT TITLE
                ---------------------------------- */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#403747]">
                    Unit Title
                  </label>

                  <input
                    type="text"
                    value={unitTitle}
                    onChange={(e) =>
                      setUnitTitle(e.target.value)
                    }
                    placeholder="Example: Introduction to Communication"
                    className="min-h-12 w-full rounded-2xl border border-[#e6dff0] bg-[#fcfaff] px-4 py-3 text-sm outline-none transition focus:border-[#7046E8] focus:ring-4 focus:ring-[#7046E8]/10"
                  />
                </div>

                {/* ---------------------------------
                    DESCRIPTION
                ---------------------------------- */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#403747]">
                    Description
                    <span className="ml-1 font-normal text-[#aaa1b0]">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    placeholder="Brief description of this unit..."
                    rows={4}
                    className="w-full resize-none rounded-2xl border border-[#e6dff0] bg-[#fcfaff] px-4 py-3 text-sm outline-none transition focus:border-[#7046E8] focus:ring-4 focus:ring-[#7046E8]/10"
                  />
                </div>

                {/* ---------------------------------
                    BUTTONS
                ---------------------------------- */}

                <div
                  className={`grid gap-3 pt-1 ${
                    editingId
                      ? "grid-cols-1 sm:grid-cols-[1fr_auto]"
                      : "grid-cols-1"
                  }`}
                >
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7046E8] to-[#9B72F2] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#7046E8]/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                    ) : editingId ? (
                      <Save size={18} />
                    ) : (
                      <Plus size={18} />
                    )}

                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Unit"
                        : "Add Unit"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#e4ddeb] bg-white px-5 py-3 text-sm font-semibold text-[#6e6476] transition hover:bg-[#faf7fc]"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* =================================
                UNIT LIST
            ================================== */}

            <div className="min-w-0 rounded-[24px] border border-[#eee7f5] bg-white p-5 shadow-[0_15px_45px_rgba(91,61,122,0.07)] sm:rounded-[28px] sm:p-6">

              {/* List Header */}

              <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-[#302a38] sm:text-xl">
                    Existing Units
                  </h2>

                  <p className="mt-1 break-words text-xs leading-5 text-[#8a8291] sm:text-sm">
                    {selectedSubjectData?.name}
                  </p>
                </div>

                <div className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1D7] px-3 text-sm font-bold text-[#B77A0B]">
                  {units.length}
                </div>
              </div>

              {/* Loading */}

              {loadingUnits ? (
                <div className="flex min-h-[240px] items-center justify-center sm:min-h-[260px]">
                  <div className="text-center">
                    <Loader2
                      size={30}
                      className="mx-auto mb-3 animate-spin text-[#7046E8]"
                    />

                    <p className="text-sm font-medium text-[#857b8c]">
                      Loading units...
                    </p>
                  </div>
                </div>
              ) : units.length === 0 ? (
                /* ---------------------------------
                   EMPTY UNITS
                ---------------------------------- */

                <div className="rounded-3xl border border-dashed border-[#ddd2e9] bg-[#fcfaff] px-5 py-12 text-center sm:px-6 sm:py-14">

                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE7FF] text-[#7046E8]">
                    <Layers size={25} />
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#393141]">
                    No units yet
                  </h3>

                  <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#8a8291]">
                    Create the first unit using the
                    form above.
                  </p>

                  <button
                    type="button"
                    onClick={handleNewUnit}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7046E8] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Plus size={17} />
                    Add First Unit
                  </button>
                </div>
              ) : (
                /* ---------------------------------
                   UNITS
                ---------------------------------- */

                <div className="space-y-3 sm:space-y-4">
                  {units.map((unit, index) => (
                    <div
                      key={unit.id}
                      className={`group relative overflow-hidden rounded-[22px] border p-4 transition duration-300 sm:rounded-3xl sm:p-5 ${
                        editingId === unit.id
                          ? "border-[#cfc0f4] bg-gradient-to-r from-[#F5F0FF] via-white to-[#FFF8FC] shadow-md"
                          : "border-[#eee7f5] bg-gradient-to-r from-[#FFF9F2] via-white to-[#F8F4FF] hover:-translate-y-1 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex flex-col gap-4">

                        {/* Unit information */}

                        <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                          {/* Number */}

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EEE7FF] to-[#E4D8FF] font-display text-base font-bold text-[#7046E8] sm:h-12 sm:w-12 sm:text-lg">
                            {unit.unit_number}
                          </div>

                          {/* Content */}

                          <div className="min-w-0 flex-1">
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#a298aa] sm:text-xs">
                              Unit {unit.unit_number}
                            </div>

                            <h3 className="break-words font-display text-base font-bold leading-6 text-[#342d3c] sm:text-lg">
                              {unit.title}
                            </h3>

                            {unit.description && (
                              <p className="mt-1 line-clamp-3 text-xs leading-5 text-[#817687] sm:text-sm">
                                {unit.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}

                        <div className="grid grid-cols-2 gap-2 border-t border-[#eee7f5] pt-3 sm:flex sm:justify-end sm:border-t-0 sm:pt-0">

                          {/* Edit */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(unit)
                            }
                            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#e2d9ef] bg-white px-3 text-sm font-semibold text-[#7046E8] transition hover:bg-[#F7F3FF]"
                          >
                            <Edit3 size={16} />
                            Edit
                          </button>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(unit)
                            }
                            disabled={
                              deletingId === unit.id
                            }
                            className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#ffd7e2] bg-white px-3 text-sm font-semibold text-[#D43E70] transition hover:bg-[#FFF2F5] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === unit.id ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={16} />
                            )}

                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Decorative line */}

                      <div
                        className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#7046E8] via-[#E88BAE] to-[#F0C36A] transition ${
                          editingId === unit.id
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        }`}
                      />

                      {index === 0 && (
                        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#EEE7FF] opacity-40 blur-2xl" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}