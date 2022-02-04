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
		console.log(prog);
		/*
		const tests = [
			// four man crew
			{ regx: /.*(four man crew)|(four players)/gi, symbol: '4', value: 'Four man crew required'},
			// Get Heist name
			{ regx: /(?<= the )((?!.*(armored)|(plans)|(train)).+?)((?= job[^s])|(?= heist\W))/gi },
			// Edge: escape heists
			{ regx: /(?!.*job,)(?<= the ).*? escape(?=,)/gi },
			// Edge: armored transport general
			{ regx: /armored transport/gi },
			// Edge: Not directly named
			{ regx: /.*(floyd)|(bobblehead bob)/gi, symbol: 'Big Bank', value: 'Big Bank'},
			{ regx: /Panic Room/gi, symbol: 'Panic Room', value: 'Panic Room'},
			{ regx: /homeless/gi, symbol: 'Aftershock', value: 'Aftershock'},
			{ regx: /churro/gi, symbol: "Buluc's Mansion", value: "Buluc's Mansion"},

		]
		prog.achievements.forEach(a => {
			// perform each test
			tests.forEach(t => {
				const matches = a.description?.match(t.regx);
				if (matches)
					// add each match found
					matches.forEach(m => {
						const sym = t.symbol ? t.symbol : m;
						if (sym.includes("Celebrating")) return;
						// if tokens does not alread contain the new token
						if (a.tokens.filter(t => t.symbol === sym).length === 0)
							// add new token
							a.tokens.push({
								symbol: sym,
								value: t.value ? t.value : m
							})
					})
			});
		});
		*/

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
					{data.tokens.map(t => (
						<span key={t.symbol} className='token'>{t.symbol}</span>
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
	let progress = [];
	const regx = /(?!.*job.+ on)(?:(?<=Complete (?=The ))|(?<=Complete the ))(.*?)(?: job)? on the (.*?) difficulty(?:.*(One Down))*/g;
	schema.game.availableGameStats.achievements
		.filter(a => (a.description && regx.test(a.description)))
		.forEach((a, i) => {
			const achieved = player.playerstats.achievements[i].achieved === 1;
			const matches = a.description.match(regx);

			
		});

	const output = {
		gameName: player.playerstats.gameName,
		steamid: player.playerstats.steamID,
		progress: progress,
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
				tokens: heists.filter(h => (new RegExp(h).test(a.description))).map(h => (
					{ symbol: h, value: h }
				))
			}
		}),
	}

	return output;
}

const diffs = [
	'Normal',
	'Hard',
	'Very Hard',
	'OVERKILL',
	'Mayhem',
	'Death Wish',
	'Death Sentence',
	'One Down',
]