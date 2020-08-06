import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';
import Login from './login-components/Login.js';
import TrainingDiary from './td-components/TrainingDiary.js';
import Profile from './pages/Profile.js';
import ForgotCredentials from './pages/ForgotCredentials.js';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

class App extends Component {
	state = {
		data: null, //user data from database
		username: "", //username
		token: null, //api token 
		waitingForPage: false, //flag to render loader while page is initially loading
		isLoggedIn: false, //flag determining if user is logged in 
		onLogin: true, //flag determining if user is on the login page 
		onRegistration: false, //flag determining if user is on registration page ,
		addModalShow: false,
		editModalShow: false,
		isSaving: false,
		dataToEdit: null,
		authLoading: false,
		disabled: false,
		tempSuccess: false,
		recoveryEmail: ""
		
	}
	
	/* COMPONENT MOUNT + UPDATE METHODS */
	
	componentDidMount = () => {
		this.setState({waitingForPage: true});
		const token = localStorage.getItem("token");
		const username = localStorage.getItem("username");
		axios.post(`/verifyLogin/${username}`, {}, {headers: {"token": token}})
			.catch(function(error) {
				return;
			})
			.then(res => this.handleVerificationResponse(res, username));
	}
	
	/* GENERAL COMPONENT METHODS */ 
	
	toggleSaveBar = () => {
		this.setState({isSaving: !this.state.isSaving});
	}
	
	/* MODAL METHODS */
	
	toggleAddModal = () => {
		this.setState({addModalShow: !this.state.addModalShow});
	}
	
	toggleEditModal = (dataToEdit) => {
		console.log(dataToEdit);
		this.setState({editModalShow: !this.state.editModalShow, dataToEdit: dataToEdit});
	}
	
	
	/* SERVER API METHODS */ 
	
