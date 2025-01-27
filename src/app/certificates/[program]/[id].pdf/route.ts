export const dynamic = 'force-static'
import { type NextRequest } from 'next/server'
import { generateCertificate } from '@/lib/certificateGenerator';
import { getParticipant, getPrograms } from '@/lib/firebase/firestore';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string, program: string }> }) {
  const { program } = await params;
  let { id } = await params;
  const validity = await validateDetails(id, program);

  if (!validity.success) {
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

async function validateDetails(id: string, programSlug: string) {
  if (!id || !programSlug) return {
    success: false,
    status: 400,
    body: 'Invalid ID or Program',
  };
  if (!id.match(/^[a-zA-Z0-9]+$/) || !programSlug.match(/^[a-z0-9_]+$/)) return {
    success: false,
    status: 400,
    body: 'Invalid ID or Program',
  };

  const programs = await getPrograms();
  if (!programs.includes(programSlug)) return {
    success: false,
    status: 404,
    body: 'Program not found',
  };

  const participant = await getParticipant(id, programSlug);
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