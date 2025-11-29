interface ViteTypeOptions {
  // By adding this line, you can make the type of ImportMetaEnv strict
  // to disallow unknown keys.
  // strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_NOSTR_PUBLIC_KEY: string
  readonly VITE_LNURL_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}