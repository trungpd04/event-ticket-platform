import { useCallback, useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

// third-party
import { useDropzone } from 'react-dropzone';
import { useIntl } from 'react-intl';

// third-party
import { GalleryAdd, Trash } from 'iconsax-reactjs';

// project-imports
import { openSnackbar } from 'api/snackbar';
import { uploadFile } from 'api/files';

interface ImageUploadFieldProps {
  label: string;
  hint: string;
  fileType: number;
  value: number | '';
  previewUrl?: string;
  onChange: (fileId: number | '', url?: string) => void;
  error?: boolean;
  helperText?: string | false;
}

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpeg', '.jpg'],
  'image/png': ['.png'],
  'image/webp': ['.webp']
};

export default function ImageUploadField({
  label,
  hint,
  fileType,
  value,
  previewUrl,
  onChange,
  error,
  helperText
}: ImageUploadFieldProps) {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const clearPreview = () => {
    if (localPreview) {
      URL.revokeObjectURL(localPreview);
      setLocalPreview(null);
    }
  };

  const handleRemove = () => {
    clearPreview();
    setUploadError(null);
    onChange('', undefined);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setUploadError(null);

      if (rejectedFiles.length > 0) {
        setUploadError(intl.formatMessage({ id: 'createEvent.imageWrongType' }));
        return;
      }

      const file = acceptedFiles[0];
      if (!file) return;

      const preview = URL.createObjectURL(file);
      setLocalPreview(preview);
      setLoading(true);

      uploadFile(file, fileType)
        .then((uploaded) => {
          onChange(uploaded.id, uploaded.url);
          setUploadError(null);
        })
        .catch((err: any) => {
          clearPreview();
          const message = err?.message || intl.formatMessage({ id: 'createEvent.uploadError' });
          setUploadError(message);
          openSnackbar({
            open: true,
            message,
            variant: 'alert',
            alert: { color: 'error' }
          } as any);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [fileType, intl, onChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: false,
    disabled: loading
  });

  const currentPreview = localPreview || previewUrl;
  const hasValue = value !== '' && value !== undefined && value !== null;

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={500} gutterBottom>
        {label}
        <Typography component="span" color="error.main">
          {' '}
          *
        </Typography>
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        {hint}
      </Typography>

      {currentPreview || hasValue ? (
        <Paper
          variant="outlined"
          sx={{
            position: 'relative',
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            borderColor: error ? 'error.main' : 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Box
            component="img"
            src={currentPreview}
            alt={label}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
          {!loading && (
            <Button
              size="small"
              color="error"
              startIcon={<Trash variant="TwoTone" size={16} />}
              onClick={handleRemove}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'background.default' }
              }}
            >
              {intl.formatMessage({ id: 'createEvent.removeImage' })}
            </Button>
          )}
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0, 0, 0, 0.4)'
              }}
            >
              <CircularProgress color="primary" />
            </Box>
          )}
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          {...getRootProps()}
          sx={{
            height: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading ? 'default' : 'pointer',
            borderStyle: 'dashed',
            borderColor: error ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'background.paper',
            '&:hover': {
              bgcolor: loading ? 'background.paper' : 'action.hover'
            }
          }}
        >
          <input {...getInputProps()} />
          {loading ? (
            <CircularProgress size={32} />
          ) : (
            <>
              <GalleryAdd variant="TwoTone" size={40} style={{ marginBottom: 8, opacity: 0.7 }} />
              <Typography variant="body2" color="text.secondary" textAlign="center">
                {isDragActive
                  ? intl.formatMessage({ id: 'createEvent.dropHere' })
                  : intl.formatMessage({ id: 'createEvent.uploadPlaceholder' })}
              </Typography>
            </>
          )}
        </Paper>
      )}

      {(helperText || uploadError) && (
        <FormHelperText error={Boolean(error || uploadError)}>{uploadError || helperText}</FormHelperText>
      )}
    </Box>
  );
}
