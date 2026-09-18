import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Layers,
  Loader2,
  Search as SearchIcon,
  Sparkles,
} from "lucide-react";

import { semesters } from "../data/semesters";
import { supabase } from "../lib/supabase";

export default function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(initialQuery));
  const [error, setError] = useState("");

  useEffect(() => {
    const q = searchParams.get("q") || "";

    setQuery(q);

    if (q.trim()) {
      performSearch(q);
    } else {
      setResults([]);
      setSearched(false);
    }
  }, [searchParams]);

  /*
   * Get semester name
   */
  const getSemesterName = (semesterId) => {
    const semester = semesters.find(
      (item) => item.id === Number(semesterId)
    );

    return semester?.name || `Semester ${semesterId}`;
  };

  /*
   * Search everything
   */
  const performSearch = async (searchTerm) => {
    const cleanQuery = searchTerm.trim();

    if (!cleanQuery) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSearched(true);

      const pattern = `%${cleanQuery}%`;

      /*
       * Search all major content types together.
       */
      const [
        subjectsResponse,
        unitsResponse,
        resourcesResponse,
        pyqsResponse,
      ] = await Promise.all([
        /*
         * SUBJECTS
         */
        supabase
          .from("subjects")
          .select("*")
          .or(`name.ilike.${pattern},slug.ilike.${pattern}`),

        /*
         * UNITS
         */
        supabase
          .from("units")
          .select("*")
          .or(`title.ilike.${pattern},description.ilike.${pattern}`),

        /*
         * RESOURCES
         */
        supabase
          .from("resources")
          .select("*")
          .or(
            `title.ilike.${pattern},description.ilike.${pattern},resource_type.ilike.${pattern}`
          ),

        /*
         * PYQs
         */
        supabase
          .from("pyqs")
          .select("*")
          .or(`title.ilike.${pattern}`),
      ]);

      if (subjectsResponse.error) {
        throw new Error(subjectsResponse.error.message);
      }

      if (unitsResponse.error) {
        throw new Error(unitsResponse.error.message);
      }

      if (resourcesResponse.error) {
        throw new Error(resourcesResponse.error.message);
      }

      if (pyqsResponse.error) {
        throw new Error(pyqsResponse.error.message);
      }

      const subjects = subjectsResponse.data || [];
      const units = unitsResponse.data || [];
      const resources = resourcesResponse.data || [];
      const pyqs = pyqsResponse.data || [];

      /*
       * Get subject IDs needed by units.
       */
      const unitSubjectIds = [
        ...new Set(
          units
            .map((unit) => unit.subject_id)
            .filter(Boolean)
        ),
      ];

      /*
       * Get unit IDs needed by resources.
       */
      const resourceUnitIds = [
        ...new Set(
          resources
            .map((resource) => resource.unit_id)
            .filter(Boolean)
        ),
      ];

      /*
       * Fetch related subjects.
       */
      let relatedSubjects = [];

      if (unitSubjectIds.length > 0) {
        const { data, error: relatedSubjectError } =
          await supabase
            .from("subjects")
            .select("*")
            .in("id", unitSubjectIds);

        if (relatedSubjectError) {
          throw new Error(
            relatedSubjectError.message
          );
        }

        relatedSubjects = data || [];
      }

      /*
       * Fetch related units.
       */
      let relatedUnits = [];

      if (resourceUnitIds.length > 0) {
        const { data, error: relatedUnitError } =
          await supabase
            .from("units")
            .select("*")
            .in("id", resourceUnitIds);

        if (relatedUnitError) {
          throw new Error(
            relatedUnitError.message
          );
        }

        relatedUnits = data || [];
      }

      /*
       * SUBJECT RESULTS
       */
      const subjectResults = subjects.map(
        (subject) => ({
          id: `subject-${subject.id}`,
          type: "subject",
          title: subject.name,
          subtitle: `${getSemesterName(
            subject.semester_id
          )} • Subject`,
          description:
            "Explore units, study material and previous year papers.",
          icon: BookOpen,
          semesterId: subject.semester_id,
          action: () =>
            navigate(
              `/semester/${subject.semester_id}/subject/${subject.slug}`
            ),
          actionLabel: "Open Subject",
        })
      );

      /*
       * UNIT RESULTS
       */
      const unitResults = units.map((unit) => {
        const subject = relatedSubjects.find(
          (item) => item.id === unit.subject_id
        );

        return {
          id: `unit-${unit.id}`,
          type: "unit",
          title: unit.title,
          subtitle: subject
            ? `${getSemesterName(
                subject.semester_id
              )} • ${subject.name}`
            : "Unit",
          description:
            unit.description ||
            `Unit ${unit.unit_number}`,
          icon: Layers,
          action: () => {
            if (!subject) return;

            navigate(
              `/semester/${subject.semester_id}/subject/${subject.slug}/unit/${unit.unit_number}`
            );
          },
          actionLabel: "Open Unit",
        };
      });

      /*
       * RESOURCE RESULTS
       */
      const resourceResults = resources.map(
        (resource) => {
          const unit = relatedUnits.find(
            (item) => item.id === resource.unit_id
          );

          const subject = unit
            ? relatedSubjects.find(
                (item) =>
                  item.id === unit.subject_id
              )
            : null;

          return {
            id: `resource-${resource.id}`,
            type: "resource",
            title:
              resource.title ||
              "Study Material",
            subtitle: subject
              ? `${getSemesterName(
                  subject.semester_id
                )} • ${subject.name}`
              : "Study Material",
            description:
              resource.description ||
              formatResourceType(
                resource.resource_type
              ),
            icon: FileText,
            action: () => {
              if (resource.file_url) {
                window.open(
                  resource.file_url,
                  "_blank",
                  "noopener,noreferrer"
                );
              }
            },
            actionLabel: resource.file_url
              ? "Open PDF"
              : "Unavailable",
          };
        }
      );

      /*
       * PYQ RESULTS
       */
      const pyqResults = [];

      for (const paper of pyqs) {
        const { data: subject } =
          await supabase
            .from("subjects")
            .select("*")
            .eq("id", paper.subject_id)
            .maybeSingle();

        pyqResults.push({
          id: `pyq-${paper.id}`,
          type: "pyq",
          title:
            paper.title ||
            `${paper.year} Previous Year Paper`,
          subtitle: subject
            ? `${getSemesterName(
                subject.semester_id
              )} • ${subject.name}`
            : "Previous Year Paper",
          description: `AKTU question paper • ${paper.year}`,
          icon: FileText,
          action: () => {
            if (paper.file_url) {
              window.open(
                paper.file_url,
                "_blank",
                "noopener,noreferrer"
              );
            }
          },
          actionLabel: paper.file_url
            ? "Open PDF"
            : "Unavailable",
        });
      }

      /*
       * Put the results together.
       */
      setResults([
        ...subjectResults,
        ...unitResults,
        ...resourceResults,
        ...pyqResults,
      ]);
    } catch (err) {
      console.error("Search error:", err);

      setError(
        err.message ||
          "Something went wrong while searching."
      );

      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Submit search
   */
  const handleSearch = (event) => {
    event.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setSearchParams({});
      return;
    }

    setSearchParams({
      q: cleanQuery,
    });
  };

  /*
   * Search result colors
   */
  const gradients = {
    subject:
      "from-[#EEE7FF] via-[#F9F6FF] to-[#E4D9FF]",
    unit:
      "from-[#E9FAF3] via-[#F8FFFB] to-[#CDEEDC]",
    resource:
      "from-[#FFECEF] via-[#FFF8F9] to-[#FFD9E5]",
    pyq:
      "from-[#FFF7E3] via-[#FFFDF6] to-[#FFE7B5]",
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#fffdfb] px-4 py-10 sm:px-6 lg:px-10">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-32 top-32 h-80 w-80 rounded-full bg-[#EEE7FF] opacity-60 blur-3xl" />

        <div className="absolute right-0 top-[35%] h-80 w-80 rounded-full bg-[#FFECEF] opacity-50 blur-3xl" />

        <div className="absolute bottom-0 left-[35%] h-72 w-72 rounded-full bg-[#FFF4D8] opacity-50 blur-3xl" />

      </div>

      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-7 flex items-center gap-2 text-sm font-semibold text-[#706678] transition hover:-translate-x-1 hover:text-[#7046E8]"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* HERO */}
        <section className="relative overflow-hidden rounded-[32px] border border-[#eee7f5] bg-gradient-to-br from-[#EEE7FF] via-[#FFF9FC] to-[#FFE8EF] p-7 shadow-[0_20px_60px_rgba(91,61,122,0.08)] sm:p-10">

          <div className="relative z-10">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-bold tracking-wide text-[#7046E8] shadow-sm">
              <Sparkles size={14} />
              AKTU STUDY SEARCH
            </div>

            <h1 className="font-display text-4xl font-bold text-[#292330] sm:text-5xl">
              Find what you need
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756b7c] sm:text-base">
              Search subjects, units, study material and
              previous year question papers from one place.
            </p>

          </div>

          <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-white/60 blur-2xl" />

          <div className="pointer-events-none absolute -bottom-24 right-[18%] h-48 w-48 rounded-full bg-[#E7D9FF]/70 blur-3xl" />

        </section>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="relative z-10 mx-auto -mt-7 max-w-4xl"
        >
          <div className="flex items-center gap-3 rounded-[22px] border border-[#e5ddeb] bg-white p-2 shadow-[0_15px_45px_rgba(91,61,122,0.12)]">

            <SearchIcon
              size={21}
              className="ml-3 shrink-0 text-[#8f8498]"
            />

            <input
              id="global-search"
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              autoFocus
              placeholder="Search subjects, units, notes, PYQs..."
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm font-medium text-[#3d3545] outline-none placeholder:text-[#aaa1b0]"
            />

            <button
              type="submit"
              className="flex shrink-0 items-center gap-2 rounded-[15px] bg-gradient-to-r from-[#7046E8] to-[#B15AC8] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#7046E8]/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Search
              <ArrowRight size={16} />
            </button>

          </div>
        </form>

        {/* RESULTS */}
        <section className="mt-14 pb-16">

          {loading ? (
            <div className="rounded-[28px] border border-[#eee7f5] bg-white px-6 py-16 text-center shadow-sm">

              <Loader2
                size={34}
                className="mx-auto mb-4 animate-spin text-[#7046E8]"
              />

              <h2 className="font-display text-xl font-bold text-[#393141]">
                Searching...
              </h2>

              <p className="mt-2 text-sm text-[#8a8291]">
                Looking through subjects, units, resources and PYQs.
              </p>

            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-[#ffd0dc] bg-[#fff2f5] px-6 py-12 text-center">

              <h2 className="font-display text-xl font-bold text-[#c63768]">
                Search failed
              </h2>

              <p className="mt-2 text-sm text-[#8a8291]">
                {error}
              </p>

            </div>
          ) : !searched ? (
            <div className="rounded-[28px] border border-dashed border-[#ddd2e9] bg-white px-6 py-16 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#EEE7FF] text-[#7046E8]">
                <SearchIcon size={28} />
              </div>

              <h2 className="font-display text-2xl font-bold text-[#393141]">
                What are you looking for?
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#8a8291]">
                Search for a subject, unit, notes, expected
                questions or previous year paper.
              </p>

            </div>
          ) : results.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[#ddd2e9] bg-white px-6 py-16 text-center">

              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFECEF] text-[#E83E7A]">
                <SearchIcon size={28} />
              </div>

              <h2 className="font-display text-2xl font-bold text-[#393141]">
                No results found
              </h2>

              <p className="mt-2 text-sm text-[#8a8291]">
                Nothing matched{" "}
                <span className="font-bold text-[#7046E8]">
                  "{query}"
                </span>
                .
              </p>

            </div>
          ) : (
            <>
              <div className="mb-6 flex items-end justify-between">

                <div>
                  <div className="mb-2 text-sm font-bold tracking-wide text-[#7046E8]">
                    SEARCH RESULTS
                  </div>

                  <h2 className="font-display text-2xl font-bold text-[#302a38] sm:text-3xl">
                    Results for "{query}"
                  </h2>
                </div>

                <div className="rounded-2xl bg-[#FFF4D8] px-4 py-2 text-sm font-bold text-[#B77A0B]">
                  {results.length}
                </div>

              </div>

              <div className="space-y-4">

                {results.map((result) => {

                  const Icon = result.icon;

                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={result.action}
                      className={`group relative w-full overflow-hidden rounded-[25px] border border-white/80 bg-gradient-to-r ${
                        gradients[result.type]
                      } p-5 text-left shadow-[0_10px_30px_rgba(91,61,122,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(91,61,122,0.10)]`}
                    >

                      <div className="flex items-center gap-4">

                        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/80 p-3 shadow-sm">
                          <Icon
                            size={22}
                            className="text-[#7046E8]"
                          />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="mb-1 flex flex-wrap items-center gap-2">

                            <span className="font-display text-lg font-bold text-[#332c3b]">
                              {result.title}
                            </span>

                            <span className="rounded-full bg-white/70 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#7b7082]">
                              {result.type}
                            </span>

                          </div>

                          <p className="text-xs font-semibold text-[#817687]">
                            {result.subtitle}
                          </p>

                          <p className="mt-1 truncate text-sm text-[#756b7c]">
                            {result.description}
                          </p>

                        </div>

                        <div className="hidden shrink-0 items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold text-[#7046E8] sm:flex">
                          {result.actionLabel}
                          <ArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </div>

                        <ArrowRight
                          size={19}
                          className="shrink-0 text-[#7046E8] sm:hidden"
                        />

                      </div>

                    </button>
                  );
                })}

              </div>
            </>
          )}

        </section>

      </div>
    </main>
  );
}

/*
 * Convert database resource type into readable text.
 */
function formatResourceType(type) {
  if (type === "short_notes") {
    return "Short Notes";
  }

  if (type === "expected_questions") {
    return "Expected Questions";
  }

  if (type === "notes") {
    return "Complete Unit Notes";
  }

  return type || "Study Material";
}