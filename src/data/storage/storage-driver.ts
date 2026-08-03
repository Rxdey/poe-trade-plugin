export interface StorageDriver {
    get<T>(key: string, fallbackValue: T): Promise<T>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
}
