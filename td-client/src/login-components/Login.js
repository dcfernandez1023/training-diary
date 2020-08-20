import React, { Component } from 'react';
import axios from 'axios';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Form from 'react-bootstrap/Form';
import Figure from 'react-bootstrap/Figure';
import DatePicker from "react-datepicker";
import subDays from "date-fns/subDays";
import subYears from "date-fns/subYears";
import "react-datepicker/dist/react-datepicker.css";
import { BrowserRouter as Router, Link } from 'react-router-dom';

class Login extends Component {
	
	state = {
		validated: false,
		
		onLogin: true,
		
		loginUsername: "",
		loginPassword: "",
	
		registerUsername: "",
		registerPassword: "",
		email: "",
		birthday: null,
	}
	
	handleLoginResponse = (response) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				this.props.grantAccess(this.state.loginUsername, response.headers.token);
				//saves token and username to browser's local storage 
				localStorage.setItem("token", response.headers.token);
				localStorage.setItem("username", this.state.loginUsername);
			}
		}
		catch(error) {
			this.props.toggleAuthLoader();
		}
	}
	
	//login onClick event handler
	login = () => {
		//checks to make sure username and password fields have values 
		if(this.state.loginUsername.toString().trim().length === 0 || this.state.loginPassword.toString().length === 0) {
			return;
		}
		else {
			this.props.toggleAuthLoader();
			axios.post("/login", {username: this.state.loginUsername.toString().trim(), password: this.state.loginPassword})
				.catch(function(error) {
					if(error.response.status === 401) {
						alert("Invalid credentials");
					}
				})
				.then(res => this.handleLoginResponse(res))

		}
	}

	handleRegistrationResponse = (response) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				this.props.grantAccess(this.state.registerUsername, response.headers.token);
				localStorage.setItem("token", response.headers.token);
				localStorage.setItem("username", this.state.loginUsername);
			}
		}
		catch(error) {
			this.props.toggleAuthLoader();
		}
	}
	
	//registration onClick event handler
	register = () => {
		//checks to make sure username and password fields have values 
		if(this.state.registerUsername.toString().trim().length === 0 || this.state.registerPassword.toString().trim().length == 0 || this.state.email.toString().trim().length === 0 || this.state.birthday === null) {
			return;
		}
		else {
			this.props.toggleAuthLoader();
			axios.post("/register", {username: this.state.registerUsername.toString().trim(), password: this.state.registerPassword, email: this.state.email.toString().trim(), birthday: this.state.birthday})
				.catch(function(error) {
					if(error.response.status === 409) {
						alert("Username or email already exists");
					}
				})
				.then(res => this.handleRegistrationResponse(res))
		}
	}
	
	handleSubmit = (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({validated: true});
		e.preventDefault();
		if(this.state.onLogin) {
			this.login();
		}
		else {
			this.register();
		}
	}
	
	onChangeLogin = (e) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		this.setState({[name]: value});
	}
	
	onSelectBirthday = (date) => {
		this.setState({birthday: date});
	}
	
	toggleTab = (tabToRender) => {
		if(tabToRender === "login" && this.state.onLogin) {
			return;
		}
		if(tabToRender === "register" && !this.state.onLogin) {
			return;
		}
		this.setState({onLogin: !this.state.onLogin, validated: false, loginUsername: "", loginPassword: "", registerUsername: "", registerPassword: "", email: "", birthday: null});
	}
	
	render() {
		const datePicker = <Form.Control
							required
							type = "input"
							value = {this.state.birthday}
							autoComplete = "off"
							/>
		return (
			<Jumbotron>
				<Container fluid>
					<Row>
						<Col lg = {6}>
							<Row>
								<Col>
									<h1> Training Diary </h1>
									<p>
										A simple application to track and analyze your workout data.
									</p>
								</Col>
							</Row>
							<br/>
							<Row>
								<Col>
									<Figure>
										<Figure.Image
											src = "https://cdn.emojidex.com/emoji/seal/weight_lifter.png"
											width = {200}
											height = {300}
										/>
									</Figure>
								</Col>
								<Col>
									<Figure>
										<Figure.Image
										 src = "https://cdn.emojidex.com/emoji/seal/chart_with_upwards_trend.png"
										 width = {200}
										 height = {300}
										/>
									</Figure>
								</Col>
							</Row>
						</Col>
						<Col lg = {6}>
							<Row>
								<Col>
									<Tabs defaultActiveKey = "login" onSelect = {this.toggleTab.bind(this)}>
										<Tab eventKey = "login" title = "Login">
											<br/>
											{this.state.onLogin 
											?
											<Row>
												<Col>
													<Form noValidate validated = {this.state.validated} onSubmit = {this.handleSubmit}>
														<Row>
															<Col>
																<Form.Label> Username </Form.Label>
																<Form.Control
																	required
																	type = "input"
																	placeholder = "Username"
																	name = "loginUsername"
																	value = {this.state.loginUsername}
																	onChange = {(e) => {this.onChangeLogin(e)}}
																	autoComplete = "off"
																/>
															</Col>
														</Row>
														<br/>
														<Row>
															<Col>
																<Form.Label> Password </Form.Label>
																<Form.Control
																	required
																	type = "password"
																	placeholder = "Password"
																	name = "loginPassword"
																	value = {this.state.loginPassword}
																	onChange = {(e) => {this.onChangeLogin(e)}}
																/>
															</Col>
														</Row>
														<br/>
														<Row>
															<Col>
																<Button type = "submit" disabled = {this.props.disabled}> Login </Button>
															</Col>
															<Col>
																{this.props.authLoading
																?
																	<div style = {{float: "left", marginTop: "5%"}}>
																		<Loader type="TailSpin" 
																			color="#00BFFF" 
																			height={80} 
																			width={80} 
																		/>
																	</div>
																:
																<div> </div>
																}
															</Col>
														</Row>
														<br/>
														<Row>
															<Col>
																<Link to = "/reset"> Forgot Password? </Link>
															</Col>
														</Row>
													</Form> 
												</Col>
											</Row>
											:
											<div> </div>
											}
										</Tab>
										<Tab eventKey = "register" title = "Register">
											<br/>
											{!this.state.onLogin
											?
												<Row>
													<Col>
														<Form noValidate validated = {this.state.validated} onSubmit = {this.handleSubmit}>
															<Row>
																<Col sm = {6}>
																	<Form.Label> Username </Form.Label>
																	<Form.Control
																		required
																		type = "input"
																		placeholder = "Username"
																		name = "registerUsername"
																		value = {this.state.registerUsername}
																		onChange = {(e) => {this.onChangeLogin(e)}}
																		autoComplete = "off"
																	/>
																</Col>
																<Col sm = {6}>
																	<Form.Label> Password </Form.Label>
																	<Form.Control
																		required
																		type = "password"
																		placeholder = "Password"
																		name = "registerPassword"
																		value = {this.state.registerPassword}
																		onChange = {(e) => {this.onChangeLogin(e)}}
																	/>																
																</Col>
															</Row>
															<br/>
															<Row>
																<Col sm = {6}>
																	<Form.Label> Email </Form.Label>
																	<Form.Control
																		required
																		type = "input"
																		placeholder = "Email"
																		name = "email"
																		value = {this.state.email}
																		onChange = {(e) => {this.onChangeLogin(e)}}
																		autoComplete = "off"
																	/>
																</Col>
																<Col sm = {6}>
																	<Form.Label> Birthday </Form.Label>
																	<DatePicker 
																		required
																		selected = {this.state.birthday}
																		onChange = {this.onSelectBirthday}
																		minDate = {subYears(new Date(), 120)}
																		maxDate = {subDays(new Date(), 0)}
																		showYearDropdown
																		scrollableYearDropdown
																		showMonthDropdown
																		dropdownMode="select"
																		placeholderText = "Birthday"
																		customInput = {datePicker}
																	/>
																</Col>
															</Row>
															<br/>
															<Row>
																<Col>
																	<Button type = "submit" disabled = {this.props.disabled}> Register </Button>
																</Col>
																<Col>
																{this.props.authLoading
																?
																	<div style = {{float: "left", marginTop: "5%"}}>
																		<Loader type="TailSpin" 
																			color="#00BFFF" 
																			height={80} 
																			width={80} 
																		/>
																	</div>
																:
																<div> </div>
																}
																</Col>
															</Row>
														</Form> 
													</Col>
												</Row>
											:
											<div> </div>
											}
										</Tab>
									</Tabs>
								</Col>
							</Row>
						</Col>
					</Row>
				</Container>
			</Jumbotron>
		);
	}
}

export default Login;