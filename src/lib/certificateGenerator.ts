
import { generate } from '@pdfme/generator';
import { getParticipantWithSchema, getSchemas } from './firebase/firestore';
import { getBasePdf } from './firebase/storage';
import fs from 'fs';
import path from "path";
import { constructTemplate } from './helpers';

export async function generateCertificate(id: string, programSlug: string) {

  // TODO: [SECURITY] use a user for firestore operation as no public access will be allowed in production
  const res = await getParticipantWithSchema(id, programSlug);
  if (!res) {
    throw new Error('Participant not found');
  }

  let basePdf;
  console.log(programSlug, fs.existsSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}.pdf`)))
  try {
    // get from file system cache if available
    if (fs.existsSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}.pdf`))) {
      basePdf = new Blob([fs.readFileSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}.pdf`))], { type: 'application/pdf' });
    }
    // else fetch new
    else {
      basePdf = await getBasePdf(programSlug);
      fs.writeFileSync(path.join(process.cwd(), `.cache/basePdf/${programSlug}.pdf`), new Uint8Array(await basePdf.arrayBuffer()));
    }

    const schemas = await getSchemas(programSlug);
    if (!schemas) {
      throw new Error('No schemas found');
    }
    const fields = schemas.map(schema => schema.name);
    const template = await constructTemplate(basePdf, schemas);
    // console.log(template.basePdf);
    return await generate({
      template, inputs: fields.map(field => {
        return {
          [field]: res.participant[field]
        }
      })
    });
  }
  catch (e) {
    console.error(e);
    throw new Error('Error generating certificate');
  }
}