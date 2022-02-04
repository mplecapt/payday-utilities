import { Component } from 'react';
import { API } from 'aws-amplify';
import API_KEY from './steam';

export default class PlayerProgress extends Component {
	constructor(props) {
		super(props);
		this.state = { progress: null }
	}

	async componentDidMount() {
		let prog = await GetPlayerProgress(this.props.steamid);
		this.setState({
			progress: prog
		})
	}

	render() {
		if (!API_KEY) {
			console.log("Error! No apikey set");
			return <></>;
		}
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
						// must exclude already achieved cards
						(filter.removeComplete && !a.achieved) ||
						!filter.removeComplete
					) &&
					(
						// name or description includes exact search terms
						contains(a.displayName, filter.search) ||
						(!a.hidden && contains(a.description, filter.search))
					) &&
					(
						// must include 4 man crew token
						(filter.fourman === 'mustInclude' && a.tokens.some(t => t.symbol === '4')) ||
						// must exclude 4 man crew token
						(filter.fourman === 'exclude' && !a.tokens.some(t => t.symbol === '4')) ||
						// ignore 4 man crew token
						(filter.fourman !== 'mustInclude' && filter.fourman !== 'exclude')
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
			<div className='data-container'>
				<div className='tooltip'>
					<img className='card-img' alt={data.name} src={(data.achieved) ? data.icon : data.icongray} />
					{data.description && <span className='tooltiptext'>{data.description}</span>}
				</div>
				<span className='card-name'>{data.displayName}</span>
				<span className='card-date'>{data.achieved && (new Date(data.unlocktime * 1000)).toLocaleString()}</span>
			</div>
			{data.tokens && data.tokens.length > 0 && (
				<div className='token-container'>
					{data.tokens.map((t, i) => (
						<span key={t.symbol + i} className='token'>
							{t.symbol}
						</span>
					))}
				</div>
			)}
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

	// generate player heist completion progress
	let heistProgress = {};
	let heistList = [];
	const regx = /(?!.*job.+ on)(?:(?<=Complete (?=The ))|(?<=Complete the ))(.*?)(?: job)? on the (.*?) difficulty(?:.*(One Down))*/g;
	schema.game.availableGameStats.achievements
		.forEach((a, i) => {
			if (player.playerstats.achievements[i].apiname !== a.name) {
				console.log('Arrays unaligned!');
				return;
			}
			// edge cases
			if (
				!a.description ||
				a.name === 'dec21_01' ||
				a.name === 'cac_30' ||
				a.name === 'fish_4'
			) return;

			// is it a difficulty achievement
			const matches = [...a.description.matchAll(regx)];
			if (!matches || (matches && matches.length === 0)) return;

			// add heist to lists if it isn't there already
			if (!heistProgress[matches[0][1]]) {
				heistList.push(matches[0][1]);
				heistProgress[matches[0][1]] = {
					name: matches[0][1],
					complete: {
						normal: false,
						hard: false,
						veryhard: false,
						overkill: false,
						mayhem: false,
						deathwish: false,
						deathsentence: false,
						onedown: false
					}
				}
			}

			// update completion for difficulty
			const achieved = player.playerstats.achievements[i].achieved === 1;
			const diff = (matches[0][3] ? matches[0][3] : matches[0][2]).toLowerCase().replace(' ', '');
			heistProgress[matches[0][1]].complete[diff] = achieved;
			if (diff === 'deathsentence') heistProgress[matches[0][1]].icon = a.icon;
		});

	const tests = [
		{ regx: /(four man crew)|(four players)/gi, symbol: '4', value: '4 man crew required'},
		// Edge: Not directly named
		{ regx: /.*(floyd)|(bobblehead bob)/gi, symbol: 'The Big Bank', value: 'The Big Bank'},
		{ regx: /homeless/gi, symbol: 'Aftershock', value: 'Aftershock'},
		{ regx: /churro/gi, symbol: "Buluc's Mansion", value: "Buluc's Mansion"},
		{ regx: /escape/gi, symbol: "Esc", value: "Escape" },
	]

	// generate achievement information
	const output = {
		gameName: player.playerstats.gameName,
		steamid: player.playerstats.steamID,
		progress: heistProgress,
		achievements: schema.game.availableGameStats.achievements.map((a, i) => {
			if (a.name !== player.playerstats.achievements[i].apiname) {
				console.log('Achievement list mismatch', a.name, player.playerstats.achievements[i].apiname);
				return null;
			}

			const tokens = heistList
				.filter(h => (new RegExp(h, 'gi').test(a.description)))
				.map(h => ({ symbol: 'H', value: h, src: heistProgress[h].icon }));

			tests.forEach(t => {
				if (a.description && t.regx.test(a.description))
					tokens.push({ symbol: t.symbol, value: t.value });
			});

			return {
				name: a.name,
				displayName: a.displayName,
				description: a.description,
				hidden: a.hidden === 1,
				icon: a.icon,
				icongray: a.icongray,
				achieved: player.playerstats.achievements[i].achieved === 1,
				unlocktime: player.playerstats.achievements[i].unlocktime,
				tokens: tokens,
			}
		}),
	}

	return output;
}