import PlayerProgress from "./PlayerProgress";
import { Formik, Form, Field } from "formik";

const INIT_STATE = {
	include: '',
	exclude: '',
	removeComplete: false,
	fourman: 'canInclude',
	diff: '',
	heist: '',
}

export default function SearchForm({progress}) {
	return (
		<Formik
			initialValues={INIT_STATE}
			validate={(values) => {

			}}
			onSubmit={(values) => {
				alert(JSON.stringify(values));
			}}
		>
		{({values}) => (
			<div className="search-container">
				<Form className="query-form">
					<div>
						<label>Includes <Field name='include' type='text' /></label><br />
						<label>Excludes <Field name='exclude' type='text' /></label>
					</div>
					<div>
						<label><Field type='checkbox' name='removeComplete' /> Incomplete Only</label>
						<div>
							<label>Requires 4 Players: </label>
							<label><Field type='radio' name='fourman' value='mustInclude' /> True</label>
							<label><Field type='radio' name='fourman' value='exclude' /> False</label>
							<label><Field type='radio' name='fourman' value='canInclude' hidden /> 	<span className="clear">&times;</span></label>
						</div>
						<label>
							Heist <Field as='select' name='heist'>
								<option value='' />
								<option value='none'>~Unspecified~</option>
								{progress.heistList.map(h => (<option value={h} key={h}>{h}</option>))}
							</Field>
						</label><br/>
						<label>
							Difficulty <Field as='select' name='diff'>
								<option value='' />
								<option value='none'>~Unspecified~</option>
								{progress.diffList.map(d => (<option value={d} key={d}>{d}</option>))}
							</Field>
						</label>
					</div>
					<div>
						<button type='reset'>Reset</button><br/>
						<button type='submit'>Submit</button>
					</div>
				</Form>
				<div className="scrollarea">
					<PlayerProgress progress={progress} filterBy={values} />
				</div>
			</div>
		)}
		</Formik>
	)
}