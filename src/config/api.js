'use client';

export const API_BASE_URL = "http://localhost:8088/api";


export const API_ENDPOINTS = {
    // Surat Keluar endpoints
    SURAT_KELUAR_ADD: `${API_BASE_URL}/suratkeluar`,
    SURAT_KELUAR_GET_ALL: `${API_BASE_URL}/suratkeluar`,
    SURAT_KELUAR_GET_BY_ID: (id) => `${API_BASE_URL}/suratkeluar/get/${id}`,
    SURAT_KELUAR_UPDATE: (id) => `${API_BASE_URL}/suratkeluar/${id}`,
    SURAT_KELUAR_DELETE: (id) => `${API_BASE_URL}/suratkeluar/delete/${id}`,
    SURAT_KELUAR_COUNT: `${API_BASE_URL}/suratkeluar/count`,

    // Surat Masuk endpoints
    SURAT_MASUK_ADD: `${API_BASE_URL}/suratmasuk`,
    SURAT_MASUK_GET_ALL: `${API_BASE_URL}/suratmasuk`,
    SURAT_MASUK_GET_BY_ID: (id) => `${API_BASE_URL}/suratmasuk/get/${id}`,
    SURAT_MASUK_UPDATE: (id) => `${API_BASE_URL}/suratmasuk/update/${id}`,
    SURAT_MASUK_DELETE: (id) => `${API_BASE_URL}/suratmasuk/delete/${id}`,
    SURAT_MASUK_COUNT: `${API_BASE_URL}/suratmasuk/count`,

    // Permohonan Surat endpoints
    PERMOHONAN_SURAT_ADD: `${API_BASE_URL}/permohonansurat`,
    PERMOHONAN_SURAT_GET_ALL: `${API_BASE_URL}/permohonansurat`,
    PERMOHONAN_SURAT_GET_BY_ID: (id) => `${API_BASE_URL}/permohonansurat/${id}`,
    PERMOHONAN_SURAT_UPDATE: (id) => `${API_BASE_URL}/permohonansurat/${id}`,
    PERMOHONAN_SURAT_UPDATE_STATUS: (id) => `${API_BASE_URL}/permohonansurat/patch/${id}`,


};

export const getHeaders = () => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    return headers;
};