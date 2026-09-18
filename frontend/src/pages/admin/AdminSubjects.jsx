import { useEffect, useMemo, useState } from "react";
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
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { semesters } from "../../data/semesters";
import { supabase } from "../../lib/supabase";

/* =========================================================
   CARD GRADIENTS
========================================================= */

const SUBJECT_GRADIENTS = [
  "from-[#EEE7FF] to-[#F9F6FF]",
  "from-[#FFECEF] to-[#FFF8F9]",
  "from-[#FFF7E3] to-[#FFFDF6]",
  "from-[#E9FAF3] to-[#F8FFFB]",
  "from-[#F5ECFF] to-[#FFFAFE]",
  "from-[#EAF7FF] to-[#F8FCFF]",
];

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminSubjects() {
  const navigate = useNavigate();

  /* =======================================================
     STATE
  ======================================================= */

  const [selectedSemester, setSelectedSemester] =
    useState("");

  const [subjects, setSubjects] =
    useState([]);

  const [subjectName, setSubjectName] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [loadingSubjects, setLoadingSubjects] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     CURRENT SEMESTER
  ======================================================= */

  const currentSemester = useMemo(
    () =>
      semesters.find(
        (semester) =>
          semester.id ===
          Number(selectedSemester),
      ),
    [selectedSemester],
  );

  /* =======================================================
     CLEAR MESSAGES
  ======================================================= */

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /* =======================================================
     CREATE SLUG
  ======================================================= */

  const createSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {
    setEditingId(null);
    setSubjectName("");
  };

  /* =======================================================
     FETCH SUBJECTS
  ======================================================= */

  const fetchSubjects = async () => {
    if (!selectedSemester) {
      setSubjects([]);
      return;
    }

    try {
      setLoadingSubjects(true);
      clearMessages();

      const {
        data,
        error: subjectsError,
      } = await supabase
        .from("subjects")
        .select("*")
        .eq(
          "semester_id",
          Number(selectedSemester),
        )
        .order("id", {
          ascending: true,
        });

      if (subjectsError) {
        throw new Error(
          subjectsError.message,
        );
      }

      setSubjects(data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load subjects.",
      );

      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  /* =======================================================
     LOAD WHEN SEMESTER CHANGES
  ======================================================= */

  useEffect(() => {
    if (!selectedSemester) {
      setSubjects([]);
      resetForm();
      return;
    }

    fetchSubjects();
  }, [selectedSemester]);

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (subject) => {
    clearMessages();

    setEditingId(subject.id);
    setSubjectName(
      subject.name || "",
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SAVE SUBJECT
  ======================================================= */

  const handleSave = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!selectedSemester) {
      setError(
        "Please select a semester.",
      );
      return;
    }

    if (!subjectName.trim()) {
      setError(
        "Please enter a subject name.",
      );
      return;
    }

    const cleanName =
      subjectName.trim();

    const slug =
      createSlug(cleanName);

    if (!slug) {
      setError(
        "Please enter a valid subject name.",
      );
      return;
    }

    try {
      setSaving(true);

      /* ---------------------------------------------------
         DUPLICATE NAME
      --------------------------------------------------- */

      const duplicateName =
        subjects.find(
          (subject) =>
            subject.name
              .toLowerCase() ===
              cleanName.toLowerCase() &&
            subject.id !== editingId,
        );

      if (duplicateName) {
        setError(
          "A subject with this name already exists in this semester.",
        );
        return;
      }

      /* ---------------------------------------------------
         DUPLICATE SLUG
      --------------------------------------------------- */

      const duplicateSlug =
        subjects.find(
          (subject) =>
            subject.slug === slug &&
            subject.id !== editingId,
        );

      if (duplicateSlug) {
        setError(
          "A subject with this slug already exists in this semester.",
        );
        return;
      }

      const subjectData = {
        semester_id:
          Number(selectedSemester),

        name: cleanName,

        slug,
      };

      /* ---------------------------------------------------
         UPDATE
      --------------------------------------------------- */

      if (editingId) {
        const {
          error: updateError,
        } = await supabase
          .from("subjects")
          .update({
            name: subjectData.name,
            slug: subjectData.slug,
          })
          .eq(
            "id",
            editingId,
          );

        if (updateError) {
          throw new Error(
            updateError.message,
          );
        }

        setMessage(
          "Subject updated successfully.",
        );
      }

      /* ---------------------------------------------------
         INSERT
      --------------------------------------------------- */

      else {
        const {
          error: insertError,
        } = await supabase
          .from("subjects")
          .insert(
            subjectData,
          );

        if (insertError) {
          throw new Error(
            insertError.message,
          );
        }

        setMessage(
          "Subject added successfully.",
        );
      }

      resetForm();

      await fetchSubjects();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save subject.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     DELETE SUBJECT
  ======================================================= */

  const handleDelete = async (
    subject,
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${subject.name}"?\n\nIf this subject has units, resources or PYQs attached to it, Supabase may prevent the deletion.`,
      );

    if (!confirmed) {
      return;
    }

    try {
      clearMessages();

      setDeletingId(
        subject.id,
      );

      /* ---------------------------------------------------
         CHECK UNITS
      --------------------------------------------------- */

      const {
        count: unitCount,
        error: unitCheckError,
      } = await supabase
        .from("units")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq(
          "subject_id",
          subject.id,
        );

      if (unitCheckError) {
        throw new Error(
          unitCheckError.message,
        );
      }

      if (unitCount > 0) {
        setError(
          `Cannot delete "${subject.name}" because it has ${unitCount} unit(s). Delete its units first.`,
        );
        return;
      }

      /* ---------------------------------------------------
         CHECK PYQs
      --------------------------------------------------- */

      const {
        count: pyqCount,
        error: pyqCheckError,
      } = await supabase
        .from("pyqs")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq(
          "subject_id",
          subject.id,
        );

      if (pyqCheckError) {
        throw new Error(
          pyqCheckError.message,
        );
      }

      if (pyqCount > 0) {
        setError(
          `Cannot delete "${subject.name}" because it has ${pyqCount} previous-year paper(s).`,
        );
        return;
      }

      /* ---------------------------------------------------
         DELETE
      --------------------------------------------------- */

      const {
        error: deleteError,
      } = await supabase
        .from("subjects")
        .delete()
        .eq(
          "id",
          subject.id,
        );

      if (deleteError) {
        throw new Error(
          deleteError.message,
        );
      }

      if (
        editingId ===
        subject.id
      ) {
        resetForm();
      }

      setMessage(
        "Subject deleted successfully.",
      );

      await fetchSubjects();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to delete this subject.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffdfb]">
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-28 top-20 h-64 w-64 rounded-full bg-[#DCCFFF]/25 blur-3xl sm:-left-40 sm:top-24 sm:h-[420px] sm:w-[420px]" />

        <div className="absolute -right-32 top-[38%] h-64 w-64 rounded-full bg-[#FFD7E5]/20 blur-3xl sm:-right-40 sm:h-[430px] sm:w-[430px]" />

        <div className="absolute -bottom-32 left-[30%] h-64 w-64 rounded-full bg-[#FFF0C9]/20 blur-3xl sm:-bottom-40 sm:h-[400px] sm:w-[400px]" />
      </div>

      {/* =================================================
          CONTAINER
      ================================================= */}

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-10 lg:pb-24">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT */}

            <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
              {/* BACK */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/admin/dashboard",
                  )
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#E9E0F8] bg-white text-[#7046E8] shadow-sm transition duration-300 hover:-translate-x-1 hover:shadow-md active:scale-95 sm:h-11 sm:w-11 sm:rounded-2xl"
                title="Back to dashboard"
                aria-label="Back to dashboard"
              >
                <ArrowLeft
                  size={18}
                  className="sm:h-5 sm:w-5"
                />
              </button>

              {/* TITLE */}

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-1.5">
                  <BookOpen
                    size={15}
                    className="shrink-0 text-[#7046E8] sm:h-[18px] sm:w-[18px]"
                  />

                  <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7046E8] sm:text-sm sm:tracking-normal">
                    Admin Panel
                  </span>
                </div>

                <h1 className="font-display text-[28px] font-black leading-[1.05] tracking-[-0.05em] text-[#272230] sm:text-4xl">
                  Manage Subjects
                </h1>

                <p className="mt-1 max-w-xl text-[11px] leading-5 text-[#7D7488] sm:text-sm sm:leading-6">
                  Add, edit and organize subjects
                  for every semester.
                </p>
              </div>
            </div>

            {/* NEW SUBJECT */}

            <button
              type="button"
              onClick={() => {
                resetForm();
                clearMessages();

                if (
                  window.innerWidth <
                  640
                ) {
                  window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior:
                      "smooth",
                  });
                }
              }}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-gradient-to-r from-[#7046E8] to-[#9B72F2] px-5 text-[12px] font-extrabold text-white shadow-[0_10px_25px_rgba(112,70,232,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99] sm:h-12 sm:w-auto sm:rounded-2xl sm:text-sm"
            >
              <Plus size={17} />

              New Subject
            </button>
          </div>
        </header>

        {/* =================================================
            SEMESTER SELECT
        ================================================= */}

        <section className="mb-5 rounded-[21px] border border-[#EEE7F5] bg-white p-4 shadow-[0_12px_38px_rgba(91,61,122,0.06)] sm:mb-7 sm:rounded-[28px] sm:p-7">
          <div className="mb-4 flex items-center gap-3 sm:mb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EEE7FF] text-[#7046E8] sm:h-11 sm:w-11 sm:rounded-2xl">
              <Layers
                size={19}
                className="sm:h-[21px] sm:w-[21px]"
              />
            </div>

            <div className="min-w-0">
              <h2 className="font-display text-[16px] font-black text-[#302A38] sm:text-lg">
                Select Semester
              </h2>

              <p className="mt-0.5 text-[10px] leading-4 text-[#8A8291] sm:text-sm sm:leading-normal">
                Choose a semester to manage its
                subjects.
              </p>
            </div>
          </div>

          <select
            value={selectedSemester}
            onChange={(event) => {
              setSelectedSemester(
                event.target.value,
              );

              resetForm();
              clearMessages();
            }}
            className="h-12 w-full rounded-[13px] border border-[#E6DFF0] bg-[#FCFAFF] px-3.5 text-[12px] font-semibold text-[#3D3545] outline-none transition focus:border-[#7046E8] focus:bg-white focus:ring-4 focus:ring-[#7046E8]/10 sm:h-auto sm:rounded-2xl sm:px-4 sm:py-3.5 sm:text-sm"
          >
            <option value="">
              Select semester
            </option>

            {semesters.map(
              (semester) => (
                <option
                  key={semester.id}
                  value={semester.id}
                >
                  {semester.name}
                </option>
              ),
            )}
          </select>
        </section>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (
          <div className="mb-5 flex items-start gap-2.5 rounded-[15px] border border-[#BDE8D2] bg-[#EFFCF5] px-3.5 py-3.5 text-[11px] font-semibold leading-5 text-[#218653] sm:mb-6 sm:items-center sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D7F6E5]">
              <Check size={16} />
            </div>

            <span>{message}</span>
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-[15px] border border-[#FFD0DC] bg-[#FFF2F5] px-3.5 py-3.5 text-[11px] font-semibold leading-5 text-[#C63768] sm:mb-6 sm:items-center sm:gap-3 sm:rounded-2xl sm:px-5 sm:py-4 sm:text-sm">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFE0E9]">
              <X size={16} />
            </div>

            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            NO SEMESTER
        ================================================= */}

        {!selectedSemester ? (
          <div className="rounded-[22px] border border-[#EEE7F5] bg-gradient-to-br from-[#EEE7FF] via-[#FFF8FC] to-[#FFF4DA] px-5 py-12 text-center shadow-[0_18px_45px_rgba(91,61,122,0.05)] sm:rounded-[30px] sm:px-6 sm:py-16">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[17px] bg-white shadow-md sm:mb-5 sm:h-16 sm:w-16 sm:rounded-3xl">
              <BookOpen
                size={25}
                className="text-[#7046E8] sm:h-7 sm:w-7"
              />
            </div>

            <h2 className="font-display text-[20px] font-black tracking-[-0.03em] text-[#302A38] sm:text-2xl">
              Select a semester to begin
            </h2>

            <p className="mx-auto mt-2 max-w-md text-[11px] leading-5 text-[#7F7587] sm:text-sm sm:leading-6">
              Choose a semester above to view and
              manage all of its subjects.
            </p>
          </div>
        ) : (
          /* =================================================
             MAIN TWO COLUMN
          ================================================= */

          <div className="grid gap-5 lg:grid-cols-[380px_1fr] lg:gap-7">
            {/* =================================================
                CREATE / EDIT FORM
            ================================================= */}

            <section
              id="subject-editor"
              className="h-fit rounded-[22px] border border-[#EEE7F5] bg-white p-4 shadow-[0_12px_40px_rgba(91,61,122,0.06)] sm:rounded-[28px] sm:p-6"
            >
              {/* FORM HEADER */}

              <div className="mb-5 sm:mb-6">
                <div
                  className={`mb-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-extrabold tracking-[0.08em] ${
                    editingId
                      ? "bg-[#FFF0F5] text-[#D44A72]"
                      : "bg-[#EEE7FF] text-[#7046E8]"
                  } sm:px-3 sm:py-1.5 sm:text-xs`}
                >
                  {editingId ? (
                    <>
                      <Edit3 size={13} />
                      Editing Subject
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      Add Subject
                    </>
                  )}
                </div>

                <h2 className="font-display text-[20px] font-black tracking-[-0.03em] text-[#302A38] sm:text-xl">
                  {editingId
                    ? "Edit Subject"
                    : "Create New Subject"}
                </h2>

                <p className="mt-1 text-[11px] text-[#8A8291] sm:text-sm">
                  {currentSemester?.name}
                </p>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleSave}
                className="space-y-4 sm:space-y-5"
              >
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold text-[#403747] sm:text-sm">
                    Subject Name
                  </label>

                  <input
                    type="text"
                    value={subjectName}
                    onChange={(event) =>
                      setSubjectName(
                        event.target.value,
                      )
                    }
                    placeholder="Example: Data Structures"
                    className="h-12 w-full rounded-[13px] border border-[#E6DFF0] bg-[#FCFAFF] px-3.5 text-[12px] font-medium text-[#302A38] outline-none transition placeholder:text-[#AAA0B0] focus:border-[#7046E8] focus:bg-white focus:ring-4 focus:ring-[#7046E8]/10 sm:h-auto sm:rounded-2xl sm:px-4 sm:py-3.5 sm:text-sm"
                  />

                  {subjectName.trim() && (
                    <div className="mt-2 rounded-[10px] bg-[#F8F4FF] px-3 py-2 sm:rounded-xl">
                      <p className="break-all text-[9px] leading-4 text-[#948999] sm:text-xs">
                        Slug:{" "}
                        <span className="font-bold text-[#7046E8]">
                          {createSlug(
                            subjectName,
                          )}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* SAVE */}

                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-[13px] bg-gradient-to-r from-[#7046E8] to-[#9B72F2] px-4 text-[12px] font-extrabold text-white shadow-[0_10px_25px_rgba(112,70,232,0.17)] transition duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-auto sm:rounded-2xl sm:py-3.5 sm:text-sm"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : editingId ? (
                    <Save size={17} />
                  ) : (
                    <Plus size={17} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Subject"
                      : "Add Subject"}
                </button>

                {/* CANCEL */}

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-[13px] border border-[#E4DDEB] bg-white px-4 text-[12px] font-bold text-[#6E6476] transition hover:bg-[#FAF7FC] active:scale-[0.99] sm:h-auto sm:rounded-2xl sm:py-3.5 sm:text-sm"
                  >
                    <X size={17} />

                    Cancel Editing
                  </button>
                )}
              </form>

              {/* SMALL HELP */}

              <div className="mt-5 rounded-[14px] bg-gradient-to-br from-[#F8F4FF] to-[#FFF7FA] p-3.5 sm:mt-6 sm:rounded-2xl sm:p-4">
                <div className="flex items-start gap-2.5">
                  <Sparkles
                    size={15}
                    className="mt-0.5 shrink-0 text-[#B15AC8]"
                  />

                  <p className="text-[9px] leading-4 text-[#827787] sm:text-[10px] sm:leading-5">
                    Subject names automatically get a
                    clean URL slug. Keep names clear and
                    consistent across semesters.
                  </p>
                </div>
              </div>
            </section>

            {/* =================================================
                SUBJECT LIST
            ================================================= */}

            <section className="min-w-0 rounded-[22px] border border-[#EEE7F5] bg-white p-4 shadow-[0_12px_40px_rgba(91,61,122,0.06)] sm:rounded-[28px] sm:p-6">
              {/* LIST HEADER */}

              <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
                <div className="min-w-0">
                  <h2 className="font-display text-[19px] font-black tracking-[-0.03em] text-[#302A38] sm:text-xl">
                    Existing Subjects
                  </h2>

                  <p className="mt-1 truncate text-[10px] text-[#8A8291] sm:text-sm">
                    {currentSemester?.name}
                  </p>
                </div>

                <div className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#FFF4D8] px-2.5 text-[11px] font-extrabold text-[#B77A0B] sm:h-10 sm:min-w-10 sm:rounded-xl sm:px-3 sm:text-sm">
                  {subjects.length}
                </div>
              </div>

              {/* =================================================
                  LOADING
              ================================================= */}

              {loadingSubjects ? (
                <div className="flex min-h-[220px] items-center justify-center sm:min-h-[280px]">
                  <div className="text-center">
                    <Loader2
                      size={27}
                      className="mx-auto mb-3 animate-spin text-[#7046E8]"
                    />

                    <p className="text-[11px] font-semibold text-[#857B8C] sm:text-sm">
                      Loading subjects...
                    </p>
                  </div>
                </div>
              ) : subjects.length === 0 ? (
                /* =================================================
                   EMPTY
                ================================================= */

                <div className="rounded-[18px] border border-dashed border-[#DDD2E9] bg-[#FCFAFF] px-5 py-10 text-center sm:rounded-3xl sm:px-6 sm:py-14">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EEE7FF] text-[#7046E8] sm:h-14 sm:w-14 sm:rounded-2xl">
                    <BookOpen
                      size={22}
                      className="sm:h-[25px] sm:w-[25px]"
                    />
                  </div>

                  <h3 className="font-display text-[15px] font-black text-[#393141] sm:text-lg">
                    No subjects found
                  </h3>

                  <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-[#8A8291] sm:text-sm sm:leading-6">
                    Add the first subject using the form.
                  </p>
                </div>
              ) : (
                /* =================================================
                   SUBJECTS
                ================================================= */

                <div className="space-y-3">
                  {subjects.map(
                    (
                      subject,
                      index,
                    ) => {
                      const gradient =
                        SUBJECT_GRADIENTS[
                          index %
                            SUBJECT_GRADIENTS.length
                        ];

                      const isDeleting =
                        deletingId ===
                        subject.id;

                      const isEditing =
                        editingId ===
                        subject.id;

                      return (
                        <article
                          key={
                            subject.id
                          }
                          className={`group relative overflow-hidden rounded-[17px] border bg-gradient-to-r ${gradient} p-3.5 transition duration-300 sm:rounded-2xl sm:p-4 ${
                            isEditing
                              ? "border-[#BCA4F3] shadow-[0_8px_25px_rgba(112,70,232,0.10)]"
                              : "border-[#EEE7F5] hover:-translate-y-0.5 hover:shadow-md"
                          }`}
                        >
                          {/* =================================================
                              SUBJECT INFO
                          ================================================= */}

                          <div className="flex min-w-0 items-start gap-3">
                            {/* NUMBER */}

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white/80 text-[11px] font-black text-[#7046E8] shadow-sm sm:h-11 sm:w-11 sm:rounded-xl sm:text-sm">
                              {index +
                                1}
                            </div>

                            {/* TEXT */}

                            <div className="min-w-0 flex-1 pt-0.5">
                              <h3 className="break-words font-display text-[13px] font-black leading-5 text-[#342D3C] sm:text-lg sm:leading-6">
                                {
                                  subject.name
                                }
                              </h3>

                              <p className="mt-0.5 break-all text-[9px] leading-4 text-[#958B9C] sm:text-xs">
                                {
                                  subject.slug
                                }
                              </p>
                            </div>
                          </div>

                          {/* =================================================
                              ACTIONS
                          ================================================= */}

                          <div className="mt-3 grid grid-cols-2 gap-2 sm:absolute sm:right-4 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2 sm:flex">
                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  subject,
                                )
                              }
                              className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#E2D9EF] bg-white px-3 text-[10px] font-extrabold text-[#7046E8] transition hover:bg-[#F7F3FF] active:scale-[0.98] sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                            >
                              <Edit3
                                size={
                                  14
                                }
                                className="sm:h-4 sm:w-4"
                              />

                              <span>
                                Edit
                              </span>
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  subject,
                                )
                              }
                              disabled={
                                isDeleting
                              }
                              className="flex h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#FFD7E2] bg-white px-3 text-[10px] font-extrabold text-[#D43E70] transition hover:bg-[#FFF2F5] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:rounded-xl sm:px-3 sm:text-sm"
                            >
                              {isDeleting ? (
                                <Loader2
                                  size={
                                    14
                                  }
                                  className="animate-spin sm:h-4 sm:w-4"
                                />
                              ) : (
                                <Trash2
                                  size={
                                    14
                                  }
                                  className="sm:h-4 sm:w-4"
                                />
                              )}

                              <span>
                                Delete
                              </span>
                            </button>
                          </div>

                          {/* BOTTOM ACCENT */}

                          <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-[#7046E8] via-[#E88BAE] to-[#F0C36A] opacity-0 transition duration-300 group-hover:opacity-100" />
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}