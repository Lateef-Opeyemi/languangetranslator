import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Translator from "./pages/languangetranslator"

const App = () => {
  return (
    <div className="">
      <Router>
        <Routes>
          <Route path="/" element={<Translator />} />
        </Routes>
      </Router>
    </div>
  )
}
export default App;