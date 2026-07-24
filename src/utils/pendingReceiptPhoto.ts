let pendingReceiptPhoto: File | null = null;

// A camera capture happens before the transaction form is mounted.
export const setPendingReceiptPhoto = (file: File) => {
  pendingReceiptPhoto = file;
};

export const takePendingReceiptPhoto = () => {
  const photo = pendingReceiptPhoto;
  pendingReceiptPhoto = null;
  return photo;
};
