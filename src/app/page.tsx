"use client";
import {
  ArrowDown,
  ArrowRight,
  ChevronDown,
  Info,
  LoaderCircleIcon,
} from "lucide-react";
import { FormEvent, useRef, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function Home() {
  const [pdf, setPdf] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const userDetails = useRef<{ user_id: string; program: string } | null>(null);

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

    const res = await fetch(`/certificates/${program}/${user_id}`);
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


  return (
    <>
      <div className="w-full min-h-[100dvh] flex flex-col items-center justify-center py-8">
        <h2 className="text-4xl text-center font-semibold text-neutral-800 dark:text-neutral-200 mb-8 font-dm-serif-display">
          Claim Your Certificate
        </h2>
        <form className="space-y-4 p-6 md:p-8 max-w-sm w-full" onSubmit={handleSubmit}>
          {error && (
            <div className="flex border animate-in fade-in border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-800 text-red-600 dark:text-red-300 p-3 my-4 rounded-md">
              <Info className="size-5" />
              <span className="ml-2 text-sm">{error}</span>
            </div>
          )}
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
                onChange={() => {
                  setError(null);
                }}
                className="w-full appearance-none border shadow-sm font-medium bg-transparent text-neutral-950 dark:text-neutral-50 border-neutral-300 dark:border-neutral-800 rounded-md px-4 py-3 text-sm"
              >
                <option
                  value="infinity"
                  className="bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50"
                >
                  Infinity
                </option>
                <option
                  value="hackathons"
                  className="bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50"
                >
                  Hackathons
                </option>
                <option
                  value="3"
                  className="bg-neutral-50 text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50"
                >
                  Program 3
                </option>
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
          <div className="mt-8 p-6 md:p-8 w-full lg:max-w-xl flex flex-col items-center">
            <Document
              file={pdf}
              className="w-full border-none rounded-lg shadow-sm overflow-hidden"
            >
              <Page pageNumber={1} renderTextLayer={false} renderAnnotationLayer={false} className="w-full h-auto"/>
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
