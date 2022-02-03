import { Component } from "react"
import PlayerProgress from './PlayerProgress';

const INIT_STATE = {
	search: '',
	removeComplete: false,
	fourman: 'canInclude',
}

export default class SearchForm extends Component {
	constructor(props) {
		super(props);
		this.state = INIT_STATE;

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleReset = this.handleReset.bind(this);
	}

	handleChange(event) {
		const target = event.target;
		let value = target.type === 'checkbox' && target.name !== 'fourman' ? target.checked : target.value;
		const name = target.name;

		if (name === 'fourman' && value === this.state.fourman) 
			value = 'canInclude';

		this.setState({
			[name]: value
		});
	}

	handleReset(event) {
		this.setState(INIT_STATE);
		event.preventDefault();
	}

	handleSubmit(event) {
		alert(JSON.stringify(this.state));
		event.preventDefault();
	}

	render() {
		return (
			<>
				<form onSubmit={this.handleSubmit} style={{color: 'white'}}>
					<div>
						<input type='text' name='search' value={this.state.search} onChange={this.handleChange} placeholder="Search..." />
					</div>
					<div>
						<label>
							<input type='checkbox' name='removeComplete' checked={this.state.removeComplete} onChange={this.handleChange} />
							Incomplete Only
						</label>
					</div>
					<div>
						<label>4 Man Crews: </label>
						<label>
							<input type='checkbox' name='fourman' value='mustInclude' checked={this.state.fourman === 'mustInclude'} onChange={this.handleChange} />
							Must Include
						</label>
						<label>
							<input type='checkbox' name='fourman' value='exclude' checked={this.state.fourman === 'exclude'} onChange={this.handleChange} />
							Exclude
						</label>
					</div>
					<div>
						<button type='reset' onClick={this.handleReset}>Reset</button>
						<button type='submit'>Submit</button>
					</div>
				</form>
				<div className="scrollarea">
					<PlayerProgress steamid={this.props.steamid} filterBy={this.state} />
				</div>
			</>
		)
	}
}