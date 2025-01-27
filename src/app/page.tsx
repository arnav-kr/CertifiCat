"use client";
import Notice from "@/components/Notice";
import { getPrograms } from "@/lib/firebase/firestore";
import { formatProgramName } from "@/lib/helpers";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  LoaderCircleIcon,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
// client side query params nextjs 15
import { useSearchParams } from "next/navigation";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Home() {
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [programs, setPrograms] = useState<string[]>([]);
  const userDetails = useRef<{ user_id: string; program: string } | null>(null);
  const searchParams = useSearchParams();
  const userInputRef = useRef<HTMLInputElement>(null);
  const programSelectRef = useRef<HTMLSelectElement>(null);

  const id = searchParams.get("id");
  const program = searchParams.get("program");

  const fetchCertificate = async (program: string, id: string) => {
    const res = await fetch(`/certificates/${program}/${id}`);
    setLoading(false);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdf(url);
    } else {
      const message = await res.text();
      setError(message);
      console.error("Error fetching certificate");
    }
  };
  useEffect(() => {
    if (program && id) {
      userDetails.current = {
        user_id: id as string,
        program: program as string,
      };
      if (userInputRef.current && programSelectRef.current) {
        userInputRef.current.value = id;
        programSelectRef.current.value = program;
      }
      fetchCertificate(program as string, id as string);
    }
  }, [program, id]);

  useEffect(() => {
    async function fetchPrograms() {
      setPrograms(await getPrograms());
    }
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPdf(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const user_id = formData.get("user_id")?.toString().toUpperCase();
    const program = formData.get("program")?.toString();
    userDetails.current = {
      user_id: user_id as string,
      program: program as string,
    };

    fetchCertificate(program as string, user_id as string);
  };

  return (
    <>
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center py-8">
        <h2 className="text-4xl text-center font-semibold text-neutral-800 dark:text-neutral-200 mb-8 font-dm-serif-display">
          Claim Your Certificate
        </h2>
        <form
          className="space-y-4 p-6 md:p-8 max-w-sm w-full"
          onSubmit={handleSubmit}
        >
          {error && <Notice type="error" message={error} />}
          <div className="flex flex-col">
            <label
              htmlFor="user_id"
              className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-1"
            >
              User ID:
            </label>
            <input
              type="text"
              pattern="[a-zA-Z0-9]+"
              id="user_id"
              name="user_id"
              placeholder="U1A2B3C4D5"
              minLength={8}
              required
              ref={userInputRef}
              onKeyDown={() => {
                setError(null);
              }}
              className="w-full border shadow-sm uppercase font-medium text-neutral-950 dark:text-neutral-50 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 border-neutral-300 dark:border-neutral-800 bg-transparent rounded-md px-4 py-3 text-sm"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="program"
              className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-1"
            >
              Program:
            </label>
            <div className="relative">
              <select
                required
                name="program"
                id="program"
                ref={programSelectRef}
                onChange={() => {
                  setError(null);
                }}
                className="w-full appearance-none border shadow-sm font-medium bg-transparent text-neutral-950 dark:text-neutral-50 border-neutral-300 dark:border-neutral-800 rounded-md px-4 py-3 text-sm"
              >
                {programs.map((program) => (
                  <option
                    key={program}
                    value={program}
                    className="bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50"
                  >
                    {formatProgramName(program)}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-5 stroke-neutral-700 dark:stroke-neutral-300 absolute top-3.5 right-3.5" />
            </div>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white"
          >
            {loading ? (
              <LoaderCircleIcon className="size-5 my-0.5 animate-spin" />
            ) : (
              <>
                <span>Submit</span>
                <ArrowRight className="size-5" />
              </>
            )}
          </button>
        </form>
        {pdf && (
          <div className="mt-2 p-6 md:p-8 w-full lg:max-w-xl flex flex-col items-center">
            <Document
              file={pdf}
              className="w-full border-none rounded-lg shadow-sm overflow-hidden"
            >
              <Page
                pageNumber={1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="w-full h-auto"
              />
            </Document>
            <a
              href={pdf}
              download={`${userDetails.current?.program}_${
                userDetails.current?.user_id || "certificate"
              }.pdf`}
              className="flex items-center justify-center max-w-xs gap-2 px-4 mt-4 py-2 w-full rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white"
            >
              <span>Download</span>
              <ArrowDown className="size-5" />
            </a>
          </div>
        )}
      </div>
    </>
  );
}
