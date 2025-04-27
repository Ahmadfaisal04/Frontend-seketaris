'use client';
import { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Typography, Card, CardContent, IconButton,
  CircularProgress, TablePagination, Box, styled,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import SaveIcon from '@mui/icons-material/Save';
import { API_ENDPOINTS, getHeaders } from '@/config/api';
import { useRouter } from 'next/navigation';

// Styled components
const StyledCard = styled(Card)({
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)',
  overflow: 'hidden',
  minHeight: '400px',
});

const HeaderBox = styled(Box)({
  background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
  padding: '24px',
  color: 'white',
  borderRadius: '16px 16px 0 0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

// Status colors mapping
const statusColors = {
  'Diproses': 'primary',
  'Selesai': 'success',
  'Ditolak': 'error'
};

// Daftar opsi status untuk dropdown
const statusOptions = [
  { value: 'Diproses', label: 'Diproses' },
  { value: 'Selesai', label: 'Selesai' },
  { value: 'Ditolak', label: 'Ditolak' }
];

// Fungsi untuk memformat tanggal ke format Indonesia (contoh: 20 Mei 1990)
const formatTanggalIndonesia = (tanggal) => {
  if (!tanggal) return '...........................';
  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return '...........................';
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
};

// Fungsi untuk menangani nilai null atau undefined
const safeString = (value) => (value != null ? String(value) : '...........................');

// Template Surat
const suratTemplates = {
  'Surat Keterangan Domisili': {
    title: 'Surat Keterangan Domisili',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
            <div>
              <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
              <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
              <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</p>
            <p>Nomor: ${safeString(data.no_surat)}</p>
            <p>Lampiran: ${data.dokumen_url ? 'Ada' : '-'}</p>
            <p>Perihal: Keterangan Domisili</p>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
            
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung dan berdomisili di alamat tersebut di atas.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>Kepala Desa Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Tujuan Surat', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' }
    ]
  },
  'Surat Keterangan Tidak Mampu': {
    title: 'Surat Keterangan Tidak Mampu',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
            <div>
              <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
              <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
              <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</p>
            <p>Nomor: ${safeString(data.no_surat)}</p>
            <p>Lampiran: ${data.dokumen_url ? 'Ada' : '-'}</p>
            <p>Perihal: Keterangan Tidak Mampu</p>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
            
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Pekerjaan</td>
                <td>: ${safeString(data.pekerjaan)}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung dan berdasarkan pengamatan termasuk dalam kategori tidak mampu untuk keperluan ${safeString(data.keperluan)}.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>Kepala Desa Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'pekerjaan', label: 'Pekerjaan', type: 'text', placeholder: 'Masukkan Pekerjaan' },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Tujuan Surat', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' }
    ]
  },
  'Surat Keterangan Usaha': {
    title: 'Surat Keterangan Usaha',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
            <div>
              <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
              <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
              <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</p>
            <p>Nomor: ${safeString(data.no_surat)}</p>
            <p>Lampiran: ${data.dokumen_url ? 'Ada' : '-'}</p>
            <p>Perihal: Keterangan Usaha</p>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
            
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
              <tr>
                <td>Nama Usaha</td>
                <td>: ${safeString(data.nama_usaha)}</td>
              </tr>
              <tr>
                <td>Jenis Usaha</td>
                <td>: ${safeString(data.jenis_usaha)}</td>
              </tr>
              <tr>
                <td>Alamat Usaha</td>
                <td>: ${safeString(data.alamat_usaha)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung dan memiliki usaha sebagaimana tersebut di atas yang masih aktif hingga saat ini.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>Kepala Desa Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'nama_usaha', label: 'Nama Usaha', type: 'text', placeholder: 'Masukkan Nama Usaha' },
      { name: 'jenis_usaha', label: 'Jenis Usaha', type: 'text', placeholder: 'Masukkan Jenis Usaha' },
      { name: 'alamat_usaha', label: 'Alamat Usaha', type: 'text', placeholder: 'Masukkan Alamat Usaha' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Tujuan Surat', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' }
    ]
  },
  'Surat Keterangan Pindah': {
    title: 'Surat Keterangan Pindah',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
            <div>
              <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
              <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
              <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</p>
            <p>Nomor: ${safeString(data.no_surat)}</p>
            <p>Lampiran: ${data.dokumen_url ? 'Ada' : '-'}</p>
            <p>Perihal: Keterangan Pindah</p>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
            
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat Asal</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
              <tr>
                <td>Alamat Tujuan</td>
                <td>: ${safeString(data.alamat_tujuan)}</td>
              </tr>
              <tr>
                <td>Alasan Pindah</td>
                <td>: ${safeString(data.alasan_pindah)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung yang akan pindah ke alamat tujuan tersebut di atas untuk keperluan ${safeString(data.keperluan)}.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>Kepala Desa Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Asal', type: 'text', placeholder: 'Masukkan Alamat Asal', disabled: true },
      { name: 'alamat_tujuan', label: 'Alamat Tujuan', type: 'text', placeholder: 'Masukkan Alamat Tujuan' },
      { name: 'alasan_pindah', label: 'Alasan Pindah', type: 'text', placeholder: 'Masukkan Alasan Pindah' },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Tujuan Surat', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' }
    ]
  },
  'Surat Pengantar': {
    title: 'Surat Pengantar',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
            <div>
              <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
              <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
              <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="text-align: center; font-weight: bold; font-size: 18px;">SURAT PENGANTAR</p>
            <p style="text-align: center;">Nomor: ${safeString(data.no_surat)}</p>
            <p style="text-align: center;">Lampiran: ${data.dokumen_url ? 'Ada' : '-'}</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
            
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung dan memerlukan surat pengantar ini untuk keperluan ${safeString(data.keperluan)}.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat pengantar ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>Bonto Ujung, ${tanggalPembuatan}</p>
            <p>Kepala Desa Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'keperluan', label: 'Keperluan', type: 'text', placeholder: 'Masukkan Keperluan' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Tujuan Surat', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' }
    ]
  },
  'Surat Keterangan Kelahiran': {
    title: 'Surat Keterangan Kelahiran',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
            <div>
              <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
              <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
              <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</p>
            <p>Nomor: ${safeString(data.no_surat)}</p>
            <p>Lampiran: ${data.dokumen_url ? 'Ada' : '-'}</p>
            <p>Perihal: Keterangan Kelahiran</p>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
            
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama Anak</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>Jenis Kelamin</td>
                <td>: ${safeString(data.jenis_kelamin)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Nama Ayah</td>
                <td>: ${safeString(data.nama_ayah)}</td>
              </tr>
              <tr>
                <td>Nama Ibu</td>
                <td>: ${safeString(data.nama_ibu)}</td>
              </tr>
              <tr>
                <td>Alamat Orang Tua</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar anak tersebut lahir di Desa Bonto Ujung sebagaimana keterangan di atas.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>Kepala Desa Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nama_lengkap', label: 'Nama Anak', type: 'text', placeholder: 'Masukkan Nama Anak', disabled: true },
      { name: 'jenis_kelamin', label: 'Jenis Kelamin', type: 'text', placeholder: 'Masukkan Jenis Kelamin' },
      { name: 'tempat_lahir', label: 'Tempat Lahir Anak', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir Anak', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'nama_ayah', label: 'Nama Ayah', type: 'text', placeholder: 'Masukkan Nama Ayah' },
      { name: 'nama_ibu', label: 'Nama Ibu', type: 'text', placeholder: 'Masukkan Nama Ibu' },
      { name: 'alamat_lengkap', label: 'Alamat Orang Tua', type: 'text', placeholder: 'Masukkan Alamat Orang Tua', disabled: true },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Tujuan Surat', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' }
    ]
  },
  'Surat Keterangan Kematian': {
    title: 'Surat Keterangan Kematian',
    template: (data) => {
      const tanggalPembuatan = formatTanggalIndonesia(new Date());
      return `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
            <img src="/image.png" alt="Logo Desa" style="height: 80px; margin-right: 20px;" />
            <div>
              <h2 style="margin: 0;">PEMERINTAH DESA BONTO UJUNG</h2>
              <h3 style="margin: 5px 0;">KECAMATAN TAROWANG - KABUPATEN JENEPONTO</h3>
              <p style="margin: 0;">Jl. Poros Tarowang No. 10, Kode Pos 92351</p>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <p style="text-align: right;">Bonto Ujung, ${tanggalPembuatan}</p>
            <p>Nomor: ${safeString(data.no_surat)}</p>
            <p>Lampiran: ${data.dokumen_url ? 'Ada' : '-'}</p>
            <p>Perihal: Keterangan Kematian</p>
          </div>

          <div style="margin: 30px 0;">
            <p>Kepada Yth.</p>
            <p>${safeString(data.ditujukan)}</p>
            <p>di Tempat</p>
          </div>

          <div style="margin: 30px 0; text-align: justify;">
            <p>Yang bertanda tangan di bawah ini Kepala Desa Bonto Ujung menerangkan bahwa:</p>
            
            <table style="margin-left: 40px; margin-bottom: 20px;">
              <tr>
                <td>Nama</td>
                <td>: ${safeString(data.nama_lengkap)}</td>
              </tr>
              <tr>
                <td>NIK</td>
                <td>: ${safeString(data.nik)}</td>
              </tr>
              <tr>
                <td>Tempat/Tgl Lahir</td>
                <td>: ${safeString(data.tempat_lahir)}/${data.tanggal_lahir ? formatTanggalIndonesia(data.tanggal_lahir) : '...........................'}</td>
              </tr>
              <tr>
                <td>Alamat</td>
                <td>: ${safeString(data.alamat_lengkap)}</td>
              </tr>
              <tr>
                <td>Tanggal Kematian</td>
                <td>: ${data.tgl_kematian ? formatTanggalIndonesia(data.tgl_kematian) : '...........................'}</td>
              </tr>
              <tr>
                <td>Penyebab Kematian</td>
                <td>: ${safeString(data.penyebab_kematian)}</td>
              </tr>
            </table>

            <p style="text-indent: 40px;">
              Adalah benar warga Desa Bonto Ujung yang telah meninggal dunia sebagaimana keterangan di atas.
            </p>

            <p style="text-indent: 40px; margin-top: 20px;">
              Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.
            </p>
          </div>

          <div style="margin-top: 60px; text-align: right;">
            <p>Kepala Desa Bonto Ujung,</p>
            <div style="margin-top: 80px;">
              <p><strong><u>${safeString(data.ttd_nama)}</u></strong></p>
              <p>NIP. ${safeString(data.nip)}</p>
            </div>
          </div>
        </div>
      `;
    },
    formFields: [
      { name: 'no_surat', label: 'Nomor Surat', type: 'text', placeholder: 'Masukkan Nomor Surat' },
      { name: 'nik', label: 'NIK', type: 'text', placeholder: 'Masukkan NIK', disabled: true },
      { name: 'nama_lengkap', label: 'Nama Lengkap', type: 'text', placeholder: 'Masukkan Nama Lengkap', disabled: true },
      { name: 'tempat_lahir', label: 'Tempat Lahir', type: 'text', placeholder: 'Masukkan Tempat Lahir', disabled: true },
      { name: 'tanggal_lahir', label: 'Tanggal Lahir', type: 'date', placeholder: 'Pilih Tanggal Lahir', disabled: true },
      { name: 'alamat_lengkap', label: 'Alamat Lengkap', type: 'text', placeholder: 'Masukkan Alamat Lengkap', disabled: true },
      { name: 'tgl_kematian', label: 'Tanggal Kematian', type: 'date', placeholder: 'Pilih Tanggal Kematian' },
      { name: 'penyebab_kematian', label: 'Penyebab Kematian', type: 'text', placeholder: 'Masukkan Penyebab Kematian' },
      { name: 'nomor_hp', label: 'Nomor HP', type: 'text', placeholder: 'Masukkan Nomor HP' },
      { name: 'dokumen_url', label: 'Lampiran Dokumen', type: 'file', accept: '.pdf,.jpg,.png' },
      { name: 'ditujukan', label: 'Tujuan Surat', type: 'text', placeholder: 'Masukkan Tujuan Surat' },
      { name: 'ttd_nama', label: 'Nama Penandatangan', type: 'text', placeholder: 'Masukkan Nama Penandatangan' },
      { name: 'nip', label: 'NIP', type: 'text', placeholder: 'Masukkan NIP' }
    ]
  }
};

