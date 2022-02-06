import { useState } from 'react';
import { UnmountClosed } from 'react-collapse';

/**
 * Compnent responsible for filtering achievement list based on criteria provided
 * @param {Object} progress Object containing player data 
 * @param {Object} filterBy Object containing criteria to filter output with
 */
export default function PlayerProgress({progress, filterBy}) {
	const [openIdx, setOpenIdx] = useState();

	return (
		<div className='progress-list'>
			{progress.achievements.filter(a => {
					const filter = filterBy;
					
					const inc = new RegExp(filter.include, 'gi');
					const exc = new RegExp(filter.exclude, 'gi');
					const res = {
						inc: (filter.include && filter.include !== "") ? {
							name: inc.test(a.displayName),
							desc: inc.test(a.description),
						} : { name: true, desc: true },
						exc: (filter.exclude && filter.exclude !== "") ? {
							name: exc.test(a.displayName),
							desc: exc.test(a.description),
						} : { name: false, desc: false },
					}

					return (
						// must exclude already achieved cards
						(filter.removeComplete && !a.achieved) || !filter.removeComplete
					) && (
						// name or description includes exact search terms
						(res.inc?.name || res.inc?.desc) && (!res.exc?.name || !res.exc?.desc)
					) && (
						// must include 4 man crew token
						(filter.fourman === 'mustInclude' && a.tokens.some(t => t.symbol === '4')) ||
						// must exclude 4 man crew token
						(filter.fourman === 'exclude' && !a.tokens.some(t => t.symbol === '4')) ||
						// ignore 4 man crew token
						(filter.fourman !== 'mustInclude' && filter.fourman !== 'exclude')
					) && (
						// select a heist
						filter.heist === '' || 
						(filter.heist === 'none' && !a.tokens.some(t => t.symbol === 'H')) ||
						a.tokens.some(t => t.value === filter.heist)
					) && (
						// select a difficulty
						filter.diff === '' ||
						(filter.diff === 'none' && !a.tokens.some(t => t.symbol === 'D')) ||
						(filter.diff === 'any' && a.tokens.some(t => t.symbol === 'D')) ||
						a.tokens.some(t => t.value === filter.diff)
					) && (
						// filter for all progression achievements (not just difficulty)
						(filter.showProgress === 'mustInclude' && progress.contributers.includes(a.name)) ||
						(filter.showProgress === 'exclude' && !progress.contributers.includes(a.name)) ||
						(filter.showProgress !== 'mustInclude' && filter.showProgress !== 'exclude')
					)
				}).map((a, i, arr) => (
					<Card key={a.name} data={a} isOpen={a.name === openIdx} 
						onClick={()=>setOpenIdx(a.name === openIdx ? null : a.name)} 
						z={(arr.length - i) * 2}
					/>
				))}
		</div>
	)
}

/**
 * Component that displays specific achievement data
 * @param {Object} achievement data 
 * @returns 
 */
function Card({ data, isOpen, onClick, z }) {
	return (
		<div className="card-top">
			<div className='card' onClick={onClick} style={{zIndex: z}}>
				<div className='data-container'>
					<img className='card-img' alt={data.name} src={(data.achieved) ? data.icon : data.icongray} />
					<span className='card-name'>{data.displayName}</span>
					<span className='card-date'>{data.achieved && (new Date(data.unlocktime * 1000)).toLocaleString()}</span>
				</div>
				{data.tokens && data.tokens.length > 0 && (
					<div className='token-container'>
						{data.tokens.map((t, i) => (
							<span className='token' key={i}>
								{t.symbol}
								<span className='tokentext'>{t.value}</span>
							</span>
						))}
					</div>
				)}
			</div>
			{data.description && 
			<div className='collapse-container' style={{zIndex: z-1}}>
				<UnmountClosed isOpened={isOpen}>
					{data.description}
				</UnmountClosed>
			</div>
			}
		</div>	
	)
}