import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
  file: Buffer,
  program: String,
  version: Number,
  createdAt: { type: Date, default: Date.now }
});

// Ensure the model is defined only once
const Template = mongoose.models.Template || mongoose.model('Template', TemplateSchema);

export async function uploadBasePdf(file: File, programId: string) {
  await connect();
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  // get only the version number from the programId from db
  const latestRes = (await Template.findOne({ program: programId }).select('version')) || { version: 0 };
  console.log('Latest version:', latestRes);
  try {
    await Template.findOneAndUpdate(
      { program: programId },
      { file: fileBuffer, version: latestRes.version + 1 },
      { upsert: true }
    );
    return true;
  }
  catch (err) {
    console.error('Error uploading file:', err);
    return false;
  }
};

export async function deleteBasePdf(name: string) {
  await connect();
  try {
  const res = await Template.findOneAndDelete({ program: name });
  return res;
  }catch (err) {
    console.error('Error deleting file:', err);
    return false;
  }
}

export async function getBasePdf(name: string): Promise<ArrayBuffer | null> {
  await connect();
  const template = await Template.findOne({ program: name });
  if (!template) return null;
  return template.file?.buffer as ArrayBuffer || null;
}

export async function getBasePdfVersion(name: string): Promise<string | null> {
  await connect();
  const template
    = await Template.findOne({ program: name }).select('version');
  if (!template) return null;
  return template.version;
}

export async function connect() {
  if (!process.env.MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
  }
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
}
