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

export default StoredString;