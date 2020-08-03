import React, { Component } from 'react';
import axios from 'axios';
import '../login-css/LoginRegister.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';

//Login class 
//props: isProcessing, grantAccess(), toRegistration(), from App.js

class Login extends Component {
	
	state = {
		username: "",
		password: "",
		disabled: "",
		isLoading: false
	}
	
	//registration onClick handler; redirects to Registration.js 
	toggleRegistration = () => {
		this.props.toRegistration();
	}
	
	//login response handler
	//handles the response sent from the server
	// -1 = failed operation, 0 = successful operation, 1 = invalid operation 
	handleLoginResponse = (response) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				this.props.grantAccess(this.state.username, response.headers.token);
				//saves token and username to browser's local storage 
				localStorage.setItem("token", response.headers.token);
				localStorage.setItem("username", this.state.username);
			}
		}
		catch(error) {
			this.setState({isLoading: false, disabled: ""});
		}
	}
	
	//login onClick event handler
	handleLogin = () => {
		//checks to make sure username and password fields have values 
		if(this.state.username.toString().trim().length === 0 || this.state.password.toString().trim().length === 0) {
			alert("Please enter a username and password");
		}
		else {
			this.setState({disabled: "disabled", isLoading: true});
			axios.post("/login", {username: this.state.username, password: this.state.password})
				.catch(function(error) {
					if(error.response.status === 401) {
						alert("Invalid credentials");
					}
				})
				.then(res => this.handleLoginResponse(res))

		}
	}
	
	//onChange handler for username and password input fields
	onChangeLogin = (e) => {
		this.setState({[e.target.name]: e.target.value});
	}
	
	render() {
		return (
			<div>
				<div className = "headerDiv">
					<h1 className = "headerText"> Training Diary </h1>
					<br/>
				</div>
				<div className = "loginRegisterDiv">
					{/*login elements*/}
					<label htmlFor = "username" className = "loginRegisterLabel"> Username: </label> <br/>
					<input type = "text" id = "username" name = "username" className = "loginRegisterInputText" onChange = {this.onChangeLogin}/> <br/>
					<label htmlFor = "password" className = "loginRegisterLabel"> Password: </label> <br/>
					<input type = "password" id = "password" name = "password" className = "loginRegisterInputText" onChange = {this.onChangeLogin}/> <br/>
					<button className = "loginRegisterInputButton" onClick = {this.handleLogin} disabled = {this.state.disabled}> Login </button>  <br/>
					<button className = "link" onClick = {this.toggleRegistration}> Don't have an account? Click here to register </button>
					<Loader type="ThreeDots" 
						color="#00BFFF" 
						height={80} 
						width={80} 
						visible = {this.state.isLoading}
					/>
				</div>
			</div>
		)
	}
}

export default Login;