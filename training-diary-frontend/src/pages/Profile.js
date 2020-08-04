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
		oldPassword: "",
		newPassword: "",
		confirmNewPassword: ""
	}
	
	componentDidMount = () => {
		console.log(this.props.data);
		this.setState({data: this.props.data});
	}
	
	handleInfoSubmit = (e) => {
		const form = e.currentTarget;
		if(form.checkValidity() === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		this.setState({validated: true});
		e.preventDefault();
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
		this.setState({validated: false, oldPassword: "", newPassword: "", confirmNewPassword: ""});
	}
	
	render() {
		console.log(this.props.data._id);
		return (
			<div>
				<br/>
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
											name = "_id"
											value = {this.props.data._id}
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
											value = {this.props.data.email}
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
										/>
									</Col>
								</Row>
								<br/> 	
								<Row>
									<Col>
										<Form.Label> Confirm New Password </Form.Label> 
										<Form.Control
											required 
											type = "input"
											name = "password"
											value = {this.state.confirmNewPassword}
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
					</Tabs>
					{/*
					<Row>
						<Col>
							<Tab.Container defaultActiveKey = "editProfile">
								<Row>
									<Col>
										<Nav variant = "pills">
											<Nav.Item>
												<Nav.Link eventKey = "editProfile"> 
													Edit Profile ✏️
												</Nav.Link>
											</Nav.Item>
										</Nav>
										<Nav variant = "pills">
											<Nav.Item>
												<Nav.Link eventKey = "changePassword"> 
													Change Password 🔑
												</Nav.Link>
											</Nav.Item>
										</Nav>
										<Nav variant = "pills">
											<Nav.Item>
												<Nav.Link eventKey = "accountStats"> 
													Account Stats 📈
												</Nav.Link>
											</Nav.Item>
										</Nav>
									</Col>
								</Row>
							</Tab.Container>
						</Col>
						<Col>
							<Tab.Content>
								<Tab.Pane eventKey = "editProfile">
									<Form noValidate validated = {this.state.validated}>
										<Form.Label> Username </Form.Label>
										<Form.Control
											required
											type = "input"
											name = "_id"
											value = {this.props.data._id}
										/>
										<br/>
										<Form.Label> Email </Form.Label>
										<Form.Control
											required
											type = "input"
											name = "email"
											value = {this.props.data.email}
										/>
									</Form>
								</Tab.Pane>
							</Tab.Content>
						</Col>
					</Row>
					*/}
				</Container>
			</div>
		)
	}
}

export default Profile;