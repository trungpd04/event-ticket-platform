import axios from 'utils/axios';

// ==============================|| FILES API ||============================== //

export interface UploadedFile {
  id: number;
  url: string;
  publicId: string;
  fileType: number;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
}

export const uploadFile = async (file: File, type: number): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', String(type));

  const response = await axios.post('/api/v1/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return response.data as UploadedFile;
};
