import React, { Component } from 'react';
import axios from 'axios';
import '../login-css/LoginRegister.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker-cssmodules.css';
import "react-datepicker/dist/react-datepicker.css";
import subDays from "date-fns/subDays";
import subYears from "date-fns/subYears";

//Register class
//props: isProcessing, grantAccess(), toLogin() from App.js

class Register extends Component {
	
	state = {
		username: "",
		password: "",
		isLoading: false,
		birthday: "",
		disabled: ""
	}
	
	//registration onClick handler; redirects to Login.js 
	toggleLogin = () => {
		this.props.toLogin();
	}
		
	//datepicker handler 
	handleDate = (date) => {
		this.setState({birthday: date});
	}
	
	//registration response handler
	//handles the response sent from the server
	// -1 = failed operation, 0 = successful operation, 1 = invalid operation 
	handleRegistrationResponse = (response) => {
		try {
			var status = Number(response.status);
			if(status === 200) {
				this.props.grantAccess(this.state.username, response.headers.token);
				localStorage.setItem("token", response.headers.token);
				localStorage.setItem("username", this.state.username);
			}
		}
		catch(error) {
			this.setState({isLoading: false, disabled: ""});
		}
	}
	
	//registration onClick event handler
	handleRegistration = () => {
		//checks to make sure username and password fields have values 
		if(this.state.username.toString().trim().length === 0 || this.state.password.toString().trim().length === 0 || this.state.birthday.toString().trim().length === 0) {
			alert("Please enter a username, password, and birthday");
		}
		else {
			this.setState({disabled: "disabled", isLoading: true});
			axios.post("/register", {username: this.state.username.toString().trim(), password: this.state.password, birthday: this.state.birthday})
				.catch(function(error) {
					if(error.response.status === 409) {
						alert("Username already exists");
					}
				})
				.then(res => this.handleRegistrationResponse(res))
		}
	}
	
	//onChange handler for username and password input fields
	onChangeRegistration = (e) => {
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
				{/*registration elements*/}
				<label htmlFor = "username" className = "loginRegisterLabel"> Username: </label> <br/>
				<input type = "text" id = "username" name = "username" className = "loginRegisterInputText" onChange = {this.onChangeRegistration}/> <br/>
				<label htmlFor = "password" className = "loginRegisterLabel"> Password: </label> <br/>
				<input type = "password" id = "password" name = "password" className = "loginRegisterInputText" onChange = {this.onChangeRegistration}/> <br/>
				<label htmlFor = "birthday" className = "loginRegisterLabel"> Date of Birth: </label> <br/>
				<div>
						<DatePicker
							placeholderText = "Click here to enter a date"
							selected = {this.state.birthday}
							onChange = {this.handleDate}
							minDate = {subYears(new Date(), 120)}
							maxDate = {subDays(new Date(), 0)}
							showYearDropdown
							scrollableYearDropdown
							showMonthDropdown
							dropdownMode="select"
						/> 
					</div>
					<button className = "loginRegisterInputButton" onClick = {this.handleRegistration} disabled = {this.state.disabled}> Register </button> <br/>
					<button className = "link" onClick = {this.toggleLogin} disabled = {this.state.disabled}> Already have an account? Click here to login </button>
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

export default Register;