	handleGetResponse = (response, username) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				this.toggleAuthLoader();
				this.setState({token: response.headers.token, username: username, data: response.data, isLoggedIn: true, waitingForPage: false});
				localStorage.setItem("username", username);
				localStorage.setItem("token", response.headers.token);
			}
		}
		catch(error) {
			this.logout();
		}
	}
	
	//handles the response from server that verifies if user is still logged in
	//if successful, sends a request to get all user data
	handleVerificationResponse = (response, username) => {
		try {
			if(localStorage.getItem("token") === null || localStorage.getItem("username") === null) {
				this.setState({isLoggedIn: false, waitingForPage: false});
				localStorage.clear();  
			}
			else {
				var status = Number(response.status);
				if(status === 200) {
					localStorage.setItem("username", username);
					localStorage.setItem("token", response.headers.token);
					axios.get(`/getAllData/${username}`, {headers: {"token": response.headers.token}})
						.catch(function(error) {
							return;
						})
						.then(res => this.handleGetResponse(res, username));
				}
				else if(status === 204) {
					alert("Session expired. Logging you out");
					this.logout();
				}
			}
		}
		catch(error) {
			this.logout();
			return;
		}
	}

	//saves data by calling post api 
	saveData = (newData) => {
		const username = this.state.data._id;
		axios.post(`/postData/${username}`, newData, {headers: {"token": this.state.token}})
			.catch(function(error) {
				alert("Internal Error -- could not save data -- redirecting to login page");
			})
			.then(res => this.handlePostResponse(res, newData));
	}
	
	//handles response from post request 
	handlePostResponse = (response, newData) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				localStorage.setItem("token", response.headers.token);
				this.setState({token: response.headers.token});
				this.setState({data: newData});
			}
		}
		catch(error) {
			//alert("An unexpected error occurred -- redirecting to login page");
			this.logout();
		}
	}
	
	/* AUTH METHODS */ 
	
	changeUsernameAndEmail = (reqBody, newData, token, prevUsername) => {
		var that = this;
		axios.post(`/postAccountInfo/${prevUsername}`, reqBody, {headers: {"token": token}})
			.catch(function(error) {
				if(error.response.status === 409) {
					alert("Username or email already exists. Please choose another one");
					return;
				}
				else if(error.response.status === 401) {
					alert("Session expired. Logging you out ");
					that.logout();
					return;
				}
				alert("Internal Error -- could not update username & email");
			})
			.then(res => this.handleChangeInfoResponse(res, newData));
	}
	
	handleChangeInfoResponse = (response, newData) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				alert("Changed successfully");
				localStorage.setItem("token", response.headers.token);
				localStorage.setItem("username", newData._id);
				this.setState({token: response.headers.token});
				this.setState({data: newData});
			}
		}
		catch(error) {
			return;
		}
	}
	
	changePassword = (reqBody, newData, token) => {
		var that = this;
		var username = newData._id;
		axios.post(`/postCredentials/${username}`, reqBody, {headers: {"token": token}})
			.catch(function(error) {
				if(error.response.status === 409) {
					alert("Old password is invalid");
					return;
				}
				else if(error.response.status === 401) {
					alert("Session expired. Logging you out");
					that.logout();
					return;
				}
				alert("Internal Error -- could not change password");
			})
			.then(res => this.handleChangePasswordResponse(res, newData));
	}
	
	handleChangePasswordResponse = (response, newData) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				alert("Changed successfully");
				localStorage.setItem("token", response.headers.token);
				this.setState({token: response.headers.token});
				this.setState({data: newData});
			}
		}
		catch(error) {
			return;
		}
	}
	
	getTempCredentials = (reqBody, email) => {
		axios.post("/getTempPassword", reqBody)
			.catch(function(error) {
				if(error.response.status === 401) {
					alert("The email you gave is not linked to any user");
					return;
				}
				alert("Internal error -- could not get temporary credentials");
			})
			.then(res => this.handleTempResponse(res, email));
	}
	
	handleTempResponse = (response, email) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				console.log(response.data);
				this.setState({tempSuccess: true, recoveryEmail: email});
			}
		}
		catch(error) {
			return;
		}
	}
	
	validateTempCredentials = (reqBody) => {
		axios.post("/postTempPassword", reqBody)
			.catch(function(error) {
				if(error.response.status === 401) {
					alert("The username or temporary password you entered is invalid or expired");
					return;
				}
				alert("Internal error -- could not process temporary credentials");
			})
			.then(res => this.handleValidateTempResponse(res));
	}
	
	handleValidateTempResponse = (response) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				console.log(response.data);
				alert("temp password matches!");
			}
		}
		catch(error) {
			return;
		}
	}
	
	//method passed in as props to Login.js
	//grants access to apis by setting App.js state and redirecting to TrainingDiary.js
	//only occurs if login was successful
	grantAccess = (username, token) => {
		axios.get(`/getAllData/${username}`, {headers: {"token": token}})
			.catch(function(error) {
				alert("Internal Error -- could not get data -- redirecting to login page");
			})
			.then(res => this.handleGetResponse(res, username));
	}
	
	//method passed in as props to Register.js
	//redirects to Login.js by setting App.js state 
	toLogin = () => {
		this.setState({onLogin:true});
	}
	
	//method passed in as props to TrainingDiary.js
	//logs the user out, clears localStorage, and resets to original state
	logout = () => {
		localStorage.clear();
		this.setState({isLoggedIn: false, waitingForPage: false, onLogin: true});
		this.setState({authLoading: false, disabled: false});
	}
	
	toggleAuthLoader = () => {
		this.setState({authLoading: !this.state.authLoading, disabled: !this.state.disabled});
	}
	
	render() {
		if(this.state.waitingForPage) {
			return (
				<div style = {{textAlign: "center", marginTop: "5%"}}>
					<Loader type="TailSpin" 
						color="#00BFFF" 
						height={80} 
						width={80} 
					/>
				</div>
			)
		}
		else if(this.state.isLoggedIn) {
			return (
				<Router>
					<Switch>
						<Route exact path = "/">
							<TrainingDiary 
								data = {this.state.data}
								logout = {this.logout}
								saveData = {this.saveData}
								addModalShow = {this.state.addModalShow}
								editModalShow = {this.state.editModalShow}
								isSaving = {this.state.isSaving}
								toggleAddModal = {this.toggleAddModal}
								toggleEditModal = {this.toggleEditModal}
								toggleSaveBar = {this.toggleSaveBar}
								dataToEdit = {this.state.dataToEdit}
							/>
						</Route>
						<Route exact path = "/profile">
							<Profile 
								data = {this.state.data} 
								token = {this.state.token} 
								changeUsernameAndEmail = {this.changeUsernameAndEmail}
								changePassword = {this.changePassword}
							/>
						</Route>
						<Route>
							<div style = {{textAlign: "center"}}>
								<h1> This page does not exist :( </h1>
								<br/>
								<Button href = "/"> Back to main page 💪 </Button> 
							</div>
						</Route>
					</Switch>
				</Router>
			);
		}
		else if(this.state.onLogin) {
			return (
				<Router>
					<Switch>
						<Route exact path = "/">
							<div>
								<Login 
									grantAccess = {this.grantAccess} 
									authLoading = {this.state.authLoading}
									disabled = {this.state.disabled}
									toggleAuthLoader = {this.toggleAuthLoader}
								/>
							</div>
						</Route>
						<Route exact path = "/reset">
							<ForgotCredentials 
								getTempCredentials = {this.getTempCredentials} 
								validateTempCredentials = {this.validateTempCredentials} 
								tempSuccess = {this.state.tempSuccess}
								email = {this.state.recoveryEmail}/>
						</Route>
						<Route>
							<div style = {{textAlign: "center"}}>
								<h1> This page does not exist :( </h1>
								<br/>
								<Button href = "/"> Back to main page 💪 </Button> 
							</div>
						</Route>
					</Switch>
				</Router>
			);
		}
		return (
		<div> hi </div>
		);
	}
}

export default App;