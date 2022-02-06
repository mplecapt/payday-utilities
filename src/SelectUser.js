import { Field, Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";

const INIT_STATE = {
	user: '',
}

export default function SelectUser() {
	let nav = useNavigate();

	return (
		<Formik 
			initialValues={INIT_STATE}
			onSubmit={(values) => {
				nav(`/view/${values.user}`, {replace: true,});
			}}
		>
			<Form>
				<h1>Payday 2<br/>Achievement Manager</h1>
				<label>Steam ID: </label><br/>
				<Field type='text' name='user' /><br/>
				<button type='submit'>Submit</button>
			</Form>
		</Formik>
	);
}