/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_NAME: string
    readonly VITE_APP_TAGLINE: string
    readonly VITE_APP_URL: string
    readonly VITE_CONTACT_EMAIL: string
    readonly VITE_CONTACT_PHONE: string
    readonly VITE_CONTACT_ADDRESS: string
    readonly VITE_SOCIAL_FACEBOOK: string
    readonly VITE_SOCIAL_TWITTER: string
    readonly VITE_SOCIAL_INSTAGRAM: string
    readonly VITE_API_URL: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

declare module '*.png' {
    const value: string;
    export default value;
}
