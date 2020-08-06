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
		email: "",
		username: "",
		tempPassword: ""
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
		var requestBody = {username: this.state.username, tempPassword: this.state.tempPassword};
		await this.props.validateTempCredentials(requestBody);
		this.forceUpdate();
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
														/>
														<br/>
														<Form.Label> Temporary Password (expires in 5 min.) </Form.Label>
														<Form.Control
															required
															type = "input"
															name = "tempPassword"
															value = {this.state.tempPassword}
															onChange = {(e) => {this.onChangeField(e)}}
															autoComplete = "off"
														/>
														<br/>
														<Button type = "submit"> Submit </Button>
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
				</Container>
			</div>
		);
	}
}

export default ForgotCredentials;
