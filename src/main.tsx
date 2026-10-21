import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app"
import "@fontsource/newsreader/latin-400.css"
import "@fontsource/newsreader/latin-500.css"
import "@fontsource/newsreader/latin-400-italic.css"
import "@fontsource/source-serif-4/latin-400.css"
import "@fontsource/source-serif-4/latin-ext-400.css"
import "@fontsource/old-standard-tt/latin-400.css"
import "./index.css"

const root = document.getElementById("root")
if (!root) {
  throw new Error("Missing #root element")
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
