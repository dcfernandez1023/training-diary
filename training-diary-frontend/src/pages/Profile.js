import React, { Component } from 'react';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Tabs from 'react-bootstrap/Tabs';
import TabContent from 'react-bootstrap/TabContent';
import Tab from 'react-bootstrap/Tab';
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';

class Profile extends Component {
	
	state = {
		data: null,
		validated: false,
		username: "",
		email: "",
		oldPassword: "",
		newPassword: "",
		confirmNewPassword: ""
	}
	
	componentDidMount = () => {
		this.setState({data: this.props.data, username: this.props.data._id, email: this.props.data.email});
	}
	
	onChangeAccountInfo = (e) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		this.setState({[name]: value});
	}
	
	handleInfoSubmit = async (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({validated: true});
		e.preventDefault();
		if(this.state.username.trim().length === 0 || this.state.email.trim().length === 0) {
			return;
		}
		var requestBody = {prevUsername: this.props.data._id, prevEmail: this.props.data.email, newUsername: this.state.username, newEmail: this.state.email};
		var dataCopy = JSON.parse(JSON.stringify(this.props.data));
		dataCopy._id = this.state.username;
		dataCopy.email = this.state.email;
		await this.props.changeUsernameAndEmail(requestBody, dataCopy, this.props.token);
		this.forceUpdate();
	}
	
	handlePasswordSubmit = (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({validated: true});
		e.preventDefault();
	}
	
	resetFields = () => {
		this.setState({validated: false, oldPassword: "", newPassword: "", confirmNewPassword: "", username: this.props.data._id, email: this.props.data.email});
	}
	
	render() {
		return (
			<div>
				<br/>
				<Row>
					<Col>
						<h1 style = {{margin: "1%"}}> Training Diary </h1>
					</Col>
				</Row>
				<Container style = {{border: "1px solid lightGray"}}>
					<Row>
						<Col>
							<h3 style = {{margin: "1%"}}> Profile </h3>
						</Col>
					</Row>
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
										/>
									</Col>
								</Row>
								<br/>
								<Row>
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
													<li> Number of {category} Goals: {numGoals} </li>
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
													<li> Number of {category} Entries: {numEntries} </li>
												)
											})}
											</Card.Text>
										</Card.Body>
									</Card>
								</Col>
							</Row>
							<br/>
						</Tab>
					</Tabs>
				</Container>
			</div>
		)
	}
}

export default Profile;