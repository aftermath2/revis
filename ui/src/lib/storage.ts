/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import secureLocalStorage from 'react-secure-storage';

class StoredString<Type> {
    private readonly key: string;

    constructor(key: string) {
        this.key = key;
    }

    get(): Type | undefined {
        return localStorage.getItem(this.key) as Type;
    }

    set(value: string) {
        localStorage.setItem(this.key, value);
    }

    remove() {
        localStorage.removeItem(this.key);
    }
}

class EncryptedStoredString<Type> {
    private readonly key: string;
    private secureStorageAvailable: boolean = false;

    constructor(key: string) {
        this.key = key;

        try {
            const testKey = '__secure_storage_test__';
            const testValue = 'test'
            secureLocalStorage.setItem(testKey, testValue);
            const retrieved = secureLocalStorage.getItem(testKey);
            secureLocalStorage.removeItem(testKey);
            this.secureStorageAvailable = retrieved === testValue;
        } catch {
            this.secureStorageAvailable = false;
        }
    }

    get(): Type | undefined {
        if (this.secureStorageAvailable) {
            return secureLocalStorage.getItem(this.key) as Type;
        } else {
            return localStorage.getItem(this.key) as Type;
        }
    }

    set(value: string) {
        if (this.secureStorageAvailable) {
            secureLocalStorage.setItem(this.key, value);
        } else {
            localStorage.setItem(this.key, value);
        }
    }

    remove() {
        if (this.secureStorageAvailable) {
            secureLocalStorage.removeItem(this.key);
        } else {
            localStorage.removeItem(this.key);
        }
    }
}

export {
    StoredString,
    EncryptedStoredString
}