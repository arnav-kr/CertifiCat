"use client";
import Editor from '@/components/TemplateEditor';
import React, { useState } from 'react';
import { Template } from '@pdfme/common';

export default function TemplateEditorExample() {
  const [pdf, setPdf] = useState<File | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      setPdf(e.target.files[0]);
    }
  };

  const onSubmit = (template: Template) => {
    console.log(template);
    setTemplate(template);
  };

  return (
    <>
      {!pdf ? (
        <label
          htmlFor="pdf"
          className="flex items-center justify-center rounded-md m-4 p-4 cursor-pointer w-fit h-12 border border-gray-300"
        >
          <input
            id="pdf"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => onFileChange(e)}
          />
          <span className="text-sm">Choose Base PDF</span>
        </label>
      ) : template ? (
        <div>
          <a
            href={`data:application/json;base64,${btoa(JSON.stringify(template))}`}
            download="template.json"
            className="block m-4 w-fit p-4 border border-gray-300 rounded-md"
          >
            Download Template
          </a>
        </div>
      ) : (
        <Editor
          basePdf={pdf}
          onSubmit={onSubmit}
          fields={[{ name: 'name' }, { name: 'age', y: 18 }, { name: 'rank', y: 36 }]}
        />
      )}
    </>
  );
}
