import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  FileText,
  Layers3,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import { semesters } from "../../data/semesters";
import { supabase } from "../../lib/supabase";

/* =========================================================
   RESOURCE TYPES
========================================================= */

const RESOURCE_TYPES = [
  {
    value: "notes",
    label: "Complete Unit Notes",
    shortLabel: "Complete Notes",
    icon: FileText,
    gradient: "from-[#EEE7FF] to-[#F8F4FF]",
    iconBg: "bg-[#7046E8]",
    iconColor: "text-[#7046E8]",
  },
  {
    value: "short_notes",
    label: "Short Notes",
    shortLabel: "Short Notes",
    icon: BookOpen,
    gradient: "from-[#FFF0F5] to-[#FFF8FA]",
    iconBg: "bg-[#E83E7A]",
    iconColor: "text-[#E83E7A]",
  },
  {
    value: "expected_questions",
    label: "Expected Questions",
    shortLabel: "Expected Questions",
    icon: FileQuestion,
    gradient: "from-[#ECFAF3] to-[#F7FFFB]",
    iconBg: "bg-[#249B68]",
    iconColor: "text-[#249B68]",
  },
];

/* =========================================================
   ADMIN RESOURCES
========================================================= */

function AdminResources() {
  const navigate = useNavigate();

  /* =======================================================
     FORM STATE
  ======================================================= */

  const [semesterId, setSemesterId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [unitId, setUnitId] = useState("");

  const [resourceType, setResourceType] = useState("notes");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [file, setFile] = useState(null);

  /* =======================================================
     DATABASE STATE

     IMPORTANT:
     Subjects now come directly from Supabase.
  ======================================================= */

  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [uploading, setUploading] = useState(false);

  /* =======================================================
     UI STATE
  ======================================================= */

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /* =======================================================
     SELECTED SEMESTER
  ======================================================= */

  const selectedSemester = useMemo(
    () =>
      semesters.find(
        (semester) =>
          String(semester.id) === String(semesterId),
      ),
    [semesterId],
  );

  /* =======================================================
     SELECTED SUBJECT

     This is now the REAL Supabase subject.
  ======================================================= */

  const selectedSubject = useMemo(
    () =>
      subjects.find(
        (subject) =>
          String(subject.id) === String(subjectId),
      ),
    [subjects, subjectId],
  );

  /* =======================================================
     SELECTED UNIT
  ======================================================= */

  const selectedUnit = useMemo(
    () =>
      units.find(
        (unit) =>
          String(unit.id) === String(unitId),
      ),
    [units, unitId],
  );

  /* =======================================================
     SELECTED RESOURCE TYPE
  ======================================================= */

  const selectedResourceType = RESOURCE_TYPES.find(
    (item) => item.value === resourceType,
  );

  /* =======================================================
     LOAD SUBJECTS WHEN SEMESTER CHANGES

     IMPORTANT:
     Do NOT use:
       selectedSemester.subjects

     We fetch the actual database subjects instead.
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadSubjects() {
      setSubjects([]);
      setUnits([]);
      setSubjectId("");
      setUnitId("");

      setMessage("");
      setError("");

      if (!semesterId) {
        setLoadingSubjects(false);
        return;
      }

      setLoadingSubjects(true);

      try {
        const {
          data,
          error: subjectsError,
        } = await supabase
          .from("subjects")
          .select("id, semester_id, name, slug")
          .eq(
            "semester_id",
            Number(semesterId),
          )
          .order("id", {
            ascending: true,
          });

        if (subjectsError) {
          throw subjectsError;
        }

        if (!cancelled) {
          setSubjects(data || []);
        }
      } catch (err) {
        console.error(
          "Loading subjects failed:",
          err,
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load subjects.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingSubjects(false);
        }
      }
    }

    loadSubjects();

    return () => {
      cancelled = true;
    };
  }, [semesterId]);

  /* =======================================================
     LOAD UNITS WHEN SUBJECT CHANGES

     IMPORTANT:
     selectedSubject.id is already the REAL DB ID.

     No second subject lookup is required.
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadUnits() {
      setUnits([]);
      setUnitId("");

      setMessage("");
      setError("");

      if (!selectedSubject) {
        setLoadingUnits(false);
        return;
      }

      setLoadingUnits(true);

      try {
        const {
          data,
          error: unitsError,
        } = await supabase
          .from("units")
          .select(
            "id, subject_id, unit_number, title, description",
          )
          .eq(
            "subject_id",
            selectedSubject.id,
          )
          .order("unit_number", {
            ascending: true,
          });

        if (unitsError) {
          throw unitsError;
        }

        if (!cancelled) {
          setUnits(data || []);
        }
      } catch (err) {
        console.error(
          "Loading units failed:",
          err,
        );

        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load units.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingUnits(false);
        }
      }
    }

    loadUnits();

    return () => {
      cancelled = true;
    };
  }, [selectedSubject]);

  /* =======================================================
     FILE SELECTION
  ======================================================= */

  const allowsTextFile = resourceType === "expected_questions";

  const acceptedFileTypes = allowsTextFile
    ? "application/pdf,.pdf,text/plain,.txt"
    : "application/pdf,.pdf";

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
       FILE TYPE VALIDATION

       Notes + Short Notes:
         PDF only

       Expected Questions:
         PDF + TXT
    --------------------------------------------------- */

    const fileName = selectedFile.name.toLowerCase();

    const isPdf =
      selectedFile.type === "application/pdf" ||
      fileName.endsWith(".pdf");

    const isTxt =
      selectedFile.type === "text/plain" ||
      fileName.endsWith(".txt");

    const isAllowed =
      allowsTextFile
        ? isPdf || isTxt
        : isPdf;

    if (!isAllowed) {
      setFile(null);

      setError(
        allowsTextFile
          ? "Please select a PDF or TXT file."
          : "Please select a PDF file only.",
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
        "The selected file must be smaller than 50 MB.",
      );

      event.target.value = "";

      return;
    }

    setFile(selectedFile);
  }

  /* =======================================================
     RESOURCE TYPE CHANGED

     Clear an already-selected file when switching between
     resource types so a PDF/TXT selection can never become
     invalid silently.
  ======================================================= */

  useEffect(() => {
    setFile(null);
    setMessage("");
    setError("");

    const input =
      document.getElementById(
        "resource-file",
      );

    if (input) {
      input.value = "";
    }
  }, [resourceType]);

  /* =======================================================
     REMOVE SELECTED FILE
  ======================================================= */

  function removeSelectedFile() {
    setFile(null);
    setMessage("");
    setError("");

    const input =
      document.getElementById(
        "resource-file",
      );

    if (input) {
      input.value = "";
    }
  }

  /* =======================================================
     UPLOAD RESOURCE
  ======================================================= */

  async function handleUpload(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    /* ---------------------------------------------------
       VALIDATE SEMESTER
    --------------------------------------------------- */

    if (!selectedSemester) {
      setError(
        "Please select a valid semester.",
      );

      return;
    }

    /* ---------------------------------------------------
       VALIDATE SUBJECT

       selectedSubject is now the actual
       Supabase subject.
    --------------------------------------------------- */

    if (!selectedSubject) {
      setError(
        "Please select a valid subject.",
      );

      return;
    }

    /* ---------------------------------------------------
       VALIDATE UNIT
    --------------------------------------------------- */

    if (!selectedUnit) {
      setError(
        "Please select a unit.",
      );

      return;
    }

    /* ---------------------------------------------------
       VALIDATE RESOURCE TYPE
    --------------------------------------------------- */

    if (!resourceType) {
      setError(
        "Please select a resource type.",
      );

      return;
    }

    /* ---------------------------------------------------
       VALIDATE FILE
    --------------------------------------------------- */

    if (!file) {
      setError(
        allowsTextFile
          ? "Please select a PDF or TXT file."
          : "Please select a PDF.",
      );

      return;
    }

    /* ---------------------------------------------------
       FINAL FILE TYPE CHECK
    --------------------------------------------------- */

    const uploadFileName =
      file.name.toLowerCase();

    const uploadIsPdf =
      file.type === "application/pdf" ||
      uploadFileName.endsWith(".pdf");

    const uploadIsTxt =
      file.type === "text/plain" ||
      uploadFileName.endsWith(".txt");

    if (
      allowsTextFile
        ? !uploadIsPdf && !uploadIsTxt
        : !uploadIsPdf
    ) {
      setError(
        allowsTextFile
          ? "Please select a PDF or TXT file."
          : "Please select a PDF file only.",
      );

      return;
    }

    setUploading(true);

    try {
      /* -------------------------------------------------
         CREATE SAFE SUBJECT FOLDER NAME
      ------------------------------------------------- */

      const safeSubjectName =
        selectedSubject.name
          .toLowerCase()
          .trim()
          .replace(/&/g, "and")
          .replace(
            /[^a-z0-9]+/g,
            "-",
          )
          .replace(
            /^-+|-+$/g,
            "");

      /*
        Example:

        3/
        technical-communication/
        unit-1/
        notes.pdf
      */

      const fileExtension =
        file.name
          .toLowerCase()
          .endsWith(".txt")
          ? "txt"
          : "pdf";

      const contentType =
        fileExtension === "txt"
          ? "text/plain"
          : "application/pdf";

      const filePath =
        `${selectedSemester.id}/` +
        `${safeSubjectName}/` +
        `unit-${selectedUnit.unit_number}/` +
        `${resourceType}.${fileExtension}`;

      /* -------------------------------------------------
         UPLOAD TO SUPABASE STORAGE
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
            contentType,
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

         Same unit + same resource type
         = replace existing resource.
      ------------------------------------------------- */

      const {
        error: deleteError,
      } = await supabase
        .from("resources")
        .delete()
        .eq(
          "unit_id",
          selectedUnit.id,
        )
        .eq(
          "resource_type",
          resourceType,
        );

      if (deleteError) {
        throw deleteError;
      }

      /* -------------------------------------------------
         DEFAULT TITLE
      ------------------------------------------------- */

      const resourceLabel =
        RESOURCE_TYPES.find(
          (item) =>
            item.value ===
            resourceType,
        )?.label ||
        "Study Resource";

      const finalTitle =
        title.trim() ||
        `${
          selectedUnit.title ||
          `Unit ${selectedUnit.unit_number}`
        } - ${resourceLabel}`;

      /* -------------------------------------------------
         INSERT DATABASE RECORD
      ------------------------------------------------- */

      const {
        error: insertError,
      } = await supabase
        .from("resources")
        .insert({
          unit_id:
            selectedUnit.id,

          resource_type:
            resourceType,

          title:
            finalTitle,

          description:
            description.trim() ||
            null,

          file_url:
            fileUrl,
        });

      if (insertError) {
        throw insertError;
      }

      /* -------------------------------------------------
         SUCCESS
      ------------------------------------------------- */

      setMessage(
        `${resourceLabel} uploaded successfully.`,
      );

      setTitle("");
      setDescription("");
      setFile(null);

      const fileInput =
        document.getElementById(
          "resource-file",
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(
        "Resource upload error:",
        err,
      );

      setError(
        err?.message ||
          "Resource upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  /* =======================================================
     FILE SIZE FORMATTER
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
     RENDER
  ======================================================= */

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffdfb]">
      {/* ===================================================
          BACKGROUND DECORATION
      =================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-24 h-64 w-64 rounded-full bg-[#DCCFFF]/25 blur-3xl sm:-left-40 sm:top-28 sm:h-[420px] sm:w-[420px]" />

        <div className="absolute -right-32 top-[40%] h-64 w-64 rounded-full bg-[#FFD7E5]/20 blur-3xl sm:-right-40 sm:h-[430px] sm:w-[430px]" />

        <div className="absolute -bottom-32 left-[30%] h-64 w-64 rounded-full bg-[#FFF0C9]/20 blur-3xl sm:-bottom-40 sm:left-[35%] sm:h-[400px] sm:w-[400px]" />
      </div>

      {/* ===================================================
          PAGE CONTAINER
      =================================================== */}

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
            HEADER
        ================================================= */}

        <div className="mb-6 sm:mb-8">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#7046E8] sm:text-[10px]">
            Admin Portal
          </p>

          <h1 className="mt-2 max-w-2xl font-display text-[30px] font-black leading-[1.05] tracking-[-0.05em] text-[#211A26] sm:text-4xl">
            Upload Study Resources
          </h1>

          <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[#817684] sm:text-sm sm:leading-6">
            Upload complete notes, short notes
            or expected questions for any unit.
          </p>
        </div>

        {/* =================================================
            MAIN FORM
        ================================================= */}

        <form
          onSubmit={handleUpload}
          className="rounded-[22px] border border-[#E9E1EC] bg-white p-4 shadow-[0_12px_40px_rgba(73,52,91,0.06)] sm:rounded-[30px] sm:p-6 lg:p-8"
        >
          {/* =================================================
              SELECTION AREA
          ================================================= */}

          <div>
            <div className="mb-4 sm:mb-5">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#7046E8] sm:text-[10px]">
                01 · Choose location
              </p>

              <h2 className="mt-1 font-display text-[19px] font-black text-[#211A26] sm:text-xl">
                Where should this resource go?
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
              {/* =================================================
                  SEMESTER
              ================================================= */}

              <div>
                <label
                  htmlFor="resource-semester"
                  className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs"
                >
                  Semester
                </label>

                <select
                  id="resource-semester"
                  value={semesterId}
                  onChange={(event) =>
                    setSemesterId(
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none transition focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] sm:h-12 sm:px-4 sm:text-sm"
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
              </div>

              {/* =================================================
                  SUBJECT
              ================================================= */}

              <div>
                <label
                  htmlFor="resource-subject"
                  className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs"
                >
                  Subject
                </label>

                <select
                  id="resource-subject"
                  value={subjectId}
                  onChange={(event) =>
                    setSubjectId(
                      event.target.value,
                    )
                  }
                  disabled={
                    !semesterId ||
                    loadingSubjects
                  }
                  className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none transition focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  <option value="">
                    {!semesterId
                      ? "Select semester first"
                      : loadingSubjects
                        ? "Loading subjects..."
                        : subjects.length === 0
                          ? "No subjects found"
                          : "Select subject"}
                  </option>

                  {subjects.map(
                    (subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                      </option>
                    ),
                  )}
                </select>

                {loadingSubjects && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#817684]">
                    <Loader2
                      size={12}
                      className="animate-spin"
                    />

                    Loading subjects from database...
                  </div>
                )}

                {!loadingSubjects &&
                  semesterId &&
                  subjects.length === 0 && (
                    <p className="mt-2 text-[10px] font-semibold leading-4 text-[#C53A3A]">
                      No subjects found for this
                      semester. Add the subject from
                      Manage Subjects first.
                    </p>
                  )}
              </div>

              {/* =================================================
                  UNIT
              ================================================= */}

              <div>
                <label
                  htmlFor="resource-unit"
                  className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs"
                >
                  <Layers3
                    size={13}
                    className="text-[#7046E8]"
                  />

                  Unit
                </label>

                <select
                  id="resource-unit"
                  value={unitId}
                  onChange={(event) =>
                    setUnitId(
                      event.target.value,
                    )
                  }
                  disabled={
                    !subjectId ||
                    loadingUnits
                  }
                  className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none transition focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
                >
                  <option value="">
                    {loadingUnits
                      ? "Loading units..."
                      : subjectId
                        ? units.length === 0
                          ? "No units found"
                          : "Select unit"
                        : "Select subject first"}
                  </option>

                  {units.map(
                    (unit) => (
                      <option
                        key={unit.id}
                        value={unit.id}
                      >
                        Unit {unit.unit_number}
                        {unit.title
                          ? ` · ${unit.title}`
                          : ""}
                      </option>
                    ),
                  )}
                </select>

                {loadingUnits && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#817684]">
                    <Loader2
                      size={12}
                      className="animate-spin"
                    />

                    Loading available units...
                  </div>
                )}

                {!loadingUnits &&
                  subjectId &&
                  units.length === 0 && (
                    <p className="mt-2 text-[10px] font-semibold leading-4 text-[#C53A3A]">
                      No units found for this subject.
                      Add units from Manage Units first.
                    </p>
                  )}
              </div>

              {/* =================================================
                  RESOURCE TYPE
              ================================================= */}

              <div>
                <label
                  htmlFor="resource-type"
                  className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs"
                >
                  Resource Type
                </label>

                <select
                  id="resource-type"
                  value={resourceType}
                  onChange={(event) =>
                    setResourceType(
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none transition focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] sm:px-4 sm:text-sm"
                >
                  {RESOURCE_TYPES.map(
                    (type) => (
                      <option
                        key={type.value}
                        value={type.value}
                      >
                        {type.label}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* =================================================
              SELECTED LOCATION PREVIEW
          ================================================= */}

          {selectedSemester &&
            selectedSubject &&
            selectedUnit && (
              <div className="mt-5 rounded-[17px] border border-[#E9E1EC] bg-gradient-to-r from-[#F8F4FF] via-white to-[#FFF5F8] p-3.5 sm:mt-6 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#EEE7FF] text-[#7046E8] sm:h-10 sm:w-10 sm:rounded-[13px]">
                    <Layers3 size={17} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#8F8395]">
                      Selected destination
                    </p>

                    <p className="mt-1 break-words text-[12px] font-extrabold leading-5 text-[#332B38] sm:text-sm">
                      {selectedSemester.name}
                      {" · "}
                      {selectedSubject.name}
                      {" · "}
                      Unit{" "}
                      {selectedUnit.unit_number}
                    </p>

                    {selectedUnit.title && (
                      <p className="mt-0.5 truncate text-[10px] font-medium text-[#817684] sm:text-xs">
                        {selectedUnit.title}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* =================================================
              RESOURCE TYPE VISUAL CARDS
          ================================================= */}

          <div className="mt-6 sm:mt-7">
            <div className="mb-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#E83E7A] sm:text-[10px]">
                02 · Resource
              </p>

              <h2 className="mt-1 font-display text-[19px] font-black text-[#211A26] sm:text-xl">
                What are you uploading?
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 sm:gap-3">
              {RESOURCE_TYPES.map(
                (type) => {
                  const Icon = type.icon;

                  const active =
                    resourceType ===
                    type.value;

                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setResourceType(
                          type.value,
                        )
                      }
                      className={`relative flex min-w-0 items-center gap-3 overflow-hidden rounded-[16px] border p-3 text-left transition duration-300 active:scale-[0.99] sm:block sm:rounded-[19px] sm:p-4 ${
                        active
                          ? `border-transparent bg-gradient-to-br ${type.gradient} shadow-[0_8px_25px_rgba(73,52,91,0.07)]`
                          : "border-[#E9E1EC] bg-white hover:bg-[#FCFAFD]"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] sm:h-10 sm:w-10 sm:rounded-[12px] ${
                          active
                            ? `${type.iconBg} text-white`
                            : "bg-[#F6F2F7] text-[#817684]"
                        }`}
                      >
                        <Icon size={17} />
                      </div>

                      <div className="min-w-0 sm:mt-3">
                        <p className="truncate text-[11px] font-extrabold text-[#332B38] sm:text-xs">
                          {type.shortLabel}
                        </p>

                        <p className="mt-0.5 hidden text-[10px] leading-4 text-[#817684] sm:block">
                          {type.label}
                        </p>
                      </div>

                      {active && (
                        <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#7046E8] sm:absolute sm:right-3 sm:top-3">
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* =================================================
              DETAILS
          ================================================= */}

          <div className="mt-6 border-t border-[#F0EBF1] pt-6 sm:mt-7 sm:pt-7">
            <div className="mb-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#E59A13] sm:text-[10px]">
                03 · Details
              </p>

              <h2 className="mt-1 font-display text-[19px] font-black text-[#211A26] sm:text-xl">
                Add some information
              </h2>
            </div>

            <div className="grid gap-4 sm:gap-5">
              {/* =================================================
                  TITLE
              ================================================= */}

              <div>
                <label
                  htmlFor="resource-title"
                  className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs"
                >
                  Title{" "}
                  <span className="font-medium normal-case text-[#9B909F]">
                    (optional)
                  </span>
                </label>

                <input
                  id="resource-title"
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Example: Unit 1 Complete Notes"
                  className="h-12 w-full rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 text-[13px] font-semibold text-[#332B38] outline-none placeholder:font-medium placeholder:text-[#A69BA8] focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] sm:px-4 sm:text-sm"
                />
              </div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div>
                <label
                  htmlFor="resource-description"
                  className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6D6270] sm:text-xs"
                >
                  Description{" "}
                  <span className="font-medium normal-case text-[#9B909F]">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="resource-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  rows={3}
                  placeholder="Short description about this resource..."
                  className="w-full resize-none rounded-[13px] border border-[#E4DCE8] bg-[#fffdfb] px-3.5 py-3 text-[13px] font-semibold leading-5 text-[#332B38] outline-none placeholder:font-medium placeholder:text-[#A69BA8] focus:border-[#B99AF5] focus:bg-white focus:ring-4 focus:ring-[#EEE7FF] sm:px-4 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <div className="mt-6 border-t border-[#F0EBF1] pt-6 sm:mt-7 sm:pt-7">
            <div className="mb-4">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#249B68] sm:text-[10px]">
                04 · FILE
              </p>

              <h2 className="mt-1 font-display text-[19px] font-black text-[#211A26] sm:text-xl">
                Choose your file
              </h2>
            </div>

            <label
              htmlFor="resource-file"
              className="group flex min-h-[170px] cursor-pointer flex-col items-center justify-center rounded-[19px] border border-dashed border-[#D8CCE1] bg-gradient-to-br from-[#F8F4FF] via-white to-[#FFF1F5] px-4 text-center transition duration-300 hover:border-[#A987ED] hover:shadow-[0_10px_30px_rgba(112,70,232,0.08)] active:scale-[0.995] sm:min-h-[190px] sm:rounded-[22px] sm:px-5"
            >
              <input
                id="resource-file"
                type="file"
                accept={acceptedFileTypes}
                onChange={
                  handleFileChange
                }
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-[#EEE7FF] text-[#7046E8] transition duration-300 group-hover:scale-105 sm:h-14 sm:w-14 sm:rounded-[17px]">
                <UploadCloud
                  size={22}
                  className="sm:h-[25px] sm:w-[25px]"
                />
              </div>

              <p className="mt-3 max-w-full truncate px-3 text-[12px] font-extrabold text-[#403747] sm:mt-4 sm:text-sm">
                {file
                  ? file.name
                  : allowsTextFile
                    ? "Click to choose a PDF or TXT"
                    : "Click to choose a PDF"}
              </p>

              <p className="mt-1 text-[10px] text-[#978B9B] sm:text-xs">
                {allowsTextFile
                  ? "PDF or TXT · Maximum 50 MB"
                  : "PDF only · Maximum 50 MB"}
              </p>
            </label>

            {/* =================================================
                SELECTED FILE
            ================================================= */}

            {file && (
              <div className="mt-3 flex min-w-0 items-center gap-3 rounded-[14px] bg-[#F5F1F7] px-3.5 py-3 sm:px-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-[#7046E8]">
                  <FileText size={15} />
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
              UPLOAD SUMMARY
          ================================================= */}

          {selectedUnit &&
            selectedResourceType && (
              <div className="mt-5 rounded-[16px] border border-[#E9E1EC] bg-[#FCFAFD] p-3.5 sm:p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${selectedResourceType.iconBg} text-white`}
                  >
                    <selectedResourceType.icon
                      size={17}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#978B9B]">
                      Ready to upload
                    </p>

                    <p className="mt-1 truncate text-[11px] font-extrabold text-[#332B38] sm:text-xs">
                      {selectedResourceType.label}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-[#817684]">
                      {selectedSubject?.name
                        ? `${selectedSubject.name} · `
                        : ""}
                      Unit{" "}
                      {selectedUnit.unit_number}
                      {selectedUnit.title
                        ? ` · ${selectedUnit.title}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* =================================================
              UPLOAD BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={
              uploading ||
              loadingSubjects ||
              loadingUnits ||
              !selectedSubject ||
              !selectedUnit
            }
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#7046E8] to-[#B15AC8] text-[13px] font-extrabold text-white shadow-[0_12px_28px_rgba(112,70,232,0.18)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(112,70,232,0.24)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:mt-6 sm:h-13 sm:text-sm"
          >
            {uploading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={18} />

                Upload Resource
              </>
            )}
          </button>

          {/* =================================================
              SMALL HELP TEXT
          ================================================= */}

          <p className="mt-3 text-center text-[9px] leading-4 text-[#9A8F9D] sm:text-[10px]">
            Uploading another resource of the same
            type for this unit will replace the existing
            database entry and uploaded file.
          </p>
        </form>
      </div>
    </main>
  );
}

export default AdminResources;