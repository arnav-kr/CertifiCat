import { Template, Font, getDefaultFont } from '@pdfme/common';
import { text } from '@pdfme/schemas';

export const getFontsData = (): Font => {
  return {
    ...getDefaultFont(),
    Roboto: {
      data: "https://fonts.gstatic.com/s/roboto/v47/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
      fallback: true
    },
    "Open Sans": {
      data: "https://fonts.gstatic.com/s/opensans/v40/mem8YaGs126MiZpBA-U1UpcaXcl0Aw.ttf"
    },
    "Noto Sans JP": {
      data: "https://fonts.gstatic.com/s/notosansjp/v53/-F62fjtqLzI2JPCgQBnw7HFoxgIO2lZ9hg.ttf"
    },
    Montserrat: {
      data: "https://fonts.gstatic.com/s/montserrat/v29/JTUSjIg1_i6t8kCHKm45xW5rygbi49c.ttf"
    },
    Poppins: {
      data: "https://fonts.gstatic.com/s/poppins/v22/pxiEyp8kv8JHgFVrFJDUc1NECPY.ttf"
    },
    Inter: {
      data: "https://fonts.gstatic.com/s/inter/v18/UcCo3FwrK3iLTfvlaQc78lA2.ttf"
    },
    Lato: {
      data: "https://fonts.gstatic.com/s/lato/v24/S6uyw4BMUTPHvxk6XweuBCY.ttf"
    },
    Oswald: {
      data: "https://fonts.gstatic.com/s/oswald/v53/TK3iWkUHHAIjg75GHjUHte5fKg.ttf"
    },
    "Noto Sans": {
      data: "https://fonts.gstatic.com/s/notosans/v38/o-0IIpQlx3QUlC5A4PNb4j5Ba_2c7A.ttf"
    },
    Raleway: {
      data: "https://fonts.gstatic.com/s/raleway/v34/1Ptug8zYS_SKggPN-CoCTqluHfE.ttf"
    },
    Nunito: {
      data: "https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKof4MuyAbsrVcA.ttf"
    },
    Rubik: {
      data: "https://fonts.gstatic.com/s/rubik/v28/iJWKBXyIfDnIV4nGp32S0H3f.ttf"
    },
    "Playfair Display": {
      data: "https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXPTvSgWE_-xU.ttf"
    },
    "Noto Sans KR": {
      data: "https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm21nTs4JMMuA.ttf"
    },
    Merriweather: {
      data: "https://fonts.gstatic.com/s/merriweather/v30/u-440qyriQwlOrhSvowK_l5OeyxNV-bnrw.ttf"
    },
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
    fontSize: 32,
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
