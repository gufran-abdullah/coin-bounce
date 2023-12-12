import Navbar from "./components/Navbar/Navbar";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import styles from "./App.module.css";

function App() {
  return (
    <div className={styles.container}>
		<BrowserRouter>
			<div className={styles.layouts}>
				<Navbar />
				<Routes>
					<Route path="/" exact element = {<div className={styles.main}><Home /></div>} />
				</Routes>
				<Footer />
			</div>
		</BrowserRouter>
	</div>
  );
}

export default App;
