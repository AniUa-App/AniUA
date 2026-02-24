// Web stub — no file system on web
export default async function AllowTheVideoFolder() {}

export async function getVideoDir() {
  return null;
}

export async function getDocumentDirectory() {
  return null;
}

export async function getAvailableSpace() {
  return null;
}

export async function checkVideoDirectory() {
  return null;
}

export async function isFolderAllowed() {
  return false;
}

export async function hasAtLeastOneGBFree() {
  return true;
}
