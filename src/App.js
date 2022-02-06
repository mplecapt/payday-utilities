import './App.css';
import crimenet from './crimenet.jpg';
import UserData from './UserData';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import SelectUser from './SelectUser';

export default function App() {
	return (
		<>
			<nav>
				<NavLink to="view">
					<li>Home</li>
				</NavLink>
				<NavLink to="view/76561198049201876">
					<li>Example</li>
				</NavLink>
			</nav>
			<div style={Style.back}>
				<Routes>
					<Route index element={<Navigate to="/view" />} />
					<Route path="view/:user" element={<UserData />} />
					<Route path="view" element={<SelectUser />} />
					<Route path="*" element={<h1>:404</h1>} />
				</Routes>
			</div>
		</>
	);
}

const Style = {
	back: {
		backgroundImage: `url(${crimenet})`,
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover',
		width: '100vw',
		height: '100vh',
		overflow: 'hidden',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}
}