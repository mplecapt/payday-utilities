import { Component } from "react"
import PlayerProgress from './PlayerProgress';

const INIT_STATE = {
	search: '',
	removeComplete: false,
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
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

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
				<form onSubmit={this.handleSubmit}>
					<div>
						<input type='text' name='search' value={this.state.search} onChange={this.handleChange} placeholder="Search..." />
					</div>
					<div>
						<input type='checkbox' name='removeComplete' checked={this.state.removeComplete} onChange={this.handleChange} />
						<label htmlFor="removeComplete" style={{color: 'white'}}>Incomplete Only</label>
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