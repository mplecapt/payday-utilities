
export default function PlayerProgress({progress, filterBy}) {
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
							desc: inc.test(a.description),
						} : { name: false, desc: false },
					}

					return (
						// must exclude already achieved cards
						(filter.removeComplete && !a.achieved) || !filter.removeComplete
					) && (
						// name or description includes exact search terms
						(res.inc?.name || res.inc?.desc) && (!res.exc?.name || !res.inc?.desc)
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
						a.tokens.some(t => t.value === filter.diff)
					)
				}).map(a => (
					<Card key={a.name} data={a} />
				))}
		</div>
	)
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
						<span className='token' key={i}>
							{t.symbol}
							<span className='tokentext'>{t.value}</span>
						</span>
					))}
				</div>
			)}
		</div>
	)
}