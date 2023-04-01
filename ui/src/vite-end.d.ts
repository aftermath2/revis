interface ImportMetaEnv {
  readonly VITE_NOSTR_PUBLIC_KEY: string
  readonly VITE_LNURL_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}