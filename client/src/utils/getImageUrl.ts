import { API_URL } from '../config/api';

export function getImageUrl(path: string | undefined | null) {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}
