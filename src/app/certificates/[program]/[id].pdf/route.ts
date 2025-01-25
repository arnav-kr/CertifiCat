export const dynamic = 'force-static'
import { type NextRequest } from 'next/server'
import { generateCertificate, Participant, Program } from '@/lib/certificateGenerator';
import { createRequire } from 'node:module';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string, program: string }> }) {
  const { program } = await params;
  let { id } = await params;
  const validity = validateDetails(id, program);

  if (!validity.success) {
    // send sjon response
    return new Response(validity.body, { status: validity.status });
  }
  if (id.endsWith('.pdf')) id = id.slice(0, -4);

  const pdf = await generateCertificate(id, program);
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
    }
  });
}

function validateDetails(id: string, programSlug: string) {
  if (!id || !programSlug) return {
    success: false,
    status: 400,
    body: 'Invalid ID or Program',
  };
  if (!id.match(/^[a-zA-Z0-9]+$/) || !programSlug.match(/^[a-zA-Z0-9-_]+$/)) return {
    success: false,
    status: 400,
    body: 'Invalid ID or Program',
  };

  // TODO: Change data source to a database
  const programs: Program[] = createRequire(import.meta.url)('../../../../assets/data/programs.json');

  const program = programs.find((p: Program) => p.slug === programSlug);
  if (!program) return {
    success: false,
    status: 404,
    body: 'Program not found',
  };

  const { slug } = program;
  const participants = createRequire(import.meta.url)(`../../../../assets/data/${slug}.json`).data;

  const participant: Participant = participants.find((p: Participant) => p.id === id);

  console.log(id, participant, programSlug, program, slug, participants);
  // send json response
  if (!participant) return {
    success: false,
    status: 404,
    body: 'Participant not found',
  }

  return {
    success: true,
    status: 200,
    body: 'OK',
  };
}