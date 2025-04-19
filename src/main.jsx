import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ArcadeLeaderboard from "@/components/ArcadeLeaderboard.jsx";
import EvolutionBuilder from "@/App.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EvolutionBuilder></EvolutionBuilder>
  </StrictMode>,
)
