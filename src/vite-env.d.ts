/// <reference types="vite/client" />

declare module '*.csv?url' {
  const url: string
  export default url
}

declare module '*.geojson?url' {
  const url: string
  export default url
}
