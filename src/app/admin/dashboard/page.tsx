"use client";
import Editor from "@/components/TemplateEditor";
import React, { useState, ChangeEvent } from "react";
import { Template } from "@pdfme/common";
import Papa from "papaparse";
import { setParticipants, setSchemas } from "@/lib/firebase/firestore";
import { useAuth } from "@/providers/AuthContext";
import { Participant } from "@/types";
import Notice from "@/components/Notice";
import { signOut } from "@/lib/firebase/auth";
import {
  LoaderCircleIcon,
  LogOutIcon,
  UploadCloud,
  FilePlus2Icon,
  ArrowDown,
} from "lucide-react";

export default function TemplateEditorExample() {
  const { user, authLoading } = useAuth();
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  // const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [parsedValues, setParsedValues] = useState<{ [key: string]: unknown }[] | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const onPdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      setPdf(e.target.files[0]);
    }
  };

  const onCsvFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMessage(null);
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
    }
  };
  const handleUpload = async () => {
    if (!csvFile) return;
    setIsUploadingCsv(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: async (results) => {
        console.log("CSV data:", results.data);
        setParsedValues(results.data as { [key: string]: unknown }[]);
        const success = await setParticipants(
          name,
          results.data as Participant[]
        );
        setIsUploadingCsv(false);
        if (!success) {
          console.log("Error uploading participants");
          return;
        }
        console.log("CSV data uploaded to Firestore!");
        setMessage("CSV data uploaded successfully!");
      },
    });
  };

  const onSubmit = async (template: Template) => {
    console.log(template.schemas);
    setTemplate(template);
    const schemas = Object.assign({}, template.schemas[0]);
    const success = await setSchemas(name, schemas);
    if (!success) {
      console.log("Error updating schema");
      return;
    }
    console.log("Templates updated");
    setMessage("Schema updated successfully");
  };

  return (
    <>
      {user && !authLoading ? (
        <>
          <div className="w-full flex justify-end px-4">
            <button
              className="flex items-center text-sm justify-center gap-2 px-4 mt-4 py-2 w-fit rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white"
              onClick={() => signOut()}
            >
              <LogOutIcon className="size-4" />
              Logout
            </button>
          </div>
          <form className="flex flex-col items-center max-w-xs justify-center w-3/4 mt-12 mx-auto" onSubmit={(e) => e.preventDefault()}>
            <h2 className="text-4xl text-center font-semibold text-neutral-800 dark:text-neutral-200 mb-16 font-dm-serif-display">
              Admin Panel
            </h2>
            {message && <Notice type="success" message={message} />}
            <div className="flex flex-col w-full">
              <label
                htmlFor="user_id"
                className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Program Name:
              </label>
              <input
                required
                className="w-full mb-4 border shadow-sm font-medium text-neutral-600 dark:text-neutral-300 dark:bg-black dark:placeholder:text-neutral-600 border-neutral-300 dark:border-neutral-800 bg-transparent rounded-md px-4 py-3 text-sm"
                type="text"
                placeholder="Enter Name"
                onChange={(e) => {
                  setName(e.target.value);
                  setMessage(null);
                }}
              />
            </div>
            <div className="flex flex-col w-full">
              <label
                htmlFor="user_id"
                className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Participants Data:
              </label>
              <input
                className="block w-full border shadow-sm font-medium bg-neutral-black dark:bg-black dark:placeholder:text-neutral-600 px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400 placeholder-slate-950 dark:border-neutral-800 rounded-md file:bg-transparent file:cursor-pointer file:text-neutral-600 dark:file:text-neutral-200 border-neutral-300 file:border-0  cursor-pointer"
                type="file"
                accept=".csv"
                onChange={onCsvFileChange}
                required
              />
            </div>
            <button
              onClick={handleUpload}
              type="submit"
              className="flex items-center mt-6 justify-center gap-2 px-4 py-2 w-full rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white"
            >
              {isUploadingCsv ? (
                <LoaderCircleIcon className="size-5 my-0.5 animate-spin" />
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  <span className="text-sm">Upload</span>
                </>
              )}
            </button>
          </form>
          <div className="flex flex-col items-center max-w-5xl justify-center mt-4 w-3/4 mx-auto mb-12">
            {!pdf ? (
              <label
                htmlFor="pdf"
                className="flex items-center justify-center max-w-xs gap-2 px-4 py-2 w-full rounded-md shadow-sm cursor-pointer bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white"
              >
                <input
                  id="pdf"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => onPdfFileChange(e)}
                />
                <FilePlus2Icon className="size-4" />
                <span className="text-sm">Choose Base PDF</span>
              </label>
            ) : template ? (
              <a
                href={`data:application/json;base64,${btoa(
                  JSON.stringify(template)
                )}`}
                download={`${name}.json` || "template.json"}  
                className="flex items-center justify-center gap-2 px-4 py-2 max-w-xs w-full rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white text-sm"
              >
                <ArrowDown className="size-4" />
                <span>Download Template</span>
              </a>
            ) : (
              <Editor
                basePdf={pdf}
                onSubmit={onSubmit}
                fields={(() => {
                  console.log(parsedValues);
                  return parsedValues
                    ? Object.keys(parsedValues[0]).map((key, i) => {
                        return {
                          name: key,
                          y: i * 18,
                        };
                      })
                    : [{ name: "name", y: 0 }];
                })()}
              />
            )}
          </div>
        </>
      ) : (
        <div className="grid place-items-center p-8 gap-2 min-h-[100dvh]">
          <LoaderCircleIcon className="size-16 stroke-indigo-700 animate-spin" />
        </div>
      )}
    </>
  );
}