export default function PermohonanSurat() {
  const [permohonanList, setPermohonanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPermohonan, setSelectedPermohonan] = useState(null);
  const [formData, setFormData] = useState({});
  const [previewContent, setPreviewContent] = useState('');
  const router = useRouter();

  // Fetch daftar permohonan saat komponen dimuat
  useEffect(() => {
    const fetchPermohonan = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.PERMOHONAN_SURAT_GET_ALL, {
          method: 'GET',
          headers: getHeaders(),
        });
        if (!response.ok) throw new Error('Gagal memuat permohonan');
        const data = await response.json();
        setPermohonanList(data);
      } catch (err) {
        setError('Gagal memuat data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPermohonan();
  }, []);

  // Buka form untuk memproses permohonan
  const handleOpenForm = (permohonan) => {
    console.log('Data permohonan:', permohonan); // Debugging
    setSelectedPermohonan(permohonan);
    const template = suratTemplates[permohonan.jenis_surat];
    if (!template) {
      setError(`Template untuk ${permohonan.jenis_surat} tidak ditemukan`);
      return;
    }

    // Format tanggal untuk input date (YYYY-MM-DD)
    const formatDateSafely = (dateValue) => {
      if (!dateValue) return '';
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    };

    // Konversi null/undefined ke string kosong
    const safeFormString = (value) => (value != null ? String(value) : '');

    const formData = {
      nama_lengkap: safeFormString(permohonan.nama_lengkap),
      nik: safeFormString(permohonan.nik),
      alamat_lengkap: safeFormString(permohonan.alamat_lengkap),
      jenis_surat: safeFormString(permohonan.jenis_surat),
      keterangan: safeFormString(permohonan.keterangan),
      status: safeFormString(permohonan.status) || 'Diproses',
      tempat_lahir: safeFormString(permohonan.tempat_lahir),
      tanggal_lahir: formatDateSafely(permohonan.tanggal_lahir),
      dokumen_url: safeFormString(permohonan.dokumen_url),
      no_surat: '',
      ditujukan: safeFormString(permohonan.ditujukan),
      ttd_nama: '',
      nip: '',
      pekerjaan: safeFormString(permohonan.pekerjaan),
      keperluan: safeFormString(permohonan.keperluan),
      nama_usaha: safeFormString(permohonan.nama_usaha),
      jenis_usaha: safeFormString(permohonan.jenis_usaha),
      alamat_usaha: safeFormString(permohonan.alamat_usaha),
      alamat_tujuan: safeFormString(permohonan.alamat_tujuan),
      alasan_pindah: safeFormString(permohonan.alasan_pindah),
      jenis_kelamin: safeFormString(permohonan.jenis_kelamin),
      nama_ayah: safeFormString(permohonan.nama_ayah),
      nama_ibu: safeFormString(permohonan.nama_ibu),
      tgl_kematian: formatDateSafely(permohonan.tgl_kematian),
      penyebab_kematian: safeFormString(permohonan.penyebab_kematian),
      nomor_hp: safeFormString(permohonan.nomor_hp),
    };

    console.log('Form data:', formData); // Debugging
    setFormData(formData);
  };

  // Tutup form
  const handleCloseForm = () => {
    setSelectedPermohonan(null);
    setFormData({});
    setPreviewContent('');
    setError(null);
  };

  // Tangani perubahan input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Tangani upload file
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };


  // Generate preview surat
  const handlePreview = () => {
    if (!selectedPermohonan) {
      setError('Pilih permohonan terlebih dahulu.');
      return null;
    }
    const selectedTemplate = selectedPermohonan.jenis_surat;
    if (!suratTemplates[selectedTemplate]) {
      setError(`Template untuk ${selectedTemplate} tidak ditemukan.`);
      return null;
    }
    if (!Object.keys(formData).length) {
      setError('Isi formulir terlebih dahulu.');
      return null;
    }
    const content = suratTemplates[selectedTemplate].template(formData);
    return content;
  };

  // Tombol Generate Surat
  const handleGenerateSurat = () => {
    if (!selectedPermohonan) {
      setError('Pilih permohonan terlebih dahulu.');
      return;
    }
    try {
      setLoading(true);
      const content = handlePreview();
      if (!content) {
        throw new Error('Gagal menghasilkan preview surat.');
      }
      setPreviewContent(content);
    } catch (err) {
      setError('Gagal generate preview surat: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simpan surat ke server
  const handleSaveSurat = async () => {
    if (!selectedPermohonan || !previewContent) {
      setError('Tidak ada surat untuk disimpan.');
      return;
    }
  
    if (!formData.no_surat) {
      setError('Nomor surat harus diisi.');
      return;
    }
    if (!formData.ditujukan) {
      setError('Tujuan surat harus diisi.');
      return;
    }
    if (!formData.keterangan && !selectedPermohonan.jenis_surat) {
      setError('Perihal atau jenis surat harus diisi.');
      return;
    }
    if (!selectedPermohonan.jenis_surat) {
      setError('Jenis surat harus diisi.');
      return;
    }
  
    try {
      setLoading(true);
  
      let formDataToSend = new FormData();
      formDataToSend.append('id', selectedPermohonan.id);
      formDataToSend.append('nomor', formData.no_surat);
      formDataToSend.append('tanggal', new Date().toISOString().split('T')[0]);
      formDataToSend.append('perihal', formData.keterangan || selectedPermohonan.jenis_surat);
      formDataToSend.append('ditujukan', formData.ditujukan);
      formDataToSend.append('title', selectedPermohonan.jenis_surat);
  
      if (formData.dokumen_url instanceof File) {
        formDataToSend.append('file', formData.dokumen_url);
      } else {
        formDataToSend.append('file', formData.dokumen_url || '');
      }
  
      console.log('Data yang dikirim ke server:');
      for (let pair of formDataToSend.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
  
      // POST surat keluar
      const response = await fetch(API_ENDPOINTS.SURAT_KELUAR_ADD, {
        method: 'POST',
        body: formDataToSend,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Detail kesalahan dari server:', errorData);
        if (errorData.message && errorData.message.includes('nomor')) {
          throw new Error('Nomor surat sudah digunakan, silakan gunakan nomor lain.');
        }
        throw new Error(
          errorData.message || `Gagal menyimpan surat ke server (Status: ${response.status})`
        );
      }
  
      // PATCH status permohonan
      const updateStatusResponse = await fetch(API_ENDPOINTS.PERMOHONAN_SURAT_UPDATE_STATUS(selectedPermohonan.id), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'Selesai' }),
      });
  
      if (!updateStatusResponse.ok) {
        const updateErrorData = await updateStatusResponse.json();
        console.error('Detail kesalahan update status:', updateErrorData);
        throw new Error(
          updateErrorData.message || `Gagal memperbarui status (Status: ${updateStatusResponse.status})`
        );
      }
  
      // Setelah semua sukses
      setPreviewContent('');
      handleCloseForm();
      alert('Surat berhasil disimpan dan status diperbarui.');
    } catch (err) {
      setError('Gagal menyimpan surat: ' + err.message);
      console.error('Kesalahan di handleSaveSurat:', err);
    } finally {
      setLoading(false);
    }
  };
  

  // Cetak surat
  const handlePrint = () => {
    if (!previewContent) {
      alert('Silakan generate preview surat terlebih dahulu.');
      return;
    }

    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);

    printFrame.contentDocument.write(`
      <html>
        <head>
          <title>Cetak ${selectedPermohonan?.jenis_surat || 'Surat'}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              line-height: 1.5; 
              margin: 20px;
            }
            @page { margin: 0; }
          </style>
        </head>
        <body>
          ${previewContent}
        </body>
      </html>
    `);
    printFrame.contentDocument.close();

    printFrame.contentWindow.focus();
    printFrame.contentWindow.print();

    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render error state
  if (error) {
    return (
      <StyledCard>
        <Typography color="error" p={3}>
          {error}
        </Typography>
      </StyledCard>
    );
  }

  return (
    <StyledCard>
      <HeaderBox>
        <Typography variant="h6">Permohonan Surat</Typography>
      </HeaderBox>

      <CardContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : permohonanList.length === 0 ? (
          <Typography align="center" p={4}>
            Tidak ada permohonan surat.
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>NIK</TableCell>
                    <TableCell>Nama</TableCell>
                    <TableCell>Jenis Surat</TableCell>
                    <TableCell>Keterangan</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tanggal</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permohonanList
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((permohonan, index) => (
                      <TableRow key={permohonan.id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{permohonan.nik}</TableCell>
                        <TableCell>{permohonan.nama_lengkap}</TableCell>
                        <TableCell>{permohonan.jenis_surat}</TableCell>
                        <TableCell>{permohonan.keterangan}</TableCell>
                        <TableCell>
                          <Chip
                            label={permohonan.status}
                            color={statusColors[permohonan.status] || 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(permohonan.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenForm(permohonan)}
                            disabled={permohonan.status === 'Selesai'}
                          >
                            Proses
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={permohonanList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </CardContent>

      {/* Dialog Form Processing */}
      <Dialog open={!!selectedPermohonan} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>
          Proses Permohonan Surat: {selectedPermohonan?.jenis_surat}
          <IconButton
            aria-label="close"
            onClick={handleCloseForm}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 2 }}>
            {selectedPermohonan && suratTemplates[selectedPermohonan.jenis_surat]?.formFields.map((field) => (
              <Box key={field.name} sx={{ mb: 2 }}>
                <Typography component="label" htmlFor={field.name} sx={{ display: 'block', mb: 1, fontWeight: 500 }}>
                  {field.label}
                </Typography>
                {field.type === 'file' ? (
                  <input
                    id={field.name}
                    name={field.name}
                    type="file"
                    accept={field.accept}
                    onChange={handleFileChange}
                    style={{ marginTop: '8px', display: 'block' }}
                  />
                ) : (
                  <TextField
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    type={field.type === 'date' ? 'date' : 'text'}
                    multiline={field.type === 'textarea'}
                    rows={field.type === 'textarea' ? 4 : 1}
                    fullWidth
                    variant="outlined"
                    disabled={field.disabled}
                    InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#ccc' },
                        '&:hover fieldset': { borderColor: '#999' },
                        '&.Mui-focused fieldset': { borderColor: '#1976d2' },
                      },
                    }}
                  />
                )}
              </Box>
            ))}
            <TextField
              label="Keterangan"
              name="keterangan"
              value={formData.keterangan || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                name="status"
                value={formData.status || 'Diproses'}
                onChange={handleInputChange}
                label="Status"
                disabled={loading}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Batal</Button>
          <Button
            onClick={handleGenerateSurat}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Preview Surat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Preview Surat */}
      <Dialog open={!!previewContent} onClose={() => setPreviewContent('')} maxWidth="lg" fullWidth>
        <DialogTitle>
          Preview Surat
          <IconButton
            aria-label="close"
            onClick={() => setPreviewContent('')}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div dangerouslySetInnerHTML={{ __html: previewContent }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewContent('')}>Kembali</Button>
          <Button
            onClick={handleSaveSurat}
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            Simpan
          </Button>
          <Button
            onClick={handlePrint}
            variant="contained"
            color="primary"
            startIcon={<PrintIcon />}
          >
            Cetak Surat
          </Button>
        </DialogActions>
      </Dialog>
    </StyledCard>
  );
}