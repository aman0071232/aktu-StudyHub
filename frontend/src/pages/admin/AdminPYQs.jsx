import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileQuestion,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { semesters } from "../../data/semesters";
import { supabase } from "../../lib/supabase";

/* =========================================================
   AVAILABLE YEARS
========================================================= */

const YEARS = [
  2025,
  2024,
  2023,
  2022,
  2021,
];

/* =========================================================
   YEAR STYLES
========================================================= */

const YEAR_STYLES = {
  2025: {
    gradient:
      "from-[#EEE7FF] to-[#F8F4FF]",
    badge:
      "bg-[#EEE7FF] text-[#7046E8]",
    icon:
      "bg-[#7046E8]",
  },

  2024: {
    gradient:
      "from-[#FFF0F5] to-[#FFF8FA]",
    badge:
      "bg-[#FFE4EC] text-[#D94C7B]",
    icon:
      "bg-[#E83E7A]",
  },

  2023: {
    gradient:
      "from-[#FFF7E3] to-[#FFFDF5]",
    badge:
      "bg-[#FFF0CA] text-[#B77800]",
    icon:
      "bg-[#E59A13]",
  },

  2022: {
    gradient:
      "from-[#ECFAF3] to-[#F7FFFB]",
    badge:
      "bg-[#DDF4E8] text-[#249B68]",
    icon:
      "bg-[#249B68]",
  },

  2021: {
    gradient:
      "from-[#FFF0EA] to-[#FFF8F5]",
    badge:
      "bg-[#FFE2D5] text-[#C66A42]",
    icon:
      "bg-[#D9794D]",
  },
};

/* =========================================================
   ADMIN PYQs
========================================================= */

