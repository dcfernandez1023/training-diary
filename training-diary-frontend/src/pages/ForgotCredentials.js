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
import Nav from 'react-bootstrap/Nav';
import Form from 'react-bootstrap/Form';


class ForgotCredentials extends Component {
	
	state = {
		validated: false,
		passwordValidated: false,
		email: "",
		username: "",
		tempPassword: "",
		newPassword: "",
		confirmPassword: ""
	}
	
	handleEmailSubmit = async (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({validated: true});
		e.preventDefault();
		if(this.state.email.toString().trim().length === 0) {
			return;
		}
		var requestBody = {email: this.state.email.trim()}
		await this.props.getTempCredentials(requestBody, this.state.email);
		this.forceUpdate();
		this.setState({validated: false});
	}
	
	handleTempSubmit = async (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({validated: true});
		e.preventDefault();
		if(this.state.username.toString().trim().length === 0 || this.state.tempPassword.length === 0) {
			return;
		}
		var requestBody = {username: this.state.username.trim(), tempPassword: this.state.tempPassword};
		await this.props.validateTempCredentials(requestBody);
		this.forceUpdate();
	}
	
	handleNewPasswordSubmit = async (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({passwordValidated: true});
		e.preventDefault();
		if(this.state.newPassword.length === 0 || this.state.confirmPassword.length === 0) {
			return;
		}
		var requestBody = {password: this.state.newPassword};
		if(this.props.username.toString().length !== 0 && this.props.username !== undefined && this.props.token !== null && this.props.token !== undefined) {
			await this.props.recoverPassword(this.props.username, this.props.token, requestBody);
		}
	}
	
	onChangeField = (e) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		this.setState({[name]: value});
	}
	
	
	render() {
		return (
			<div>
				<Row>
					<Col>
						<h1 style = {{margin: "1%"}}> Training Diary </h1>
					</Col>
					<Col style = {{textAlign: "right"}}>
						<Button size = "lg" variant = "success" href = "/" style = {{margin: "1%"}}> Back to Home </Button>
					</Col>
				</Row>
				<Container>
					<br/>
					<Row>
						<Col>
							<Card>
								<Card.Header as = "h4"> Recover Credentials </Card.Header>
								<Card.Body>
									{this.props.tempSuccess
									?
										<Card.Title>
											Email sent! 
										</Card.Title>
									:
										<Card.Title>
											Enter your email 
										</Card.Title>
									}
									<Card.Text>
										<Row>
											{this.props.tempSuccess
											?
												<Col>
													Enter the <u>username</u> and <u>temporary password</u> sent to <strong> {this.props.email} </strong>
												</Col>
											:
												<Col>
													We'll send your username and a temporary password.
												</Col>
											}
										</Row>
										<br/>
										<Row>
											{this.props.tempSuccess
											?
												<Col>
													<Form noValidate validated = {this.state.validated} onSubmit = {this.handleTempSubmit}>
														<Form.Label> Username </Form.Label>
														<Form.Control
															required
															type = "input"
															name = "username"
															value = {this.state.username}
															onChange = {(e) => {this.onChangeField(e)}}
															autoComplete = "off"
															disabled = {this.props.recoveryDisabled}
														/>
														<br/>
														<Form.Label> Temporary Password (expires in 5 min.) </Form.Label>
														<Form.Control
															required
															type = "password"
															name = "tempPassword"
															value = {this.state.tempPassword}
															onChange = {(e) => {this.onChangeField(e)}}
															autoComplete = "off"
															disabled = {this.props.recoveryDisabled}
														/>
														<br/>
														<Button type = "submit" disabled = {this.props.recoveryDisabled}> Submit </Button>
													</Form>		
												</Col>
											:
											<Col>
												<Form noValidate validated = {this.state.validated} onSubmit = {this.handleEmailSubmit}>
													<Form.Label> Email </Form.Label>
													<Form.Control
														required
														type = "input"
														name = "email"
														value = {this.state.email}
														onChange = {(e) => {this.onChangeField(e)}}
														autoComplete = "off"
													/>
													<br/>
													<Button type = "submit"> Submit </Button>
												</Form>
											</Col>
											}
										</Row>
									</Card.Text>
								</Card.Body>
							</Card>
						</Col>
					</Row>
					<Row>
						{this.props.recoveryDisabled
						?
							<Col>
								<Card style = {{marginTop: "5%"}}>
									<Card.Header as = "h4"> Enter a New Password </Card.Header>
									<Card.Body>
										<Card.Text>
											<Form noValidate validated = {this.state.passwordValidated} onSubmit = {this.handleNewPasswordSubmit}>
												<Form.Label> New Password </Form.Label>
												<Form.Control
													required
													type = "password"
													name = "newPassword"
													value = {this.state.newPassword}
													onChange = {(e) => {this.onChangeField(e)}}
													autoComplete = "off"
												/>
												<br/>
												<Form.Label> Confirm New Password </Form.Label>
												<Form.Control
													required
													type = "password"
													name = "confirmPassword"
													value = {this.state.confirmPassword}
													onChange = {(e) => {this.onChangeField(e)}}
													autoComplete = "off"
												/>
												<br/>
												<Button type = "submit"> Submit </Button>
											</Form>		
										</Card.Text>
									</Card.Body>
								</Card>
							</Col>
						:
							<div> </div>
						}
					</Row>
				</Container>
			</div>
		);
	}
}

export default ForgotCredentials;
