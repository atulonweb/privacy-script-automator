
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root using ReactDOM's createRoot API
const root = createRoot(document.getElementById("root")!)
root.render(<App />);
