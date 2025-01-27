import { doc, setDoc, getDoc, writeBatch, runTransaction, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import { convertFirestoreArray, sanatizeProgramName } from "@/lib/helpers";
import { Participant } from "@/types";
import { Schema } from "@pdfme/common";
// firestore structure
//  - programs_list/
//      - programs/
//          value: [...program1, program2, ...]
//  - program1/
//      - participant1
//      - participant2
//    ...
//  - program1_schemas/
//      - schemas
//          - field1
//          - field2
//      ...
//  - program2/
//  ...

export async function getPrograms() {
  const docSnap = await getDoc(doc(db, "programs_list", "programs"));
  if (docSnap.exists()) {
    console.log(docSnap.data());
    return convertFirestoreArray(docSnap.data().value) as string[];
  }
  else return [];
}

export async function getSchemas(program: string) {
  try {
    program = sanatizeProgramName(program);
  }
  catch (err) {
    console.log(err);
    return false;
  }
  const docSnap = await getDoc(doc(db, `${program}_schemas`, "schemas"));
  if (docSnap.exists()) {
    return convertFirestoreArray(docSnap.data()) as Schema[];
  } else {
    console.log("No such document!");
  }
}

export async function setSchemas(program: string, schemas: Schema[]) {
  try {
    program = sanatizeProgramName(program);
  }
  catch (err) {
    console.log(err);
    return false;
  }
  try {
    await setDoc(doc(db, `${program}_schemas`, "schemas"), schemas);
    console.log("Schemas updated");
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
}

export async function getParticipantWithSchema(id: string, program: string) {
  try {
    program = sanatizeProgramName(program);
  }
  catch (err) {
    console.log(err);
    return false;
  }
  const participantRef = doc(db, program, id);
  const schemaRef = doc(db, `${program}_schemas`, "schemas");
  const transaction = runTransaction(db, async (transaction) => {
    const participantDoc = await transaction.get(participantRef);
    const schemaDoc = await transaction.get(schemaRef);
    if (!schemaDoc.exists()) throw "Schema does not exist!";
    if (!participantDoc.exists()) throw "Participant does not exist!";
    return { participant: participantDoc.data(), schema: convertFirestoreArray(schemaDoc.data()) };
  });
  return transaction;
}

export async function getParticipant(id: string, program: string) {
  try {
    program = sanatizeProgramName(program);
  }
  catch (err) {
    console.log(err);
    return false;
  }
  const docSnap = await getDoc(doc(db, program, id));
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    console.log("No such document!");
  }
}

export async function setParticipants(program: string, participants: Participant[]) {
  try {
    program = sanatizeProgramName(program);
  }
  catch (err) {
    console.log(err);
    return false;
  }
  if (program.toLowerCase().endsWith("_schemas") || program.toLowerCase() === "programs_list") {
    console.log("Invalid program name");
    return false;
  }
  const batch = writeBatch(db);
  for (const participant of participants) {
    batch.set(doc(db, program, participant.id), participant);
  }

  // add the program name to list of program names
  const docSnap = await getDoc(doc(db, "programs_list", "programs"));
  if (docSnap.exists()) {
    batch.update(doc(db, "programs_list", "programs"), { value: arrayUnion(program) });
  }
  else {
    batch.set(doc(db, "programs_list", "programs"), { value: arrayUnion(program) });
  }
  try {
    batch.commit();
    console.log("Participants uploaded to Firestore!");
    return true;
  }
  catch (err) {
    console.log("Error writing batch", err);
    return false;
  }
}