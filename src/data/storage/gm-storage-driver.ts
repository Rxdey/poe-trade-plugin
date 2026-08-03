import { GM_deleteValue, GM_getValue, GM_setValue } from '$';
import type { StorageDriver } from './storage-driver';

export class GmStorageDriver implements StorageDriver {
    async get<T>(key: string, fallbackValue: T): Promise<T> {
        return GM_getValue<T>(key, fallbackValue);
    }

    async set<T>(key: string, value: T): Promise<void> {
        GM_setValue(key, value);
    }

    async remove(key: string): Promise<void> {
        GM_deleteValue(key);
    }
}
