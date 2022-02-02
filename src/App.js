import './App.css';
import crimenet from './crimenet.jpg';
import SearchForm from './Search';

const user = '76561198049201876';

export default function App() {
	return (
		<div style={Style.back}>
			<SearchForm steamid={user} />
		</div>
	);
}

const Style = {
	back: {
		backgroundImage: `url(${crimenet})`,
		backgroundRepeat: 'no-repeat',
		backgroundSize: 'cover',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		height: '100vh',
	}
}