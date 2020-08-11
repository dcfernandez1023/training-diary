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
import Modal from "react-bootstrap/Modal";
import Dropdown from 'react-bootstrap/Dropdown';
import InputGroup from 'react-bootstrap/InputGroup';
import Alert from 'react-bootstrap/Alert';

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
		saving: false,
		showModal: false,
		showEditModal: false,
		editModalData: {},
		addModalData: {},
		fields: [],
		categoryMenuShow: false,
		showAlert: false,
		alertMessage: "",
		entryTypeIndex: -1
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
	
	openEditModal = async (index) => {
		var editData = {};
		var fields = [];
		const entryType = this.props.data.metaData.entryTypes[index];
		editData.Category = entryType.Category;
		editData.Type = entryType.Type;
		editData.Notes = "string";
		for(var i = 0; i < entryType.displayOrder.length; i++) {
			var key = entryType.displayOrder[i];
			if(key !== "Category" && key !== "Type" && key !== "Notes") {
				fields.push({fieldName: key, dataType: entryType[key]});
			}
		}
		await this.setState({showEditModal: true, editModalData: editData, fields: fields, entryTypeIndex: index});
	}
	
	closeEditModal = async () => {
		await this.setState({showEditModal: false, editModalData: {}, fields: [], entryTypeIndex: -1});
		this.hideAlert();
	}
	
	onChangeEditModal = (e) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		var copy = JSON.parse(JSON.stringify(this.state.editModalData));
		copy[name] = value;
		this.setState({editModalData: copy});
	}
	
	openAddModal = async () => {
		const newData = {Category: "", Type: "", Notes: "string"};
		await this.setState({showModal: true, addModalData: newData});
	}
	
	closeAddModal = () => {
		this.setState({addModalData: {}, fields: [], showModal: false});
		this.hideAlert();
	}
	
	onChangeAddModal = (e) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		var copy = JSON.parse(JSON.stringify(this.state.addModalData));
		if(name === "Category") {
			this.showCategoryList(value);
		}
		copy[name] = value;
		this.setState({addModalData: copy});
	}
	
	onSelectDropdown = (key, value) => {
		var copy = JSON.parse(JSON.stringify(this.state.addModalData));
		copy[key] = value;
		this.setState({addModalData: copy});
	}
	
	onClickRootCloseCategory = () => {
		if(this.state.categoryMenuShow) {
			this.setState({categoryMenuShow: false});
		}
		else {
			this.setState({categoryMenuShow: true});
		}
	}
	
	showCategoryList = (categorySearch) => {
		if(categorySearch.length === 0) {
			this.setState({categoryMenuShow: false});
		}
		else {
			this.setState({categoryMenuShow: true});
		}
	}
	
	addField = () => {
		var newField = {fieldName: "", dataType: ""};
		var copy = this.state.fields.slice();
		copy.push(newField);
		this.setState({fields: copy});
	}
	
	onChangeField = (e, index) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		var copy = this.state.fields.slice();
		copy[index][name] = value;
		this.setState({fields: copy});
	}
	
	typeExists = (category, type) => {
		for(var i = 0; i < this.props.data.metaData.entryTypes.length; i++) {
			var entry = this.props.data.metaData.entryTypes[i];
			if(entry.Category === category && entry.Type === type) {
				return true;
			}
		}
		return false;
	}
	
	validateFields = () => {
		var defaultKeys = Object.keys(this.state.addModalData);
		var fieldNames = [];
		if(Object.keys(this.state.addModalData).length === 0) {
			this.showAlert("Cannot add new data, you're missing some required fields!");
			return false;
		}
		for(var key in this.state.addModalData) {
			if(this.state.addModalData[key].toString().trim().length === 0) {
				this.showAlert("Cannot add new data, you're missing some required fields!");
				return false;
			}
		}
		for(var i = 0; i < this.state.fields.length; i++) {
			var newField = this.state.fields[i];
			fieldNames.push(newField.fieldName);
			for(var key in newField) {
				if(newField[key].toString().trim().length === 0) {
					this.showAlert("Cannot add new data, you're missing some required fields!");
					return false;
				}
			}
		}
		if(this.typeExists(this.state.addModalData.Category.trim(), this.state.addModalData.Type.trim())) {
			this.showAlert("Cannot add new data -- " + "'" + this.state.addModalData.Type + "'" +
			" already exists under " + "'" + this.state.addModalData.Category + "'" + "!");
			return false;
		}
		for(var i = 0; i < this.state.fields.length; i++) {
			var newField = this.state.fields[i];
			for(var key in newField) {
				if(defaultKeys.includes(newField[key])) {
					this.showAlert("Cannot add new data -- " + "the name " + "'" + newField[key] + "' already exists");
					return false;
				}
				else {
					var count = 0;
					for(var x = 0; x < fieldNames.length; x++) {
						if(newField[key] === fieldNames[i]) {
							count++;
						}
					}
					if(count > 1) {
						this.showAlert("Cannot add new data -- " + "the name " + "'" + newField[key] + "' is a duplicate");
						return false;
					}
				}
			}
		}
		return true;
	}
	
	validateEditFields = () => {
		var defaultKeys = Object.keys(this.state.editModalData);
		var fieldNames = [];
		if(Object.keys(this.state.editModalData).length === 0) {
			this.showAlert("Cannot add new data, you're missing some required fields!");
			return false;
		}
		for(var key in this.state.editModalData) {
			if(this.state.editModalData[key].toString().trim().length === 0) {
				this.showAlert("Cannot add new data, you're missing some required fields!");
				return false;
			}
		}
		for(var i = 0; i < this.state.fields.length; i++) {
			var newField = this.state.fields[i];
			fieldNames.push(newField.fieldName);
			for(var key in newField) {
				if(newField[key].toString().trim().length === 0) {
					this.showAlert("Cannot add new data, you're missing some required fields!");
					return false;
				}
			}
		}
		if(this.typeExists(this.state.editModalData.Category.trim(), this.state.editModalData.Type.trim())) {
			this.showAlert("Cannot add new data -- " + "'" + this.state.editModalData.Type + "'" +
			" already exists under " + "'" + this.state.editModalData.Category + "'" + "!");
			return false;
		}
		for(var i = 0; i < this.state.fields.length; i++) {
			var newField = this.state.fields[i];
			for(var key in newField) {
				if(defaultKeys.includes(newField[key])) {
					this.showAlert("Cannot add new data -- " + "the name " + "'" + newField[key] + "' already exists");
					return false;
				}
				else {
					var count = 0;
					for(var x = 0; x < fieldNames.length; x++) {
						if(newField[key] === fieldNames[i]) {
							count++;
						}
					}
					if(count > 1) {
						this.showAlert("Cannot add new data -- " + "the name " + "'" + newField[key] + "' is a duplicate");
						return false;
					}
				}
			}
		}
		return true;
	}
	
	onClickSaveEdit = async () => {
		if(this.validateEditFields()) {
			var dataCopy = JSON.parse(JSON.stringify(this.props.data));
			var newData = {};
			var displayOrder = [];
			newData.Category = this.state.editModalData.Category.toString().trim();
			newData.Type = this.state.editModalData.Type.toString().trim();
			for(var i = 0; i < this.state.fields.length; i++) {
				var newField = this.state.fields[i];
				var fieldName = newField.fieldName.toString().trim();
				var dataType = newField.dataType;
				newData[fieldName] = dataType;
			}
			newData.Notes = this.state.editModalData.Notes;
			displayOrder = Object.keys(newData);
			newData.displayOrder = displayOrder;
			newData.Date = "string";
			newData.calculationType = "none";
			newData.deletable = true;
			dataCopy.metaData.entryTypes[this.state.entryTypeIndex] = newData;
			await this.props.saveData(dataCopy);
			this.closeEditModal();
			this.forceUpdate();
		}
	}
	
	onClickSave = async () => {
		if(this.validateFields()) {
			var dataCopy = JSON.parse(JSON.stringify(this.props.data));
			var newData = {};
			var displayOrder = [];
			newData.Category = this.state.addModalData.Category.toString().trim();
			newData.Type = this.state.addModalData.Type.toString().trim();
			for(var i = 0; i < this.state.fields.length; i++) {
				var newField = this.state.fields[i];
				var fieldName = newField.fieldName.toString().trim();
				var dataType = newField.dataType;
				newData[fieldName] = dataType;
			}
			newData.Notes = this.state.addModalData.Notes;
			displayOrder = Object.keys(newData);
			newData.displayOrder = displayOrder;
			newData.Date = "string";
			newData.calculationType = "none";
			newData.deletable = true;
			dataCopy.metaData.entryTypes.push(newData);
			if(!dataCopy.metaData.categories.includes(newData.Category)) {
				dataCopy.metaData.categories.push(newData.Category);
			}
			await this.props.saveData(dataCopy);
			this.closeAddModal();
			this.forceUpdate();
		}
		else {
			return;
		}
	}
	
	deleteData = async (index) => {
		var approveDelete = window.confirm("Are you sure you want to delete this entry?");
		if(approveDelete) {
			var dataCopy = JSON.parse(JSON.stringify(this.props.data));
			dataCopy.metaData.entryTypes.splice(index, 1);
			await this.props.saveData(dataCopy);
			this.forceUpdate();
		}
		else {
			return;
		}
	}
	
	deleteCategory = async (category) => {
		var approveDelete = window.confirm("All options under this category will be removed -- Are you sure you want to delete it? ");
		if(approveDelete) {
			var dataCopy = JSON.parse(JSON.stringify(this.props.data));
			dataCopy.metaData.categories.splice(dataCopy.metaData.categories.indexOf(category), 1);
			for(var i = 0; i < dataCopy.metaData.entryTypes.length; i++) {
				var entry = dataCopy.metaData.entryTypes[i];
				if(entry.Category === category) {
					dataCopy.metaData.entryTypes.splice(i, 1);
				}
			}
			for(i = 0; i < dataCopy.userData.length; i++) {
				entry = dataCopy.userData[i];
				if(entry.Category === category) {
					dataCopy.userData.splice(i, 1);
				}
			}
			await this.props.saveData(dataCopy);
			this.forceUpdate();
		}
		else {
			return;
		}
	}
	
	showAlert = (msg) => {
		this.setState({showAlert: true, alertMessage: msg});
	}
	
	hideAlert = () => {
		this.setState({showAlert: false, alertMessage: ""});
	}
	
	removeField = (index) => {
		var copy = this.state.fields.slice();
		copy.splice(index, 1);
		this.setState({fields: copy});
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
				{this.state.showModal
				?
					<Modal show = {this.state.showModal} backdrop = "static" onHide = {this.closeAddModal.bind(this)} size = "lg">
						<Modal.Header closeButton>
							<Modal.Title>
								Add Custom Training Data
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<h5> Category & Type </h5>
							<br/>
							{Object.keys(this.state.addModalData).map((key) => {
								if(key === "Category") {
									return (
										<Row>
											<Col>
											<Form.Label> Category </Form.Label>
												<InputGroup>
													<Form.Control
														as = "input"
														autoComplete = "off"
														name = {key}
														value = {this.state.addModalData[key]}
														onChange = {(e) => {this.onChangeAddModal(e)}}
													/>
													<Dropdown show = {this.state.categoryMenuShow} as = {InputGroup.Prepend} onToggle = {this.onClickRootCloseCategory.bind(this)}>
														<Dropdown.Toggle variant = "outline-secondary" eventKey = "00"> </Dropdown.Toggle>
														<Dropdown.Menu rootCloseEvent = "click">
															{this.props.data.metaData.categories.map((category) => {
																return (
																	<Dropdown.Item onSelect = {this.onSelectDropdown.bind(this, key, category)} >
																		{category}
																	</Dropdown.Item>
																)
															})}
														</Dropdown.Menu>
													</Dropdown> 
												</InputGroup> 
												<br/>
											</Col>
										</Row>
									)
								}
								else if(key === "Type") {
									return (
										<Row>
											<Col>
												<Form.Label> Type </Form.Label>
												<Form.Control
													as = "input"
													autoComplete = "off"
													name = {key}
													value = {this.state.addModalData[key]}
													onChange = {(e) => {this.onChangeAddModal(e)}}
												/>
												<br/>
												<Row>
													<Col>
														<hr style = {{border: "1px solid lightGray"}} />
														<h5> Fields  <Button variant = "primary" size = "sm" style = {{float: "right"}} onClick = {this.addField.bind(this)}> Add Field + </Button> </h5>
														<br/>
													</Col>
												</Row>
											</Col>
										</Row>
									)
								}
								else if(this.state.fields.length !== 0) {
									return this.state.fields.map((newField, index) => {
										return (
										<div>
											<Row>
												<Col>
													<Button variant = "danger" size = "sm" style = {{float:"right"}} onClick = {this.removeField.bind(this, index)}> X </Button>
												</Col>
											</Row>
											<Row>
												<Col sm = {6}>
													<Form.Label> Field Name </Form.Label>
													<Form.Control
														as = "input"
														name = "fieldName"
														value = {newField.fieldName}
														onChange = {(e) => {this.onChangeField(e, index)}}
													/>
												</Col>
												<Col sm = {6}>
													<Form.Label> Data Type </Form.Label>
													<Form.Control
														as = "select"
														name = "dataType"
														onChange = {(e) => {this.onChangeField(e, index)}}
													>
														<option selected disabled hidden> Select </option>
														<option value = "string"> String </option>
														<option value = "number"> Number </option>
													</Form.Control>
												<br/>
												</Col>
											</Row>
										</div>
										)
									})
								}
							})}
							<Row>
								<Col sm = {6}>
									<Form.Label> Field Name </Form.Label>
									<Form.Control
										as = "input"
										name = "Notes"
										value = "Notes"
										disabled = {true}
									/>
								</Col>
								<Col sm = {6}>
									<Form.Label> Data Type </Form.Label>
									<Form.Control
										as = "select"
										disabled = {true}
									>
										<option value = "string"> String </option>
									</Form.Control>
								<br/>
								</Col>
							</Row>
						</Modal.Body>
						{this.state.showAlert
						?
						<Modal.Footer>
							<div>
								<Alert variant = "danger" onClose = {this.hideAlert.bind(this)} dismissible>
									<p> {this.state.alertMessage} </p>
								</Alert>
							</div>
							<Button variant = "secondary" onClick = {this.closeAddModal.bind(this)}> Close </Button>
							<Button variant = "primary" onClick = {this.onClickSave.bind(this)}> Save </Button>
						</Modal.Footer>
						:
						<Modal.Footer>
							<Button variant = "secondary" onClick = {this.closeAddModal.bind(this)}> Close </Button>
							<Button variant = "primary" onClick = {this.onClickSave.bind(this)}> Save </Button>
						</Modal.Footer>
						}
					</Modal>
				: 
				<div> </div>
				}
				{this.state.showEditModal
				?
					<Modal show = {this.state.showEditModal} backdrop = "static" onHide = {this.closeEditModal.bind(this)} size = "lg">
						<Modal.Header closeButton>
							<Modal.Title>
								Edit Custom Training Data
							</Modal.Title>
						</Modal.Header>
						<Modal.Body>
							<h5> Category & Type </h5>
							<br/>
							{Object.keys(this.state.editModalData).map((key, index) => {
								if(key === "Category") {
									return (
										<Row>
											<Col>
											<Form.Label> Category </Form.Label>
												<Form.Control
													as = "input"
													autoComplete = "off"
													name = {key}
													value = {this.state.editModalData[key]}
													onChange = {(e) => {this.onChangeEditModal(e)}}
													disabled = {true}
												/>
												<br/>
											</Col>
										</Row>
									)
								}
								else if(key === "Type") {
									return (
										<Row>
											<Col>
												<Form.Label> Type </Form.Label>
												<Form.Control
													as = "input"
													autoComplete = "off"
													name = {key}
													value = {this.state.editModalData[key]}
													onChange = {(e) => {this.onChangeEditModal(e)}}
												/>
												<br/>
												<Row>
													<Col>
														<hr style = {{border: "1px solid lightGray"}} />
														<h5> Fields  <Button variant = "primary" size = "sm" style = {{float: "right"}} onClick = {this.addField.bind(this)}> Add Field + </Button> </h5>
														<br/>
													</Col>
												</Row>
											</Col>
										</Row>
									)
								}
								else if(this.state.fields.length !== 0) {
									return this.state.fields.map((newField, index) => {
										return (
										<div>
											<Row>
												<Col>
													<Button variant = "danger" size = "sm" style = {{float:"right"}} onClick = {this.removeField.bind(this, index)}> X </Button>
												</Col>
											</Row>
											<Row>
												<Col sm = {6}>
													<Form.Label> Field Name </Form.Label>
													<Form.Control
														as = "input"
														name = "fieldName"
														value = {newField.fieldName}
														onChange = {(e) => {this.onChangeField(e, index)}}
													/>
												</Col>
												<Col sm = {6}>
													<Form.Label> Data Type </Form.Label>
													<Form.Control
														as = "select"
														name = "dataType"
														onChange = {(e) => {this.onChangeField(e, index)}}
													>
														<option selected hidden> {newField.dataType.charAt(0).toUpperCase() + newField.dataType.slice(1)} </option>
														<option value = "string"> String </option>
														<option value = "number"> Number </option>
													</Form.Control>
												<br/>
												</Col>
											</Row>
										</div>
										)
									})
								}
							})}
							<Row>
								<Col sm = {6}>
									<Form.Label> Field Name </Form.Label>
									<Form.Control
										as = "input"
										name = "Notes"
										value = "Notes"
										disabled = {true}
									/>
								</Col>
								<Col sm = {6}>
									<Form.Label> Data Type </Form.Label>
									<Form.Control
										as = "select"
										disabled = {true}
									>
										<option value = "string"> String </option>
									</Form.Control>
								<br/>
								</Col>
							</Row>
						</Modal.Body>
						{this.state.showAlert
						?
						<Modal.Footer>
							<div>
								<Alert variant = "danger" onClose = {this.hideAlert.bind(this)} dismissible>
									<p> {this.state.alertMessage} </p>
								</Alert>
							</div>
							<Button variant = "secondary" onClick = {this.closeEditModal.bind(this)}> Close </Button>
							<Button variant = "primary" onClick = {this.onClickSaveEdit.bind(this)}> Save </Button>
						</Modal.Footer>
						:
						<Modal.Footer>
							<Button variant = "secondary" onClick = {this.closeEditModal.bind(this)}> Close </Button>
							<Button variant = "primary" onClick = {this.onClickSaveEdit.bind(this)}> Save </Button>
						</Modal.Footer>
						}
					</Modal>
				:
				<div> </div>
				}
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
									<Button variant = "primary" style = {{float: "right"}} onClick = {this.openAddModal.bind(this)}> + </Button>
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
														{category !== "Diet" && category !== "Body" && category !== "Exercise"
														?
														<Row>
															<Col>
																{category}
																<Button size = "sm" variant = "light" style = {{margin: "1%"}} onClick = {this.deleteCategory.bind(this, category)}> 🗑️ </Button>
															</Col>
														</Row>
														:
														<Row>
															<Col>
																{category}
															</Col>
														</Row>
														}
														</Card.Title>
														<Card.Text>
															<Row>
																{this.props.data.metaData.entryTypes.map((entry, entryIndex) => {
																	if(entry.Category === category) {
																		if(entry.deletable) {
																			return (
																				<Col sm = {4}>
																					<Card style = {{height: "100%"}}>
																						<Row>
																							<Col>
																								<Card.Title>
																									<Button size = "sm" variant = "light" style = {{float: "right"}} onClick = {this.deleteData.bind(this, entryIndex)}> 🗑️ </Button>
																									<Button size = "sm" variant = "light" style = {{float: "right"}} onClick = {this.openEditModal.bind(this, entryIndex)}> ✏️ </Button>
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
																			<Col sm = {4} style = {{marginBottom: "3%"}}>
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