import { Template, Font, getDefaultFont } from '@pdfme/common';
import { text } from '@pdfme/schemas';

export const getFontsData = async (): Promise<Font> => {
  const fonts = await fetch('/fonts.json').then(res => res.json());
  return {
    ...getDefaultFont(),
    ...fonts
  }
};

export const readFile = (file: File | null, type: 'text' | 'dataURL' | 'arrayBuffer') => {
  return new Promise<string | ArrayBuffer>((r) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => {
      if (e && e.target && e.target.result && file !== null) {
        r(e.target.result);
      }
    });
    if (file !== null) {
      if (type === 'text') {
        fileReader.readAsText(file);
      } else if (type === 'dataURL') {
        fileReader.readAsDataURL(file);
      } else if (type === 'arrayBuffer') {
        fileReader.readAsArrayBuffer(file);
      }
    }
  });
};

export const getPlugins = () => {
  return {
    Text: text
  };
};

export const defaultField = (name: string, x: number = 0, y: number = 0) => {
  return {
    name,
    type: "text",
    content: name,
    position: { x, y },
    width: 76.22,
    height: 17.41,
    rotate: 0,
    alignment: "center",
    verticalAlignment: "middle",
    fontSize: 3232,
    lineHeight: 1,
    characterSpacing: 0,
    fontColor: "#000000",
    backgroundColor: "",
    opacity: 1,
    strikethrough: false,
    underline: false,
    required: false,
    readOnly: true
  };
};

export const getDefaultTemplate = () =>
({
  schemas: [
    [
      {
        name: "name",
        type: "text",
        content: "John Doe",
        position: { x: 110.4, y: 96.34 },
        width: 76.22,
        height: 17.41,
        rotate: 0,
        alignment: "center",
        verticalAlignment: "middle",
        fontSize: 40,
        lineHeight: 1,
        characterSpacing: 0,
        fontColor: "#000000",
        backgroundColor: "",
        opacity: 1,
        strikethrough: false,
        underline: false,
        required: false,
        readOnly: true
      }
    ]
  ],
  basePdf: {
    width: 210,
    height: 297,
    padding: [20, 10, 20, 10]
  },
  pdfmeVersion: "52.16"
} as Template);
