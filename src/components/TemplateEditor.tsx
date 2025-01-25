"use client";
import { useRef, useEffect, useCallback } from 'react';
import { cloneDeep, Template, checkTemplate } from '@pdfme/common';
import { Designer } from '@pdfme/ui';
import { getFontsData, getDefaultTemplate, readFile, getPlugins, defaultField } from '@/lib/helpers';

function TemplateEditor(props: {
  template?: Template;
  basePdf?: File;
  fields?: { name: string; x?: number; y?: number }[];
  onSubmit?: (template: Template) => void;
}) {
  const uiRef = useRef<HTMLDivElement | null>(null);
  const editor = useRef<Designer | null>(null);
  const template = useRef<Template>(getDefaultTemplate());

  let basePdf;
  let inputs;
  if (props.basePdf) {
    basePdf = props.basePdf;
  }

  if (props.fields) {
    inputs = props.fields.map((f) => defaultField(f.name, f.x, f.y));
    console.log(inputs);
  }

  if (props.template) {
    checkTemplate(props.template);
    template.current = props.template;
  }

  if (basePdf) {
    readFile(basePdf, 'dataURL').then((pdf) => {
      template.current = Object.assign(cloneDeep(template.current), {
        basePdf: pdf,
      });
    });
  }
  if (inputs) {
    template.current = Object.assign(cloneDeep(template.current), {
      schemas: [inputs],
    });
  }
  const buildEditor = useCallback(() => {
    try {
      if (!uiRef.current) return;
      editor.current = new Designer({
        domContainer: uiRef.current,
        template: template.current || getDefaultTemplate(),
        options: {
          font: getFontsData(),
          lang: 'en',
        },
        plugins: getPlugins(),
      });
    } catch (error) {
      console.error('Error building editor:', error);
    }
  }, []);

  const onBasePDFChange = useCallback((basePDF: File) => {
    if (editor.current) {
      readFile(basePDF, 'dataURL').then((pdf) => {
        if (editor.current) {
          editor.current.updateTemplate(
            Object.assign(cloneDeep(editor.current.getTemplate()), {
              basePdf: pdf,
            })
          );
        }
      });
    }
  }, []);

  const onFinalize = useCallback(() => {
    if (editor.current) {
      const template = editor.current.getTemplate();
      if (props.onSubmit) {
        props.onSubmit(template);
      }
    }
  }, [props.onSubmit]);

  useEffect(() => {
    if (uiRef.current) {
      buildEditor();
    }
    return () => {
      if (editor.current) {
        editor.current.destroy();
      }
    };
  }, [uiRef, buildEditor]);

  useEffect(() => {
    if (props.template) {
      template.current = props.template;
    }
  }, [props.template]);

  useEffect(() => {
    if (props.basePdf && editor.current) {
      onBasePDFChange(props.basePdf);
    }
  }, [props.basePdf, onBasePDFChange]);

  return (
    <>
      <div className="flex-1 w-full px-4 pb-1 flex justify-end">
        <button
          className="px-4 py-2 mt-1 h-fit text-white bg-green-700 rounded-md shadow-sm hover:bg-green-600 font-medium text-sm"
          onClick={onFinalize}
        >
          Finalize
        </button>
      </div>
      <div ref={uiRef} className="flex-1 w-full" />
    </>
  );
}

export default TemplateEditor;
