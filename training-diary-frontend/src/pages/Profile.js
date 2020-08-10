import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Tabs from 'react-bootstrap/Tabs';
import TabContent from 'react-bootstrap/TabContent';
import Tab from 'react-bootstrap/Tab';
import Form from 'react-bootstrap/Form';
import DatePicker from "react-datepicker";
import subDays from "date-fns/subDays";
import subYears from "date-fns/subYears";
import "react-datepicker/dist/react-datepicker.css"
import Spinner from 'react-bootstrap/Spinner';
import CardDeck from 'react-bootstrap/CardDeck';

class Profile extends Component {
	
	state = {
		data: null,
		validated: false,
		username: "",
		email: "",
		birthday: null,
		oldPassword: "",
		newPassword: "",
		confirmNewPassword: "",
		saving: false
	}
	
	componentDidMount = () => {
		this.setState({data: this.props.data, username: this.props.data._id, email: this.props.data.email, birthday: new Date(this.props.data.birthday)});
	}
	
	onChangeAccountInfo = (e) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		this.setState({[name]: value});
	}
	
	onSelectBirthday = (date) => {
		this.setState({birthday: date});
	}
	
	handleInfoSubmit = async (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({validated: true});
		var requestBody = {};
		var username = this.state.username.trim();
		e.preventDefault();
		if(this.state.username.trim().length === 0 || this.state.email.trim().length === 0 || this.state.birthday === null) {
			return;
		}
		if(this.state.username.trim() !== this.props.data._id) {
			requestBody._id = this.state.username.trim();
			username = this.props.data._id;
		}
		if(this.state.email.trim() !== this.props.data.email) {
			requestBody.email = this.state.email.trim();
		}
		if(new Date(this.state.birthday).getTime() !== new Date(this.props.data.birthday).getTime()) {
			requestBody.birthday = this.state.birthday;
		}
		if(Object.keys(requestBody).length === 0) {
			alert("You did not make any changes");
			this.setState({validated: false});
			return;
		}
		this.props.toggleSaving();
		//var requestBody = {prevUsername: this.props.data._id, prevEmail: this.props.data.email, newUsername: this.state.username, newEmail: this.state.email, birthday: this.state.birthday};
		var dataCopy = JSON.parse(JSON.stringify(this.props.data));
		dataCopy._id = this.state.username;
		dataCopy.email = this.state.email;
		dataCopy.birthday = this.state.birthday;
		await this.props.changeUsernameAndEmail(requestBody, dataCopy, this.props.token, username);
		this.setState({validated: false});
	}
	
	handlePasswordSubmit = async (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({validated: true});
		e.preventDefault();
		if(this.state.oldPassword.trim().length === 0 || this.state.newPassword.trim().length === 0 || this.state.confirmNewPassword.trim().length === 0) {
			return;
		}
		if(this.state.newPassword !== this.state.confirmNewPassword) {
			alert("Cannot proceed -- New password does not match confirmation password");
			this.setState({validated: false});
			return; 
		}
		if(this.state.newPassword === this.state.oldPassword) {
			alert("Cannot proceed -- New password is the same as the old password");
			this.setState({validated: false});
			return;
		}
		this.props.toggleSaving();
		var requestBody = {oldPassword: this.state.oldPassword, newPassword: this.state.newPassword}
		var dataCopy = JSON.parse(JSON.stringify(this.props.data));
		await this.props.changePassword(requestBody, dataCopy, this.props.token);
		this.forceUpdate();
		this.setState({validated: false});
	}
	
	resetFields = () => {
		this.setState({validated: false, oldPassword: "", newPassword: "", confirmNewPassword: "", username: this.props.data._id, email: this.props.data.email, birthday: new Date(this.props.data.birthday)});
	}
	
	render() {
		const datePicker = <Form.Control
							required
							type = "input"
							value = {this.state.birthday}
							autoComplete = "off"
							/>
		return (
			<div>
				<Row>
					<Col>
						<h1 style = {{margin: "1%"}}> Training Diary </h1>
					</Col>
					<Col style = {{textAlign: "right"}}>
						<Button variant = "success" href = "/" style = {{margin: "1%"}}> Back to Home </Button>
					</Col>
				</Row>
				<Container>
					<Row>
						<h3 style = {{margin: "1%"}}> Profile </h3>
					</Row>
				</Container>
				<Container style = {{border: "1px solid lightGray"}}>
					<Tabs variant = "pills" defaultActiveKey = "editProfile" onSelect = {this.resetFields.bind(this)}>
						<Tab eventKey = "editProfile" title = "Edit Profile ✏️">
							<br/>
							<Form noValidate validated = {this.state.validated} onSubmit = {this.handleInfoSubmit}>
								<Row>
									<Col>
										<Form.Label> Username </Form.Label>
										<Form.Control
											required
											type = "input"
											name = "username"
											value = {this.state.username}
											onChange = {(e) => {this.onChangeAccountInfo(e)}}
											autoComplete = "off"
										/>
									</Col>
								</Row>
								<br/>
								<Row>
									<Col>
										<Form.Label> Email </Form.Label>
										<Form.Control
											required
											type = "input"
											name = "email"
											value = {this.state.email}
											onChange = {(e) => {this.onChangeAccountInfo(e)}}
											autoComplete = "off"
										/>
									</Col>
								</Row>
								<br/>
								<Row>
									<Col>
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
								{this.props.saving
									?
									<Col>
										<Spinner animation = "border" variant = "primary" />
									</Col>
									:
									<div> </div>
									}
									<Col>
										<Button type = "submit" style = {{float: "right"}}> Save </Button>
									</Col>
								</Row>
								<br/>
							</Form>
						</Tab>
						
						<Tab eventKey = "changePassword" title = "Change Password 🔑">
							<br/>
							<Form noValidate validated = {this.state.validated} onSubmit = {this.handlePasswordSubmit}>
								<Row>
									<Col>
										<Form.Label> Old Password </Form.Label> 
										<Form.Control
											required 
											type = "password"
											name = "oldPassword"
											value = {this.state.oldPassword}
											onChange = {(e) => {this.onChangeAccountInfo(e)}}
										/>
									</Col>
								</Row>
								<br/> 
								<Row>
									<Col>
										<Form.Label> New Password </Form.Label> 
										<Form.Control
											required 
											type = "password"
											name = "newPassword"
											value = {this.state.newPassword}
											onChange = {(e) => {this.onChangeAccountInfo(e)}}
										/>
									</Col>
								</Row>
								<br/> 	
								<Row>
									<Col>
										<Form.Label> Confirm New Password </Form.Label> 
										<Form.Control
											required 
											type = "password"
											name = "confirmNewPassword"
											value = {this.state.confirmNewPassword}
											onChange = {(e) => {this.onChangeAccountInfo(e)}}
										/>
									</Col>
								</Row>
								<br/>
								<Row>
								{this.props.saving
									?
									<Col>
										<Spinner animation = "border" variant = "primary" />
									</Col>
									:
									<div> </div>
									}
									<Col>
										<Button type = "submit" style = {{float: "right"}}> Save </Button>
									</Col>
								</Row>
								<br/>
							</Form>
						</Tab>
						<Tab eventKey = "accountStats" title = "Account Stats 📈">
							<br/>
							<Row>
								<Col>
									<Card>
										<Card.Body>
											<Card.Title>
												Goal Statistics 🎯
												<hr style = {{border: "1px solid lightGray"}} />
											</Card.Title>
											<Card.Text>
											{this.props.data.metaData.categories.map((category) => {
												var numGoals = 0;
												this.props.data.goals.map((goal) => {
													if(goal["Goal Type"] === category) {
														numGoals++;
													}
												})
												return (
													<div>
														<li> Number of {category} Goals: {numGoals} </li>
														<br/>
													</div>
												)
											})}
											</Card.Text>
										</Card.Body>
									</Card>
								</Col>
								<Col>
									<Card>
										<Card.Body>
											<Card.Title>
												Training Statistics 💪
												<hr style = {{border: "1px solid lightGray"}} />
											</Card.Title>
											<Card.Text>
											{this.props.data.metaData.categories.map((category) => {
												var numEntries = 0;
												this.props.data.userData.map((entry) => {
													if(entry.Category === category) {
														numEntries++;
													}
												})
												return (
													<div>
														<li> Number of {category} Entries: {numEntries} </li>
														<br/>
													</div>
												)
											})}
											</Card.Text>
										</Card.Body>
									</Card>
								</Col>
							</Row>
							<br/>
						</Tab>
						<Tab eventKey = "customize" title = "Customize Data ⚙️">
						<br/>
						<Row>
							<Col>
								<h3>
									Training Data Options
								</h3>
								<p>
									Customize your data by editing, deleting, and adding to the options below.
								</p>
								<Row>
									{this.props.data.metaData.categories.map((category) => {
										return (
											<Col sm = {12}>
												<Card>
													<Card.Body>
														<Card.Title>
															{category}
															<Button variant = "primary" style = {{float: "right"}}> + </Button>
														</Card.Title>
														<Card.Text>
															<Row>
																{this.props.data.metaData.entryTypes.map((entry) => {
																	if(entry.Category === category) {
																		if(entry.deletable) {
																			return (
																				<Col sm = {4}>
																					<Card style = {{height: "100%"}}>
																						<Row style = {{marginBottom: "1%"}}>
																							<Col>
																								<Card.Title>
																									<Button size = "sm" variant = "light" style = {{float: "right"}}> ✏️ </Button>
																								</Card.Title>
																							</Col>
																						</Row>
																						<Card.Body>
																							<Card.Text> 
																								<ListGroup horizontal>
																									<ListGroup.Item style = {{width: "100%"}}> <strong> Category </strong> : {entry.Category} </ListGroup.Item>
																								</ListGroup>
																								<ListGroup horizontal>
																									<ListGroup.Item style = {{width: "100%"}}> <strong> Type </strong> : {entry.Type} </ListGroup.Item>
																								</ListGroup>
																								<ListGroup horizontal>
																									<ListGroup.Item style = {{width: "100%"}}> 
																										<strong> Fields </strong>
																										{entry.displayOrder.map((key) => {
																											if(key !== "Category" && key !== "Type") {
																												return (
																													<li> {key} </li>
																												)
																											}
																										})}
																									</ListGroup.Item>
																								</ListGroup>
																							</Card.Text>
																						</Card.Body>
																					</Card>
																				</Col>
																			)
																		}
																		return (
																			<Col sm = {4}>
																				<Card style = {{height: "100%"}}>
																					<Card.Body>
																						<Card.Text> 
																							<ListGroup horizontal>
																								<ListGroup.Item style = {{width: "100%"}}> <strong> Category </strong> : {entry.Category} </ListGroup.Item>
																							</ListGroup>
																							<ListGroup horizontal>
																								<ListGroup.Item style = {{width: "100%"}}> <strong> Type </strong> : {entry.Type} </ListGroup.Item>
																							</ListGroup>
																							<ListGroup horizontal>
																								<ListGroup.Item style = {{width: "100%"}}> 
																									<strong> Fields </strong>
																									{entry.displayOrder.map((key) => {
																										if(key !== "Category" && key !== "Type") {
																											return (
																												<li> {key} </li>
																											)
																										}
																									})}
																								</ListGroup.Item>
																							</ListGroup>
																						</Card.Text>
																					</Card.Body>
																				</Card>
																			</Col>
																		)
																	}
																})}
															</Row>
														</Card.Text>
													</Card.Body>
												</Card>
											</Col>
										)
									})}
								</Row>
							</Col>
						</Row>
						</Tab>
					</Tabs>
				</Container>
			</div>
		)
	}
}

export default Profile;