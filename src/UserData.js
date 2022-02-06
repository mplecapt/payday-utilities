import { API } from 'aws-amplify';
import API_KEY from './steam';
import SearchForm from './Search';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function UserData() {
	let [progress, setProgress] = useState();
	let {user} = useParams();

	useEffect(() => {
		async function waiter() {
			setProgress(await GetPlayerProgress(user));
		}
		waiter();
	}, [user])

	if (progress && progress.error) return <h2>Profile is not public</h2>

	return progress
		? <SearchForm progress={progress} />
		: <h3>Loading...</h3>
}

/**
 * Fetch the player achievements and game schema from the SteamAPI using aws-amplify REST calls
 * Makes two calls to steam API: GetSchemaForGame and GetPlayerAchievements
 * Formats data, and tags data with identifying flags on initial load
 * 
 * Does all processing whenver site is reloaded, so data is always fresh, but requires the browser
 * to do a lot of processing
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

	if (!player.playerstats.success) {
		console.log("User is not public");
		return player.playerstats;
	}

	// generate player heist completion progress
	let heistProgress = {};
	let progressContributers = [];
	let heistList = [];
	const regx = /(?!.*job.+ on)(?:(?<=Complete (?=The ))|(?<=Complete the ))(.*?)(?: job)? on the (.*?) difficulty(?:.*(One Down))*/g;
	schema.game.availableGameStats.achievements
		.forEach((a) => {
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
			if (matches[0][1] === 'Alesso Heist') {
				matches[0][1] = 'The Alesso Heist';
			}
			if (!heistProgress[matches[0][1]]) {
				heistList.push(matches[0][1]);
				heistProgress[matches[0][1]] = {
					name: matches[0][1],
					complete: {
						normal: 		'',
						hard: 			'',
						veryhard: 		'',
						overkill: 		'',
						mayhem: 		'',
						deathwish: 		'',
						deathsentence:	'',
						onedown: 		''
					},
				}
			}

			// update completion for difficulty
			const diff = (matches[0][3] ? matches[0][3] : matches[0][2]).toLowerCase().replace(' ', '');
			heistProgress[matches[0][1]].complete[diff] = a.name;
			progressContributers.push(a.name);
		});

	const tests = [
		{ regx: /(four man crew)|(four players)/gi, symbol: '4', value: '4 man crew required'},
		// Edge: Not directly named
		{ regx: /.*(floyd)|(bobblehead bob)/gi, symbol: 'H', value: 'The Big Bank'},
		{ regx: /homeless/gi, symbol: 'H', value: 'Aftershock'},
		{ regx: /churro/gi, symbol: "H", value: "Buluc's Mansion"},
		// More tokens
		//{ regx: /the \w+? esc/gi, symbol: "Esc", value: "Escape" },
		//{ regx: /reputation level/gi, symbol: 'L', value: 'Reputation requirement'},
	]

	const dif = [
		'Normal',
		'Hard', 
		'Very Hard',
		'OVERKILL',
		'Mayhem',
		'Death Wish', 
		'Death Sentence', 
		'One Down',
	];

	heistList.sort((a, b) => {
		const a1 = a.split(" ");
		const b1 = b.split(" ");

		const a2 = (a1[0] === 'The' ? a1.slice(1).join(" ") : a)
		const b2 = (b1[0] === 'The' ? b1.slice(1).join(" ") : b)

		if (a2 > b2) return 1;
		if (a2 < b2) return -1;
		return 0;
	});

	// generate achievement information
	const output = {
		gameName: player.playerstats.gameName,
		steamid: player.playerstats.steamID,
		progress: heistProgress,
		contributers: progressContributers,
		heistList: heistList,
		diffList: dif,
		achievements: schema.game.availableGameStats.achievements.map((a, i) => {
			if (a.name !== player.playerstats.achievements[i].apiname) {
				console.log('Achievement list mismatch', a.name, player.playerstats.achievements[i].apiname);
				return null;
			}

			// Mark heist specifier tokens
			const tokens = heistList
				.filter(h => (new RegExp(`${h}(?!")`, 'gi').test(a.description)))
				.map(h => ({ symbol: 'H', value: h }));

			// difficulty specifier tokens
			let re = dif.map(d => ({ symbol: 'D', value: d })).filter(d => (
				d.value === 'One Down' 
				? new RegExp(`the One Down mechanic`, 'gi').test(a.description)
				: new RegExp(`the ${d.value} difficulty(?!.*One Down)`, 'gi').test(a.description)
			));
			tokens.push(...re);

			// generic test tokens
			tests.forEach(t => {
				if (a.description && t.regx.test(a.description))
					tokens.push({ symbol: t.symbol, value: t.value });
			});

			if (tokens.some(t => (t.value === 'Lab Rats'))) {
				tokens.some((t, i) => {
					if (t.value === 'Rats') {
						tokens.splice(i, 1);
						return true;
					} return false;
				})
			}

			if (!a.description) a.description = '??? Hidden Achievement';

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