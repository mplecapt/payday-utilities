import './App.css';
import PlayerProgress from './PlayerProgress';
import crimenet from './crimenet.jpg';

const user = '76561198049201876';

export default function App() {
	return (
		<div style={{backgroundImage: `url(${crimenet})`}}>
			<PlayerProgress steamid={user} />
		</div>
	);
}
