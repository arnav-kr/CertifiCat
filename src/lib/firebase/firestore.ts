import { doc, setDoc, getDoc, query, where, writeBatch, runTransaction, arrayUnion, deleteDoc, arrayRemove, updateDoc, getDocs, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/clientApp";
import { convertFirestoreArray, deleteCollection, sanatizeProgramName } from "@/lib/helpers";
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
    return convertFirestoreArray(docSnap.data().value) as string[];
  }
  else return [];
}

export async function addParticipant(program: string, participant: Participant) {
  try {
    const participantDocRef = doc(db, program, participant.id);
    await setDoc(participantDocRef, participant);
    console.log("Participant added to Firestore!");
    return true;
  } catch (err) {
    console.log("Error adding participant", err);
    return false;
  }
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

export async function setSchemas(program: string, schemas: { [index: number]: Schema }) {
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

export async function getIdFromEmail(email: string, program: string) {
  try {
    program = sanatizeProgramName(program);
  }
  catch (err) {
    console.log(err);
    return false;
  }
  const q = query(collection(db, program), where("email", "==", email.trim().toLowerCase()));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return false;
  }
  return querySnapshot.docs[0].id;
}



export async function getParticipant(id: string, program: string) {
  console.log("Getting participant", id, program);
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
    return false;
  }
}
export async function getParticipants(program: string) {

  try {
    const querySnapshot = await getDocs(collection(db, `${program}`));
    return querySnapshot.docs.map(doc => doc.data() as Participant);
  }
  catch (err) {
    console.log(err);
    return [];
  }

}

export async function deleteProgram(program: string) {
  try {
    const programRef = doc(db, 'programs_list', 'programs');
    await updateDoc(programRef, {
      value: arrayRemove(program)
    });
    await deleteCollection(db, collection(db, `${program}_schemas`));
    await deleteCollection(db, collection(db, `${program}`));
    console.log("Program deleted from Firestore!");
    return true;
  } catch (err) {
    console.log("Error deleting program", err);
    return false;
  }
}


export async function setParticipant(program: string, participantId: string, participant: Participant) {
  try {
    const participantDocRef = doc(db, program, participantId);
    await updateDoc(participantDocRef, { ...participant });
    console.log("Participant updated in Firestore!");
    return true;
  } catch (err) {
    console.log("Error updating participant", err);
    return false;
  }
}

export async function deleteParticipant(program: string, participantId: string) {
  try {
    const participantDocRef = doc(db, program, participantId);
    await deleteDoc(participantDocRef);
    console.log("Participant deleted from Firestore!");
    return true;
  } catch (err) {
    console.log("Error deleting participant", err);
    return false;
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
    const participantDocRef = doc(db, program, participant.id);
    batch.set(participantDocRef, participant);
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
    await batch.commit();
    console.log("Participants uploaded to Firestore!");
    return true;
  }
  catch (err) {
    console.log("Error writing batch", err);
    return false;
  }
}