function AdminPYQs() {
  const navigate = useNavigate();

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [semesterId, setSemesterId] =
    useState("");

  const [subjectId, setSubjectId] =
    useState("");

  const [year, setYear] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [file, setFile] =
    useState(null);

  /* =======================================================
     DATA STATE
  ======================================================= */

  const [pyqs, setPYQs] =
    useState([]);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [uploading, setUploading] =
    useState(false);

  const [loadingPYQs, setLoadingPYQs] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =======================================================
     SELECTED SEMESTER
  ======================================================= */

  const selectedSemester = useMemo(
    () =>
      semesters.find(
        (semester) =>
          String(semester.id) ===
          String(semesterId),
      ),
    [semesterId],
  );

  /* =======================================================
     SUBJECTS
  ======================================================= */

  const subjects =
    selectedSemester?.subjects || [];

  /* =======================================================
     SELECTED SUBJECT
  ======================================================= */

  const selectedSubject = useMemo(
    () =>
      subjects.find(
        (subject) =>
          subject.id === subjectId,
      ),
    [subjects, subjectId],
  );

  /* =======================================================
     SELECTED YEAR STYLE
  ======================================================= */

  const selectedYearStyle =
    YEAR_STYLES[year] ||
    YEAR_STYLES[2025];

  /* =======================================================
     SEMESTER CHANGED
  ======================================================= */

  useEffect(() => {
    setSubjectId("");
    setYear("");
    setFile(null);

    setMessage("");
    setError("");
  }, [semesterId]);

  /* =======================================================
     SUBJECT / YEAR CHANGED
  ======================================================= */

  useEffect(() => {
    setFile(null);
    setMessage("");
    setError("");
  }, [subjectId, year]);

  /* =======================================================
     LOAD PYQs
  ======================================================= */

  useEffect(() => {
    async function loadPYQs() {
      if (!semesterId) {
        setPYQs([]);
        return;
      }

      setLoadingPYQs(true);
      setError("");

      try {
        /* -------------------------------------------------
           GET SUBJECTS FROM SUPABASE
        ------------------------------------------------- */

        const {
          data: dbSubjects,
          error: subjectsError,
        } = await supabase
          .from("subjects")
          .select("id, name")
          .eq(
            "semester_id",
            Number(semesterId),
          )
          .order("name", {
            ascending: true,
          });

        if (subjectsError) {
          throw subjectsError;
        }

        if (!dbSubjects?.length) {
          setPYQs([]);
          return;
        }

        /* -------------------------------------------------
           GET PYQs
        ------------------------------------------------- */

        const subjectIds =
          dbSubjects.map(
            (subject) =>
              subject.id,
          );

        const {
          data: pyqData,
          error: pyqError,
        } = await supabase
          .from("pyqs")
          .select(
            "id, subject_id, year, title, file_url, created_at",
          )
          .in(
            "subject_id",
            subjectIds,
          )
          .order("year", {
            ascending: false,
          });

        if (pyqError) {
          throw pyqError;
        }

        /* -------------------------------------------------
           SUBJECT LOOKUP
        ------------------------------------------------- */

        const subjectMap =
          new Map(
            dbSubjects.map(
              (subject) => [
                subject.id,
                subject.name,
              ],
            ),
          );

        /* -------------------------------------------------
           FORMAT PYQs
        ------------------------------------------------- */

        const formattedPYQs =
          (pyqData || []).map(
            (pyq) => ({
              ...pyq,

              subjectName:
                subjectMap.get(
                  pyq.subject_id,
                ) ||
                "Unknown Subject",
            }),
          );

        setPYQs(
          formattedPYQs,
        );
      } catch (err) {
        console.error(
          "Load PYQs error:",
          err,
        );

        setError(
          err?.message ||
            "Could not load uploaded PYQs.",
        );
      } finally {
        setLoadingPYQs(false);
      }
    }

    loadPYQs();
  }, [semesterId]);

  /* =======================================================
     REFRESH PYQs
  ======================================================= */

  async function refreshPYQs() {
    if (!semesterId) {
      setPYQs([]);
      return;
    }

    try {
      const {
        data: dbSubjects,
        error: subjectsError,
      } = await supabase
        .from("subjects")
        .select("id, name")
        .eq(
          "semester_id",
          Number(semesterId),
        )
        .order("name", {
          ascending: true,
        });

      if (subjectsError) {
        throw subjectsError;
      }

      if (!dbSubjects?.length) {
        setPYQs([]);
        return;
      }

      const subjectIds =
        dbSubjects.map(
          (subject) =>
            subject.id,
        );

      const {
        data: pyqData,
        error: pyqError,
      } = await supabase
        .from("pyqs")
        .select(
          "id, subject_id, year, title, file_url, created_at",
        )
        .in(
          "subject_id",
          subjectIds,
        )
        .order("year", {
          ascending: false,
        });

      if (pyqError) {
        throw pyqError;
      }

      const subjectMap =
        new Map(
          dbSubjects.map(
            (subject) => [
              subject.id,
              subject.name,
            ],
          ),
        );

      setPYQs(
        (pyqData || []).map(
          (pyq) => ({
            ...pyq,

            subjectName:
              subjectMap.get(
                pyq.subject_id,
              ) ||
              "Unknown Subject",
          }),
        ),
      );
    } catch (err) {
      console.error(
        "Refresh PYQs error:",
        err,
      );

      setError(
        err?.message ||
          "Could not refresh PYQs.",
      );
    }
  }

  /* =======================================================
     FILE SELECTION
  ======================================================= */

  function handleFileChange(event) {
    const selectedFile =
      event.target.files?.[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    /* ---------------------------------------------------
       PDF ONLY
    --------------------------------------------------- */

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setFile(null);

      setError(
        "Please select a PDF file only.",
      );

      event.target.value = "";

      return;
    }

    /* ---------------------------------------------------
       50 MB MAXIMUM
    --------------------------------------------------- */

    if (
      selectedFile.size >
      50 * 1024 * 1024
    ) {
      setFile(null);

      setError(
        "The PDF must be smaller than 50 MB.",
      );

      event.target.value = "";

      return;
    }

    setFile(selectedFile);
  }

  /* =======================================================
     REMOVE SELECTED FILE
  ======================================================= */

  function removeSelectedFile() {
    setFile(null);
    setMessage("");
    setError("");

    const input =
      document.getElementById(
        "pyq-file",
      );

    if (input) {
      input.value = "";
    }
  }

  /* =======================================================
     UPLOAD PYQ
  ======================================================= */

  async function handleUpload(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    /* ---------------------------------------------------
       VALIDATE FORM
    --------------------------------------------------- */

    if (
      !selectedSemester ||
      !selectedSubject ||
      !year ||
      !file
    ) {
      setError(
        "Please select semester, subject, year and a PDF.",
      );

      return;
    }

    setUploading(true);

    try {
      /* -------------------------------------------------
         FIND REAL SUPABASE SUBJECT
      ------------------------------------------------- */

      const {
        data: dbSubject,
        error: subjectError,
      } = await supabase
        .from("subjects")
        .select("id, name")
        .eq(
          "semester_id",
          selectedSemester.id,
        )
        .eq(
          "name",
          selectedSubject.name,
        )
        .maybeSingle();

      if (subjectError) {
        throw subjectError;
      }

      if (!dbSubject) {
        throw new Error(
          "This subject does not exist in Supabase yet. Add the subject first.",
        );
      }

      /* -------------------------------------------------
         SAFE SUBJECT NAME
      ------------------------------------------------- */

      const safeSubjectName =
        selectedSubject.name
          .toLowerCase()
          .trim()
          .replace(
            /&/g,
            "and",
          )
          .replace(
            /[^a-z0-9]+/g,
            "-",
          )
          .replace(
            /^-+|-+$/g,
            "");

      /* -------------------------------------------------
         STORAGE PATH

         Example:
         3/
         technical-communication/
         pyqs/
         2025.pdf
      ------------------------------------------------- */

      const filePath =
        `${selectedSemester.id}/` +
        `${safeSubjectName}/` +
        `pyqs/${year}.pdf`;

      /* -------------------------------------------------
         REMOVE OLD STORAGE FILE

         Re-uploading the same subject/year replaces it.
      ------------------------------------------------- */

      const {
        error: removeError,
      } = await supabase.storage
        .from("study-material")
        .remove([
          filePath,
        ]);

      if (removeError) {
        console.warn(
          "Old PYQ file could not be removed:",
          removeError.message,
        );
      }

      /* -------------------------------------------------
         UPLOAD NEW PDF
      ------------------------------------------------- */

      const {
        error: uploadError,
      } = await supabase.storage
        .from("study-material")
        .upload(
          filePath,
          file,
          {
            cacheControl: "3600",
            contentType:
              "application/pdf",
            upsert: true,
          },
        );

      if (uploadError) {
        throw uploadError;
      }

      /* -------------------------------------------------
         GET PUBLIC URL
      ------------------------------------------------- */

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("study-material")
        .getPublicUrl(
          filePath,
        );

      const fileUrl =
        publicUrlData.publicUrl;

      /* -------------------------------------------------
         REMOVE OLD DATABASE RECORD
      ------------------------------------------------- */

      const {
        error: deleteRowError,
      } = await supabase
        .from("pyqs")
        .delete()
        .eq(
          "subject_id",
          dbSubject.id,
        )
        .eq(
          "year",
          Number(year),
        );

      if (deleteRowError) {
        throw deleteRowError;
      }

      /* -------------------------------------------------
         CREATE TITLE
      ------------------------------------------------- */

      const finalTitle =
        title.trim() ||
        `${selectedSubject.name} PYQ ${year}`;

      /* -------------------------------------------------
         INSERT DATABASE RECORD
      ------------------------------------------------- */

      const {
        error: insertError,
      } = await supabase
        .from("pyqs")
        .insert({
          subject_id:
            dbSubject.id,

          year: Number(year),

          title: finalTitle,

          file_url: fileUrl,
        });

      if (insertError) {
        throw insertError;
      }

      /* -------------------------------------------------
         SUCCESS
      ------------------------------------------------- */

      setMessage(
        `PYQ ${year} uploaded successfully.`,
      );

      setTitle("");
      setFile(null);

      const fileInput =
        document.getElementById(
          "pyq-file",
        );

      if (fileInput) {
        fileInput.value = "";
      }

      await refreshPYQs();
    } catch (err) {
      console.error(
        "PYQ upload error:",
        err,
      );

      setError(
        err?.message ||
          "PYQ upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  /* =======================================================
     GET STORAGE PATH
  ======================================================= */

  function getStoragePath(fileUrl) {
    if (!fileUrl) {
      return null;
    }

    const marker =
      "/storage/v1/object/public/study-material/";

    const markerIndex =
      fileUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return decodeURIComponent(
      fileUrl.substring(
        markerIndex +
          marker.length,
      ),
    );
  }

  /* =======================================================
     DELETE PYQ
  ======================================================= */

  async function handleDeletePYQ() {
    if (!deleteTarget) {
      return;
    }

    const target =
      deleteTarget;

    setDeletingId(target.id);
    setError("");
    setMessage("");

    try {
      const storagePath =
        getStoragePath(
          target.file_url,
        );

      /* -------------------------------------------------
         DELETE STORAGE FILE
      ------------------------------------------------- */

      if (storagePath) {
        const {
          error: storageError,
        } = await supabase.storage
          .from(
            "study-material",
          )
          .remove([
            storagePath,
          ]);

        if (storageError) {
          throw storageError;
        }
      }

      /* -------------------------------------------------
         DELETE DATABASE ROW
      ------------------------------------------------- */

      const {
        error: databaseError,
      } = await supabase
        .from("pyqs")
        .delete()
        .eq(
          "id",
          target.id,
        );

      if (databaseError) {
        throw databaseError;
      }

      /* -------------------------------------------------
         UPDATE UI
      ------------------------------------------------- */

      setPYQs((current) =>
        current.filter(
          (pyq) =>
            pyq.id !==
            target.id,
        ),
      );

      setDeleteTarget(null);

      setMessage(
        `${target.subjectName} ${target.year} PYQ deleted successfully.`,
      );
    } catch (err) {
      console.error(
        "Delete PYQ error:",
        err,
      );

      setError(
        err?.message ||
          "Could not delete this PYQ. Please check your permissions.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     FILE SIZE
  ======================================================= */

  function formatFileSize(bytes) {
    if (!bytes) {
      return "0 MB";
    }

    return `${(
      bytes /
      1024 /
      1024
    ).toFixed(2)} MB`;
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffdfb]">
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-24 h-64 w-64 rounded-full bg-[#DCCFFF]/25 blur-3xl sm:-left-40 sm:top-28 sm:h-[420px] sm:w-[420px]" />

        <div className="absolute -right-32 top-[35%] h-64 w-64 rounded-full bg-[#FFD7E5]/20 blur-3xl sm:-right-40 sm:h-[430px] sm:w-[430px]" />

        <div className="absolute -bottom-32 left-[30%] h-64 w-64 rounded-full bg-[#FFF0C9]/20 blur-3xl sm:-bottom-40 sm:left-[35%] sm:h-[400px] sm:w-[400px]" />
      </div>

      {/* =================================================
          CONTAINER
      ================================================= */}

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-24 sm:px-6 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-24">
        {/* =================================================
            BACK BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/dashboard",
            )
          }
          className="mb-5 inline-flex items-center gap-2 rounded-[11px] px-1 py-2 text-[12px] font-bold text-[#817684] transition hover:text-[#7046E8] active:scale-95 sm:mb-6 sm:text-sm"
        >
          <ArrowLeft
            size={15}
            className="sm:h-4 sm:w-4"
          />

          Back to Dashboard
        </button>

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="relative mb-6 overflow-hidden rounded-[22px] border border-[#E9E1EC] bg-gradient-to-br from-[#EEE7FF] via-white to-[#FFF0F5] p-5 shadow-[0_10px_35px_rgba(73,52,91,0.05)] sm:mb-8 sm:rounded-[28px] sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/60 blur-2xl sm:-right-20 sm:-top-20 sm:h-48 sm:w-48" />

          <div className="relative">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.13em] text-[#7046E8] shadow-sm sm:gap-2 sm:px-3 sm:text-[10px]">
              <Sparkles
                size={12}
                className="sm:h-[13px] sm:w-[13px]"
              />

              Admin Portal
            </div>

            <h1 className="mt-4 font-display text-[29px] font-black leading-[1.05] tracking-[-0.05em] text-[#211A26] sm:mt-5 sm:text-4xl">
              Upload Previous Year Paper
            </h1>

            <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[#817684] sm:text-sm sm:leading-6">
              Add 2025, 2024, 2023, 2022 or
              2021 question papers for any
              subject.
            </p>
          </div>
        </div>

        {/* =================================================
            UPLOAD FORM
        ================================================= */}

        <form
          onSubmit={handleUpload}
          className="rounded-[22px] border border-[#E9E1EC] bg-white p-4 shadow-[0_12px_40px_rgba(73,52,91,0.06)] sm:rounded-[30px] sm:p-6 lg:p-8"
        >
          {/* =================================================
              STEP 1
          ================================================= */}

          <div className="mb-5 sm:mb-6">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7046E8] sm:text-[10px]">
              01 · Paper details
            </p>

            <h2 className="mt-1 font-display text-[19px] font-black text-[#211A26] sm:text-xl">
              Select where this PYQ belongs
            </h2>

            <p className="mt-1 text-[11px] leading-5 text-[#817684] sm:text-xs">
              Choose the semester, subject and
              examination year.
            </p>
          </div>

          {/* =================================================
              SELECTORS
          ================================================= */}

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {/* SEMESTER */}

            <label className="block">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs">
                Semester
              </span>

              <select
                value={semesterId}
                onChange={(event) =>
                  setSemesterId(
                    event.target.value,
                  )
                }
                className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none transition focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] sm:px-4 sm:text-sm"
              >
                <option value="">
                  Select semester
                </option>

                {semesters.map(
                  (semester) => (
                    <option
                      key={
                        semester.id
                      }
                      value={
                        semester.id
                      }
                    >
                      {semester.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            {/* SUBJECT */}

            <label className="block">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs">
                Subject
              </span>

              <select
                value={subjectId}
                onChange={(event) =>
                  setSubjectId(
                    event.target.value,
                  )
                }
                disabled={!semesterId}
                className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none transition focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                <option value="">
                  {semesterId
                    ? "Select subject"
                    : "Select semester first"}
                </option>

                {subjects.map(
                  (subject) => (
                    <option
                      key={
                        subject.id
                      }
                      value={
                        subject.id
                      }
                    >
                      {subject.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            {/* YEAR */}

            <label className="block">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs">
                Year
              </span>

              <select
                value={year}
                onChange={(event) =>
                  setYear(
                    event.target.value,
                  )
                }
                disabled={!subjectId}
                className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none transition focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                <option value="">
                  {subjectId
                    ? "Select year"
                    : "Select subject first"}
                </option>

                {YEARS.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item} PYQ
                    </option>
                  ),
                )}
              </select>
            </label>

            {/* TITLE */}

            <label className="block">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs">
                Title{" "}
                <span className="font-medium normal-case text-[#9B909F]">
                  (optional)
                </span>
              </span>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder={
                  selectedSubject &&
                  year
                    ? `${selectedSubject.name} PYQ ${year}`
                    : "Example: Technical Communication PYQ 2025"
                }
                className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none placeholder:font-medium placeholder:text-[#A69BA8] focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] sm:px-4 sm:text-sm"
              />
            </label>
          </div>

          {/* =================================================
              SELECTED PAPER PREVIEW
          ================================================= */}

          {selectedSemester &&
            selectedSubject &&
            year && (
              <div
                className={`mt-5 overflow-hidden rounded-[17px] border border-transparent bg-gradient-to-br ${selectedYearStyle.gradient} p-3.5 sm:mt-6 sm:rounded-[20px] sm:p-4`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${selectedYearStyle.icon} text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-[14px]`}
                  >
                    <FileQuestion
                      size={18}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#817684]">
                      Selected paper
                    </p>

                    <p className="mt-1 truncate text-[12px] font-extrabold text-[#332B38] sm:text-sm">
                      {selectedSubject.name}
                    </p>

                    <p className="mt-0.5 text-[10px] font-semibold text-[#817684]">
                      {selectedSemester.name}
                      {" · "}
                      {year} Previous Year
                      Paper
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-extrabold ${selectedYearStyle.badge}`}
                  >
                    {year}
                  </span>
                </div>
              </div>
            )}

          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <div className="mt-6 border-t border-[#F0EBF1] pt-6 sm:mt-7 sm:pt-7">
            <div className="mb-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#249B68] sm:text-[10px]">
                02 · PDF
              </p>

              <h2 className="mt-1 font-display text-[19px] font-black text-[#211A26] sm:text-xl">
                Choose the question paper
              </h2>
            </div>

            <label
              htmlFor="pyq-file"
              className="group flex min-h-[165px] cursor-pointer flex-col items-center justify-center rounded-[19px] border border-dashed border-[#D8CCE1] bg-gradient-to-br from-[#F8F4FF] via-white to-[#FFF1F5] px-4 text-center transition duration-300 hover:border-[#A987ED] hover:shadow-[0_10px_30px_rgba(112,70,232,0.08)] active:scale-[0.995] sm:min-h-[185px] sm:rounded-[22px] sm:px-5"
            >
              <input
                id="pyq-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={
                  handleFileChange
                }
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#EEE7FF] text-[#7046E8] transition duration-300 group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-[17px]">
                {file ? (
                  <FileText
                    size={22}
                  />
                ) : (
                  <UploadCloud
                    size={22}
                  />
                )}
              </div>

              <p className="mt-3 max-w-full truncate px-3 text-[12px] font-extrabold text-[#403747] sm:mt-4 sm:text-sm">
                {file
                  ? file.name
                  : "Click to choose a PYQ PDF"}
              </p>

              <p className="mt-1 text-[10px] text-[#978B9B] sm:text-xs">
                PDF only · Maximum 50 MB
              </p>
            </label>

            {/* =================================================
                SELECTED FILE
            ================================================= */}

            {file && (
              <div className="mt-3 flex min-w-0 items-center gap-3 rounded-[14px] bg-[#F5F1F7] px-3.5 py-3 sm:px-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#7046E8]">
                  <FileText
                    size={16}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-[#655B69] sm:text-xs">
                    {file.name}
                  </p>

                  <p className="mt-0.5 text-[9px] text-[#978B9B] sm:text-[10px]">
                    {formatFileSize(
                      file.size,
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    removeSelectedFile
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[#9A8E9D] transition hover:bg-white hover:text-[#E83E7A] active:scale-95"
                  aria-label="Remove selected file"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-[14px] border border-[#FFD5D5] bg-[#FFF2F2] px-3.5 py-3 text-[12px] font-semibold leading-5 text-[#C53A3A] sm:px-4 sm:text-sm"
            >
              {error}
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {message && (
            <div
              role="status"
              className="mt-5 flex items-start gap-2.5 rounded-[14px] border border-[#CDEBDD] bg-[#EFFAF4] px-3.5 py-3 text-[12px] font-semibold leading-5 text-[#249B68] sm:items-center sm:px-4 sm:text-sm"
            >
              <CheckCircle2
                size={17}
                className="mt-0.5 shrink-0 sm:mt-0"
              />

              <span>{message}</span>
            </div>
          )}

          {/* =================================================
              UPLOAD BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={uploading}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#7046E8] to-[#B15AC8] text-[13px] font-extrabold text-white shadow-[0_12px_28px_rgba(112,70,232,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(112,70,232,0.24)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:h-13 sm:text-sm"
          >
            {uploading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Uploading PYQ...
              </>
            ) : (
              <>
                <UploadCloud
                  size={18}
                />

                Upload PYQ
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[9px] leading-4 text-[#9A8F9D] sm:text-[10px]">
            Uploading the same subject and year
            again will replace the existing PYQ.
          </p>
        </form>

        {/* =================================================
            UPLOADED PYQs
        ================================================= */}

        {semesterId && (
          <section className="mt-9 sm:mt-12">
            {/* =================================================
                SECTION HEADER
            ================================================= */}

            <div className="mb-5 sm:mb-6">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#B15AC8] sm:text-[10px]">
                Manage Papers
              </p>

              <div className="mt-1 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="font-display text-[25px] font-black tracking-[-0.04em] text-[#211A26] sm:text-3xl">
                    Uploaded PYQs
                  </h2>

                  <p className="mt-1 text-[11px] leading-5 text-[#817684] sm:text-sm">
                    {selectedSemester?.name}
                    {" · "}
                    {pyqs.length}{" "}
                    {pyqs.length === 1
                      ? "paper"
                      : "papers"}{" "}
                    uploaded
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#F5EDFF] text-[#B15AC8] sm:h-11 sm:w-11 sm:rounded-[14px]">
                  <FileQuestion
                    size={18}
                  />
                </div>
              </div>
            </div>

            {/* =================================================
                LOADING
            ================================================= */}

            {loadingPYQs && (
              <div className="flex min-h-[170px] items-center justify-center rounded-[20px] border border-[#E9E1EC] bg-white px-5 shadow-[0_10px_35px_rgba(73,52,91,0.04)] sm:min-h-[190px] sm:rounded-[24px]">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2
                    size={22}
                    className="animate-spin text-[#7046E8]"
                  />

                  <p className="text-[12px] font-semibold text-[#817684] sm:text-sm">
                    Loading uploaded PYQs...
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                EMPTY
            ================================================= */}

            {!loadingPYQs &&
              pyqs.length === 0 && (
                <div className="rounded-[20px] border border-dashed border-[#DED3E5] bg-gradient-to-br from-[#FBF8FF] to-[#FFF8FA] px-5 py-10 text-center sm:rounded-[24px] sm:px-6 sm:py-12">
                  <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-[16px] bg-[#EEE7FF] text-[#7046E8] sm:h-14 sm:w-14 sm:rounded-[17px]">
                    <FileText
                      size={23}
                      className="sm:h-[25px] sm:w-[25px]"
                    />
                  </div>

                  <h3 className="mt-4 text-[14px] font-extrabold text-[#403747] sm:text-base">
                    No PYQs uploaded yet
                  </h3>

                  <p className="mx-auto mt-1 max-w-md text-[11px] leading-5 text-[#8A7E8D] sm:text-sm sm:leading-6">
                    Upload a previous year paper
                    above and it will appear here.
                    You can open or delete it
                    anytime.
                  </p>
                </div>
              )}

            {/* =================================================
                PYQ CARDS
            ================================================= */}

            {!loadingPYQs &&
              pyqs.length > 0 && (
                <div className="grid gap-3 sm:gap-4">
                  {pyqs.map((pyq) => {
                    const yearStyle =
                      YEAR_STYLES[
                        pyq.year
                      ] ||
                      YEAR_STYLES[
                        2025
                      ];

                    return (
                      <article
                        key={pyq.id}
                        className="group overflow-hidden rounded-[19px] border border-[#E9E1EC] bg-white shadow-[0_8px_28px_rgba(73,52,91,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_40px_rgba(73,52,91,0.08)] sm:rounded-[22px]"
                      >
                        {/* =================================
                            CARD CONTENT
                        ================================= */}

                        <div className="p-4 sm:p-5">
                          <div className="flex min-w-0 items-start gap-3">
                            {/* ICON */}

                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] ${yearStyle.icon} text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-[14px]`}
                            >
                              <FileText
                                size={18}
                                className="sm:h-[21px] sm:w-[21px]"
                              />
                            </div>

                            {/* INFO */}

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-2">
                                <h3 className="min-w-0 flex-1 break-words text-[12px] font-extrabold leading-5 text-[#332B38] sm:text-base">
                                  {pyq.title ||
                                    `${pyq.subjectName} PYQ ${pyq.year}`}
                                </h3>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-extrabold ${yearStyle.badge} sm:px-2.5 sm:py-1 sm:text-[10px]`}
                                >
                                  {pyq.year}
                                </span>
                              </div>

                              <p className="mt-1 break-words text-[10px] font-semibold leading-4 text-[#8A7E8D] sm:text-xs">
                                {pyq.subjectName}
                              </p>
                            </div>
                          </div>

                          {/* =================================
                              ACTIONS
                          ================================= */}

                          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:flex sm:justify-end">
                            <a
                              href={
                                pyq.file_url
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-[11px] border border-[#E5DDF0] bg-[#FBF9FD] px-2 text-[10px] font-extrabold text-[#5F5364] transition hover:border-[#CBB5EF] hover:bg-[#F5F0FF] hover:text-[#7046E8] active:scale-[0.98] sm:h-10 sm:min-w-[120px] sm:gap-2 sm:px-3 sm:text-xs"
                            >
                              <ExternalLink
                                size={14}
                              />

                              <span>
                                Open PDF
                              </span>
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  pyq,
                                )
                              }
                              disabled={
                                deletingId ===
                                pyq.id
                              }
                              className="inline-flex h-10 min-w-0 items-center justify-center gap-1.5 rounded-[11px] border border-[#F4D6DF] bg-[#FFF8FA] px-2 text-[10px] font-extrabold text-[#D44A72] transition hover:border-[#EBAFC1] hover:bg-[#FFF0F4] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:min-w-[105px] sm:gap-2 sm:px-3 sm:text-xs"
                            >
                              <Trash2
                                size={14}
                              />

                              <span>
                                Delete
                              </span>
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
          </section>
        )}

        {/* =================================================
            BOTTOM NOTE
        ================================================= */}

        <div className="mt-8 rounded-[17px] border border-[#E9E1EC] bg-gradient-to-r from-[#F8F4FF] via-white to-[#FFF5F8] p-4 sm:mt-10 sm:rounded-[20px] sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#EEE7FF] text-[#7046E8]">
              <FileQuestion
                size={17}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-[#403747] sm:text-xs">
                PYQ management tip
              </p>

              <p className="mt-1 text-[10px] leading-4 text-[#817684] sm:text-xs sm:leading-5">
                Keep one paper for each subject and
                year. If you upload the same
                subject/year again, the previous
                paper will be replaced.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          DELETE CONFIRMATION MODAL
      ===================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#211A26]/40 px-4 py-5 backdrop-blur-sm sm:py-8">
          <div className="my-auto w-full max-w-md overflow-hidden rounded-[22px] border border-[#E9E1EC] bg-white shadow-[0_25px_80px_rgba(33,26,38,0.20)] sm:rounded-[26px]">
            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <div className="flex items-start justify-between gap-4 border-b border-[#F0EAF2] px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#FFF0F4] text-[#D44A72] sm:h-11 sm:w-11 sm:rounded-[14px]">
                  <Trash2
                    size={18}
                    className="sm:h-5 sm:w-5"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-[14px] font-black text-[#332B38] sm:text-base">
                    Delete PYQ?
                  </h3>

                  <p className="mt-0.5 text-[10px] leading-4 text-[#8A7E8D] sm:text-xs">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                disabled={Boolean(
                  deletingId,
                )}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] text-[#9A8E9D] transition hover:bg-[#F7F3F8] hover:text-[#514553] active:scale-95 disabled:opacity-50"
                aria-label="Close delete dialog"
              >
                <X size={17} />
              </button>
            </div>

            {/* ===============================================
                MODAL CONTENT
            =============================================== */}

            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <div className="rounded-[14px] bg-[#FAF7FB] px-3.5 py-3 sm:px-4">
                <p className="break-words text-[12px] font-extrabold leading-5 text-[#403747] sm:text-sm">
                  {
                    deleteTarget.subjectName
                  }
                </p>

                <p className="mt-1 break-words text-[10px] font-semibold leading-4 text-[#8A7E8D] sm:text-xs">
                  {
                    deleteTarget.year
                  }
                  {" · "}
                  {deleteTarget.title ||
                    "Previous Year Paper"}
                </p>
              </div>

              <p className="mt-4 text-[12px] leading-5 text-[#6F6472] sm:text-sm sm:leading-6">
                This will permanently delete the
                PDF from Storage and remove its PYQ
                record from the database.
              </p>
            </div>

            {/* ===============================================
                MODAL ACTIONS
            =============================================== */}

            <div className="flex flex-col-reverse gap-2 border-t border-[#F0EAF2] bg-[#FCFAFD] px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                disabled={Boolean(
                  deletingId,
                )}
                className="h-11 w-full rounded-[12px] border border-[#E4DCE8] bg-white px-5 text-[12px] font-extrabold text-[#655B69] transition hover:bg-[#F8F5F9] active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleDeletePYQ
                }
                disabled={Boolean(
                  deletingId,
                )}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#D44A72] px-5 text-[12px] font-extrabold text-white shadow-[0_8px_20px_rgba(212,74,114,0.16)] transition hover:-translate-y-0.5 hover:bg-[#C73E66] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-sm"
              >
                {deletingId ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />

                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={17}
                    />

                    Delete PYQ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminPYQs;