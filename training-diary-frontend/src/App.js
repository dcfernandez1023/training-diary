import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import axios from 'axios';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';
import Login from './pages/Login.js';
import Register from './login-components/Register.js';
import TrainingDiary from './td-components/TrainingDiary.js';

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
		disabled: false
		
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
			alert("An unexpected error occurred -- redirecting to login page");
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
				alert("Error -- could not save data -- redirecting to login page");
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
			alert("An unexpected error occurred -- redirecting to login page");
			this.logout();
		}
	}
	
	/* LOGIN + REGISTRATION METHODS */ 
	
	//method passed in as props to Login.js
	//grants access to apis by setting App.js state and redirecting to TrainingDiary.js
	//only occurs if login was successful
	grantAccess = (username, token) => {
		axios.get(`/getAllData/${username}`, {headers: {"token": token}})
			.catch(function(error) {
				alert("Error -- could not get data -- redirecting to login page");
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
		console.log("logging out");
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
			);
		}
		else if(this.state.isLoggedIn) {
			return (
				<div>
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
				</div>
			);
		}
		else if(this.state.onLogin) {
			return (
				<div>
					<Login 
						grantAccess = {this.grantAccess} 
						authLoading = {this.state.authLoading}
						disabled = {this.state.disabled}
						toggleAuthLoader = {this.toggleAuthLoader}
					/>
				</div>
			);
		}
		return (
		<div> hi </div>
		);
	}
}

export default App;