import { API_URL } from '../config/api';

export function getImageUrl(path: string | undefined | null) {
    if (!path) return '';

    // If it's a localhost URL from the backend, extract the filename and rebuild it
    if (path.startsWith('http://localhost:3001/uploads/')) {
        const filename = path.split('/').pop();
        return `${API_URL}/uploads/${filename}`;
    }

    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
