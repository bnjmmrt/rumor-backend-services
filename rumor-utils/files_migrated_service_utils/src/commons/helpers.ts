export const generateUniqueFileName = (type: string) => {
  const now = new Date().toISOString();
  const cleanNow = now.replace(/[\W_]+/g, '');
  const random = Math.floor(Math.random() * 10000);
  const fileName = `${cleanNow}-${random}.${type}`;
  return fileName;
};
