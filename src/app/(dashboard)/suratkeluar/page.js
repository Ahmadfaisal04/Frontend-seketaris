'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box, Typography, Card, CardContent, IconButton, Tooltip,
  Alert, CircularProgress, TablePagination, Chip, Avatar, Snackbar, DialogContentText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import { styled } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { API_ENDPOINTS, getHeaders } from '@/config/api';

// Styled components
const StyledCard = styled(Card)({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden'
});

const HeaderBox = styled(Box)({
  background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
  padding: '24px',
  color: 'white',
  borderRadius: '16px 16px 0 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
});

const FilePreviewBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  marginTop: theme.spacing(1),
}));

export default function SuratKeluar() {
  const [rows, setRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [initialFormData, setInitialFormData] = useState(null);
  const [formData, setFormData] = useState({
    nomor: '',
    tanggal: null,
    perihal: '',
    ditujukan: '',
    file: null,
    existingFile: '',
    existingTitle: ''
  });
  const [previewFile, setPreviewFile] = useState(null);
  const [existingFile, setExistingFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    id: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SURAT_KELUAR_GET_ALL, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Gagal mengambil data surat keluar');

      const data = await response.json();
      setRows(data);
      setError(null);
    } catch (err) {
      setError('Gagal mengambil data surat keluar');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, file }));
      setPreviewFile(URL.createObjectURL(file));
      setExistingFile(null);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, tanggal: date }));
  };

  const mapFormDataToSurat = (template, formData, content) => {
    let nomor = formData.no_surat || '';
    let perihal = template;
    let ditujukan = formData.tujuan || '';
    let fileContent = content;

    // Map specific fields based on template type
    switch (template) {
      case 'Surat Keterangan Domisili':
        perihal = 'Keterangan Domisili';
        break;
      case 'Surat Keterangan Tidak Mampu':
        perihal = 'Keterangan Tidak Mampu';
        break;
      case 'Surat Keterangan Usaha':
        perihal = 'Keterangan Usaha';
        break;
      case 'Surat Keterangan Pindah':
        perihal = 'Keterangan Pindah';
        break;
      case 'Surat Pengantar':
        perihal = 'Surat Pengantar';
        break;
      case 'Surat Keterangan Kelahiran':
        perihal = 'Keterangan Kelahiran';
        break;
      case 'Surat Keterangan Kematian':
        perihal = 'Keterangan Kematian';
        break;
      default:
        perihal = template;
    }

    return { nomor, perihal, ditujukan, fileContent };
  };

  const handleSave = async (isFromPrint = false, printData = null) => {
    let dataToSave;

    if (isFromPrint && printData) {
      // Handle data from CetakLayananSurat.jsx print action
      const { template, formData: printFormData, content } = printData;
      const { nomor, perihal, ditujukan, fileContent } = mapFormDataToSurat(template, printFormData, content);

      if (!nomor || !perihal || !ditujukan) {
        setError('Data dari print tidak lengkap');
        setSnackbar({
          open: true,
          message: 'Data dari print tidak lengkap',
          severity: 'error'
        });
        return;
      }

      // Convert HTML content to a Blob for file upload
      const blob = new Blob([fileContent], { type: 'text/html' });
      const file = new File([blob], `${nomor}_${template.replace(/\s/g, '_')}.html`, { type: 'text/html' });

      dataToSave = new FormData();
      dataToSave.append('nomor', nomor);
      dataToSave.append('tanggal', printFormData.tanggal || new Date().toISOString().split('T')[0]);
      dataToSave.append('perihal', perihal);
      dataToSave.append('ditujukan', ditujukan);
      dataToSave.append('file', file);
    } else {
      // Handle manual form submission
      if (!formData.nomor || !formData.tanggal || !formData.perihal || !formData.ditujukan) {
        setError('Semua field harus diisi');
        setSnackbar({
          open: true,
          message: 'Semua field harus diisi',
          severity: 'error'
        });
        return;
      }

      dataToSave = new FormData();
      dataToSave.append('nomor', formData.nomor);
      dataToSave.append('tanggal', dayjs(formData.tanggal).format('YYYY-MM-DD'));
      dataToSave.append('perihal', formData.perihal);
      dataToSave.append('ditujukan', formData.ditujukan);

      if (formData.file && typeof formData.file === 'object') {
        dataToSave.append('file', formData.file);
      } else {
        dataToSave.append('existing_file', formData.existingFile);
        dataToSave.append('existing_title', formData.existingTitle);
      }
    }

    setLoading(true);
    try {
      const endpoint = editingId
        ? API_ENDPOINTS.SURAT_KELUAR_UPDATE(editingId)
        : API_ENDPOINTS.SURAT_KELUAR_ADD;

      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: isFromPrint ? getHeaders() : {}, // Use headers only for print data if needed
        body: dataToSave,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan data');
      }

      setShowModal(false);
      fetchData();
      setSnackbar({
        open: true,
        message: editingId ? 'Data berhasil diupdate!' : 'Data berhasil ditambahkan!',
        severity: 'success'
      });
    } catch (err) {
      setError(err.message);
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    const formattedData = {
      nomor: row.nomor,
      tanggal: dayjs(row.tanggal),
      perihal: row.perihal,
      ditujukan: row.ditujukan,
      file: null,
      existingFile: row.file,
      existingTitle: row.title,
    };

    setFormData(formattedData);
    setInitialFormData(formattedData);
    setEditingId(row.id);

    if (row.file) {
      setExistingFile(row.file);
      const backendBaseUrl = "http://localhost:8088";
      const filePath = row.file.startsWith(".") ? row.file.replace(".", "") : row.file;
      const previewUrl = `${backendBaseUrl}${filePath}`;
      setPreviewFile(previewUrl);
    } else {
      setExistingFile(null);
      setPreviewFile(null);
    }

    setShowModal(true);
  };

  const isFormChanged = () => {
    if (!initialFormData) return true;

    return (
      formData.nomor !== initialFormData.nomor ||
      formData.tanggal?.format("YYYY-MM-DD") !== dayjs(initialFormData.tanggal).format("YYYY-MM-DD") ||
      formData.perihal !== initialFormData.perihal ||
      formData.ditujukan !== initialFormData.ditujukan ||
      (formData.file instanceof File)
    );
  };

  const handleDeleteClick = (id) => {
    setDeleteDialog({ open: true, id });
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialog({ open: false, id: null });
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SURAT_KELUAR_DELETE(deleteDialog.id), {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error('Gagal menghapus data');
      
      setSnackbar({
        open: true,
        message: 'Data suratkeluar telah dihapus.',
        severity: 'success'
      });
      fetchData();
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Terjadi kesalahan saat menghapus.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleDeleteDialogClose();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Expose handleSave for external calls (e.g., from CetakLayananSurat.jsx)
  useEffect(() => {
    // Simulate API handler for /api/suratkeluar
    const handlePostRequest = async (data) => {
      await handleSave(true, data);
    };

    // This is a placeholder for actual API integration
    // In a real setup, the backend would call handleSave with the POST data
    window.__handleSuratKeluarPost = handlePostRequest; // For testing purposes
    return () => {
      delete window.__handleSuratKeluarPost;
    };
  }, []);

  return (
    <StyledCard>
      <HeaderBox>
        <Typography variant="h6">Data Surat Keluar</Typography>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          onClick={() => {
            setShowModal(true);
            setEditingId(null);
            setFormData({
              nomor: '',
              tanggal: null,
              perihal: '',
              ditujukan: '',
              file: null,
              existingFile: '',
              existingTitle: ''
            });
            setPreviewFile(null);
            setExistingFile(null);
            setError(null);
          }}
        >
          Tambah Surat
        </Button>
      </HeaderBox>

      <CardContent>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Nomor Surat</strong></TableCell>
                <TableCell><strong>Tanggal</strong></TableCell>
                <TableCell><strong>Perihal</strong></TableCell>
                <TableCell><strong>Ditujukan</strong></TableCell>
                <TableCell><strong>File</strong></TableCell>
                <TableCell><strong>Aksi</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.nomor}</TableCell>
                  <TableCell>{dayjs(row.tanggal).format('DD-MM-YYYY')}</TableCell>
                  <TableCell>{row.perihal}</TableCell>
                  <TableCell>{row.ditujukan}</TableCell>
                  <TableCell>
                    {row.file && (
                      <Tooltip title="Lihat File">
                        <IconButton
                          component="a"
                          href={`http://localhost:8088/${row.file.replace(/^\./, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <DescriptionIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(row)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton onClick={() => handleDeleteClick(row.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </CardContent>

      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Surat Keluar' : 'Tambah Surat Keluar'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="dense" label="Nomor Surat" name="nomor"
            value={formData.nomor} onChange={handleInputChange}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Tanggal"
              value={formData.tanggal}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
            />
          </LocalizationProvider>
          <TextField
            fullWidth margin="dense" label="Perihal" name="perihal"
            value={formData.perihal} onChange={handleInputChange}
          />
          <TextField
            fullWidth margin="dense" label="Ditujukan" name="ditujukan"
            value={formData.ditujukan} onChange={handleInputChange}
          />
          <Button variant="outlined" component="label" sx={{ mt: 2 }}>
            Pilih File
            <input type="file" name="file" hidden onChange={handleInputChange} />
          </Button>
          {(previewFile || existingFile) && (
            <FilePreviewBox>
              <Avatar><DescriptionIcon /></Avatar>
              <Typography variant="body2">
                {formData.file?.name || existingFile?.split('/').pop()}
              </Typography>
              {(previewFile || existingFile) && (
                <a
                  href={previewFile || `http://localhost:8088${existingFile.replace(/^\./, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="small">Lihat</Button>
                </a>
              )}
            </FilePreviewBox>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)}>Batal</Button>
          <Button
            onClick={() => handleSave(false)}
            variant="contained"
            color="error"
            disabled={loading || (editingId && !isFormChanged())}
          >
            {editingId ? 'Update' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Apakah Anda yakin?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Data yang dihapus tidak dapat dikembalikan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Batal</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Ya, Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
}