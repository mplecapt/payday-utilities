import { Component } from 'react';
import { API } from 'aws-amplify';
import API_KEY from './steam';

export default class PlayerProgress extends Component {
	constructor(props) {
		super(props);
		this.state = { progress: null }
	}

	async componentDidMount() {
		this.setState({
			progress: await GetPlayerProgress(this.props.steamid)
		})
	}

	render() {
		if (!this.props.steamid) {
			console.log("Error! No steamid set");
			return <></>;
		}
		if (!this.state.progress) return <h3 style={{color: 'white'}}>Loading...</h3>
		return (
			<div className='progress-list'>
				{this.state.progress.achievements.filter(a => {
					const filter = this.props.filterBy;
					return (
						(filter.removeComplete && !a.achieved) ||
						!filter.removeComplete
					) &&
					(
						contains(a.displayName, filter.search) ||
						(!a.hidden && contains(a.description, filter.search))
					)
				}).map(a => (
					<Card key={a.name} data={a} />
				))}
			</div>
		)
	}
}

/*
	- add markers for different flags (4 man, mission specific, weapon specific, difficulties[not necessary])
*/

function contains(str1, str2) {
	return str1.toLowerCase().includes(str2.toLowerCase())
}

function Card({ data }) {
	return (
		<div className='card'>
			<div className='tooltip'>
				<img className='card-img' alt={data.name} src={(data.achieved) ? data.icon : data.icongray} />
				{data.description && <span className='tooltiptext'>{data.description}</span>}
			</div>
			<span className='card-name'>{data.displayName}</span>
			<span className='card-date'>{data.achieved && (new Date(data.unlocktime * 1000)).toLocaleString()}</span>
		</div>
	)
}

/**
 * Fetch the player achievements and game schema from the SteamAPI using aws-amplify REST calls
 * @param {string} userid the steamid used to request data
 * @returns a formatted object representing player achievement progress
 */
async function GetPlayerProgress(userid) {
	const schema = await API.get('SteamAPI', `/call/GetSchemaForGame/v2/${API_KEY}/218620/${userid}`)
		.catch(error => {
			console.log("Error fetching Schema!", error)
		})
	//console.log(schema);
	const player = await API.get('SteamAPI', `/call/GetPlayerAchievements/v1/${API_KEY}/218620/${userid}`)
		.catch(error => {
			console.log("Error fetching player data!", error)
		})
	//console.log(player);

	return {
		gameName: player.playerstats.gameName,
		steamid: player.playerstats.steamID,
		achievements: schema.game.availableGameStats.achievements.map((a, i) => {
			if (a.name !== player.playerstats.achievements[i].apiname) {
				console.log('Achievement list mismatch', a.name, player.playerstats.achievements[i].apiname);
				return null;
			}
			return {
				name: a.name,
				displayName: a.displayName,
				description: a.description,
				hidden: a.hidden === 1,
				icon: a.icon,
				icongray: a.icongray,
				achieved: player.playerstats.achievements[i].achieved === 1,
				unlocktime: player.playerstats.achievements[i].unlocktime,
			}
		})
	}
}