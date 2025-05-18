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
  InfoIcon,
} from "lucide-react";
import TokenInput, { Option } from "@/components/TokenInput";
import {
  clientUploadBasePdf,
  generateId,
  sanatizeProgramName,
} from "@/lib/helpers";
import { MultiValue } from "react-select";

export default function Create() {
  const { user, authLoading } = useAuth();
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  // const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [parsedValues, setParsedValues] = useState<
    { [key: string]: unknown }[] | null
  >(null);
  const [tokenInputError, setTokenInputError] = useState<string | null>(null);
  const [fieldsToImport, setFieldsToImport] = useState<Option[]>([]);
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
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) =>
          sanatizeProgramName(header.trim().toLowerCase()),
        complete: async (results) => {
          const data = results.data as { [key: string]: unknown }[];
          // console.log("CSV data:", data);
          setParsedValues(data as { [key: string]: unknown }[]);
          const fields = Object.keys(data[0]).map((k) => {
            let sanatized = sanatizeProgramName(k);
            if(k === "email") {
              sanatized = sanatized.trim();
            }
            return {
              value: sanatized,
              label: sanatizeProgramName(sanatized),
            };
          });
          setFieldsToImport(fields);
          if (!fields.some((option) => option.value === "email")) {
            setTokenInputError("email field is required");
          }
        },
      });
    }
  };

  const handleTokenInputChange = (newValue: MultiValue<Option>) => {
    if (
      newValue.length === 0 ||
      !newValue.some((option) => option.value === "email")
    ) {
      setTokenInputError("email field is required");
    } else {
      setTokenInputError(null);
    }
    setFieldsToImport(newValue as Option[]);
  };

  const handleUpload = async () => {
    if (!parsedValues) return;
    setIsUploadingCsv(true);
    const fieldKeys = fieldsToImport.map((field) => field.value);
    const dataToUpload = parsedValues.map((participant) => {
      // eslint-disable-next-line prefer-const
      let newParticipant: { [key: string]: unknown } = {};
      for (const key of fieldKeys) {
        if (key === "email") {
          if (!participant[key]) {
            console.log("Email field is missing in one of the participants");
            setIsUploadingCsv(false);
            return;
          }
          newParticipant[key] = participant[key].toString().toLowerCase();
          // if id doesn't exist, create one
          if (!participant["id"]) {
            newParticipant["id"] = generateId();
          }
          continue;
        }
        newParticipant[key] = participant[key];
      }
      return newParticipant;
    });
    // console.log(dataToUpload, name);

    const success = await setParticipants(
      name,
      dataToUpload as unknown as Participant[]
    );
    setIsUploadingCsv(false);
    if (!success) {
      console.log("Error uploading participants");
      return;
    }
    console.log("CSV data uploaded to Firestore!");
    setMessage("CSV data uploaded successfully!");
  };

  const onSubmit = async (template: Template) => {
    // console.log(template.schemas);
    setTemplate(template);
    const schemas = Object.assign({}, template.schemas[0]);
    const success = await setSchemas(name, schemas);
    if (!success) {
      console.log("Error updating schema");
      return;
    }
    console.log("Templates updated");
    setMessage("Schema updated successfully");
    if (pdf) {
      const result = await clientUploadBasePdf(pdf, sanatizeProgramName(name));
      const jsonRes = await result.json();
      if (jsonRes.success) {
        setMessage("Base PDF uploaded successfully!");
      }
    }
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
          <form
            className="flex flex-col items-center max-w-xs justify-center w-3/4 mt-12 mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <h2 className="text-4xl text-center font-semibold text-neutral-800 dark:text-neutral-200 mb-16 font-dm-serif-display">
              Create a Program
            </h2>
            {message && <Notice type="success" message={message} />}
            <div className="flex flex-col w-full">
              <label
                htmlFor="program_name"
                className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Program Name
              </label>
              <input
                required
                id="program_name"
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
                htmlFor="csv"
                className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Participants Data{" "}
                <span className="text-xs text-neutral-500 font-medium">
                  (email field is mandatory)
                </span>
              </label>
              <input
                className="block w-full mb-4 border shadow-sm font-medium bg-neutral-black dark:bg-black dark:placeholder:text-neutral-600 p-2 text-sm text-neutral-600 dark:text-neutral-400 placeholder-neutral-950 dark:border-neutral-800 rounded-md file:bg-indigo-700 file:cursor-pointer file:rounded-md file:px-3 file:py-2 file:mr-2 file:text-white border-neutral-300 file:border-0 cursor-pointer"
                type="file"
                accept=".csv"
                id="csv"
                onChange={onCsvFileChange}
                required
              />
            </div>
            {parsedValues && (
              <div className="flex flex-col w-full">
                <label
                  htmlFor="import_fields"
                  className="font-semibold text-sm text-neutral-700 dark:text-neutral-300 mb-1"
                >
                  Fields to Import
                </label>
                <TokenInput
                  options={Object.keys(parsedValues[0]).map((k) => {
                    const sanatized = sanatizeProgramName(k);
                    return {
                      value: sanatized,
                      label: sanatizeProgramName(sanatized),
                    };
                  })}
                  value={fieldsToImport}
                  onChange={handleTokenInputChange}
                />
                {tokenInputError && (
                  <span className="text-sm p-2 pb-0 text-red-600 dark:tex-red-500 inline-flex items-center">
                    <InfoIcon className="size-4 mr-1 inline stroke-current" />
                    {tokenInputError}
                  </span>
                )}
              </div>
            )}
            <button
              disabled={!!tokenInputError || !fieldsToImport.length}
              onClick={handleUpload}
              type="submit"
              className="flex items-center mt-6 justify-center gap-2 px-4 py-2 w-full disabled:cursor-not-allowed disabled:opacity-70 rounded-md shadow-sm bg-indigo-700 hover:shadow-md transition duration-150 ease active:scale-[99%] text-white"
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
                  console.log(fieldsToImport);
                  return fieldsToImport
                    ? fieldsToImport
                        .filter((f) => f.value !== "id")
                        .map((option, i) => {
                          return {
                            name: option.value,
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
