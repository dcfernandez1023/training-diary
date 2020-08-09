import React, { Component } from 'react';
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import '../td-css/AddModal.css';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import uuid from 'react-uuid';
import Alert from 'react-bootstrap/Alert';
import Dropdown from 'react-bootstrap/Dropdown';
import ListGroup from 'react-bootstrap/ListGroup';
//PROPS
	//data
	//saveData()
	//updateShow()
	//toDateString()
	//selectedDate
	//addModalShow
	//isSaving
	//toggleSaveBar()
	//toggleAddModal()
	//createDateList()
	//reloadCalendar()
class AddModal extends Component {
	
	state = {
		data: null,
		newData: {},
		entryType: null,
		showAlert: false,
		alertMessage: "",
		nameMenuShow: false
	}
	
	/* COMPONENT MOUNTING AND UPDATING METHODS */ 
	
	componentDidMount = () => {
		this.setState({data: this.props.data});
	}
	
	componentDidUpdate = () => {
		if(this.state.data !== this.props.data) {
			this.setState({data: this.props.data});
		}
	}
	
	onSelectName = (value) => {
		var dataCopy = JSON.parse(JSON.stringify(this.state.newData));
		dataCopy.Name = value;
		this.setState({newData: dataCopy});
	}
	
	showNameList = (nameSearch) => {
		if(nameSearch.length === 0) {
			this.setState({nameMenuShow: false});
		}
		else {
			this.setState({nameMenuShow: true});
		}
	}	

	onClickRootClose = () => {
		if(this.state.nameMenuShow) {
			this.setState({nameMenuShow: false});
		}
		else {
			this.setState({nameMenuShow: true});
		}
	}
	
	showAlert = (msg) => {
		this.setState({showAlert: true, alertMessage: msg});
	}
	
	hideAlert = () => {
		this.setState({showAlert: false, alertMessage: ""});
	}
	
	/* SAVING METHODS */ 
	
	validateFields = () => {
		if(this.state.entryType === null || Object.keys(this.state.newData).length === 0) {
			console.log("here...");
			this.showAlert("Cannot save data, you're missing some required fields!");
			return false;
		}
		for(var key in this.state.newData) {
			if(key === "Notes" || key === "displayOrder") {
				continue;
			}
			else if(this.state.newData[key].toString().trim().length === 0) {
				console.log("here!!!");
				this.showAlert("Cannot save data, you're missing some required fields!");
				return false;
			}
			else if(this.state.entryType[key] === "number" && isNaN(Number(this.state.newData[key]))) {
				this.showAlert("'" + key + "'" + " must be a number!"); 
				return false;
			}
			else if(this.state.entryType[key] === "string" && !isNaN(Number(this.state.newData[key]))) {
				this.showAlert("'" + key + "'" + " cannot be a number!"); 
				return false;
			}
			else {
				this.state.newData[key] = this.state.newData[key].toString().trim();
			}
		}
		this.hideAlert();
		return true;
	}
	
	hasTypeBeenEntered = () => {
		for(var i = 0; i < this.state.data.userData.length; i++) {
			const entry = this.state.data.userData[i];
			if(new Date(entry.Date).getTime() === this.props.selectedDate.getTime() && entry.Category === this.state.newData.Category && entry.Type === this.state.newData.Type) {
				return i; //return index of entry
			}
		}
		return -1;
	}
	
	calculateNewAmount = (dataIndex) => {
		if(dataIndex === -1) {
			this.state.data.userData.push(this.state.newData);
			return;
		}
		var calculationKey = null;
		for(var key in this.state.entryType) {
			if(this.state.entryType[key] === "number") {
				calculationKey = key;
			}
		}
		if(calculationKey === null) {
			alert("Error: Could not calculate new amount -- null");
			return;
		}
		if(this.state.entryType.calculationType === "add") {
			var newValue = (Number(this.state.data.userData[dataIndex][calculationKey]) + Number(this.state.newData[calculationKey]));
			console.log(newValue);
			if(Math.floor(newValue) !== newValue) {
				newValue = newValue.toFixed(2);
			}
			this.state.data.userData[dataIndex][calculationKey] = newValue.toString();
		}
		else if(this.state.entryType.calculationType === "subtract") {
			var newValue = (Number(this.state.data.userData[dataIndex][calculationKey]) - Number(this.state.newData[calculationKey]));
			if(Math.floor(newValue) !== newValue) {
				newValue = newValue.toFixed(2);
			}
			this.state.data.userData[dataIndex][calculationKey] = newValue.toString();
		}
		else if(this.state.entryType.calculationType === "multiply") {
			var newValue = (Number(this.state.data.userData[dataIndex][calculationKey]) * Number(this.state.newData[calculationKey]));
			if(Math.floor(newValue) !== newValue) {
				newValue = newValue.toFixed(2);
			}
			this.state.data.userData[dataIndex][calculationKey] = newValue.toString();
		}
		else if(this.state.entryType.calculationType === "divide") {
			var newValue = (Number(this.state.data.userData[dataIndex][calculationKey]) / Number(this.state.newData[calculationKey]));
			if(Math.floor(newValue) !== newValue) {
				newValue = newValue.toFixed(2);
			}
			this.state.data.userData[dataIndex][calculationKey] = newValue.toString();
		}
		else if(this.state.entryType.calculationType === "average") {
			var newValue = (Number(this.state.data.userData[dataIndex][calculationKey]) + Number(this.state.newData[calculationKey]));
			newValue = newValue / 2;
			if(Math.floor(newValue) !== newValue) {
				newValue = newValue.toFixed(2);
			}
			this.state.data.userData[dataIndex][calculationKey] = newValue.toString();
		}
		else if(this.state.entryType.calculationType === "none") {
			this.state.data.userData.push(this.state.newData);
		}
	}
	
	//calls post api to save data to database
	saveNewData = async () => {
		if(!this.validateFields()) {
			return;
		}
		//this.props.toggleSaveBar();
		var nameExists = false;
		if(this.state.newData.Name !== undefined && this.state.newData.Name !== null) {
			var currentName = this.state.newData.Name;
			for(var i = 0; i < this.state.data.entryNames.length; i++) {
				if(currentName === this.state.data.entryNames[i].Name) {
					nameExists = true;
					break;
				}
			}
			if(!nameExists) {
				var newName = {};
				newName.Name = currentName;
				newName.Category = this.state.newData.Category;
				newName.Type = this.state.newData.Type;
				this.state.data.entryNames.push(newName);
			}
		}
		this.state.data.userData.push(this.state.newData);
		await this.props.saveData(this.state.data, "save", "AddModal"); //need to make this saveData() function more dynamic 
		this.props.reloadCalendar(); //reloads calendar component so changes are seen immediately without waiting for response from server
		this.closeModal();
	}
	
	/* MODAL RENDERING METHODS */
	
	closeModal = () => {
		this.props.toggleAddModal();
		this.setState({newData: {}, showAlert: false, alertMessage: ""});
	}
	
	resetModal = () => {
		this.setState({newData: {}});
	}
	
	//onChange event handler for when user enters something in new data field 
	onChangeNewData = (e) => {
		var newDataCopy;
		var entry = null;
		const key = [e.target.name][0];
		const value = e.target.value;
		newDataCopy = this.state.newData;
		if(newDataCopy === null || newDataCopy === undefined) {
			newDataCopy = {};
		}
		if(key === "Category") {
			newDataCopy = {[key]: value, "Type": ""};
		}
		else if(key === "Type") {
			newDataCopy = {"Category": this.state.newData.Category, [key]: value};
			for(var i = 0; i < this.props.data.metaData.entryTypes.length; i++) {
				const entryType = this.props.data.metaData.entryTypes[i];
				if(entryType.Category === this.state.newData.Category && entryType.Type === value) {
					for(var x = 0; x < entryType.displayOrder.length; x++) {
						const entryKey = entryType.displayOrder[x];
						if(entryKey !== "Category" && entryKey !== "Type") {
							newDataCopy[entryKey] = "";
						}
					}
					newDataCopy.displayOrder = entryType.displayOrder;
					newDataCopy.Date = this.props.selectedDate.toString();
					entry = entryType;
					break;
				}
			}
		}
		else if(key === "Name") {
			this.showNameList(value);
			newDataCopy[key] = value;
			entry = this.state.entryType;
		}
		else {
			newDataCopy[key] = value;
			entry = this.state.entryType;
		}
		this.setState({newData: newDataCopy, entryType: entry});
	}

	//creates input fields from metaData 
	createForm = () => {
		if(this.props.data === null) {
			return null;
		}
		var inputs;
		const newDataKeys = Object.keys(this.state.newData);
		if(newDataKeys.length === 0) {
			inputs = <ListGroup horizontal>
						<ListGroup.Item style = {{width: "50%"}}>
							Category
						</ListGroup.Item>
						<ListGroup.Item style = {{width: "50%"}}>
							<FormControl as = "select" name = "Category" onChange = {(e) => {this.onChangeNewData(e)}}>
								<option  value = "" selected disabled hidden> Select </option>
								{this.props.data.metaData.categories.map((category) => {
									return (
										<option value = {category}>
											{category}
										</option>
									)
								})}
							</FormControl>
						</ListGroup.Item>
					</ListGroup>
			return inputs;
		}
		inputs = newDataKeys.map((field) => {
			if(field === "Category") {
				return (
					<ListGroup horizontal> 
						<ListGroup.Item style = {{width: "50%"}}>
							{field}
						</ListGroup.Item>
						<ListGroup.Item style = {{width: "50%"}}>
							<FormControl as = "select" value = {this.state.newData[field]} name = {field} onChange = {(e) => {this.onChangeNewData(e)}}>
								<option  value = "" selected disabled hidden> Select </option>
								{this.props.data.metaData.categories.map((category) => {
									return (
										<option value = {category}>
											{category}
										</option>
									)
								})}
							</FormControl>
						</ListGroup.Item>
					</ListGroup>
				);
			}
			else if(field === "Type") {
				return (
					<ListGroup horizontal>
						<ListGroup.Item style = {{width: "50%"}}>
							{field}
						</ListGroup.Item>
						<ListGroup.Item style = {{width: "50%"}}>
							<FormControl as = "select" value = {this.state.newData[field]} name = {field} onChange = {(e) => {this.onChangeNewData(e)}}>
								<option  value = "" selected disabled hidden> Select </option>
								{this.props.data.metaData.entryTypes.map((entry) => {
									if(entry.Category === this.state.newData.Category) {
										return (
											<option value = {entry.Type}>
												{entry.Type}
											</option>
										)
									}
								})}
							</FormControl>
						</ListGroup.Item>
					</ListGroup>
				);
			}
			else {
				if(field !== "displayOrder" && field !== "Date") {
					if(field === "Name") {
						var nameList = [];
						for(var i = 0; i < this.state.data.entryNames.length ; i++) {
							var nameData = this.state.data.entryNames[i];
							if(this.state.newData.Category === nameData.Category && this.state.newData.Type === nameData.Type) {
								nameList.push(nameData.Name);
							}
						}
						return (
							<ListGroup horizontal>
								<ListGroup.Item style = {{width: "50%"}}>
									{field}
								</ListGroup.Item>
								<ListGroup.Item style = {{width: "50%"}}>
									<InputGroup>
										<Dropdown show = {this.state.nameMenuShow} as = {InputGroup.Prepend} onToggle = {this.onClickRootClose.bind(this)}>
											<Dropdown.Toggle variant = "outline-secondary" eventKey = "00"> </Dropdown.Toggle>
											<Dropdown.Menu rootCloseEvent = "click">
												{nameList.map((name) => {
													return (
														<Dropdown.Item onSelect = {this.onSelectName.bind(this, name)} >
															{name}
														</Dropdown.Item>
													)
												})}
											</Dropdown.Menu>
										</Dropdown> 
										<Form.Control
											as = "input"
											autoComplete = "off"
											name = {field}
											value = {this.state.newData[field]}
											onChange = {(e) => {this.onChangeNewData(e)}}
										/>
									</InputGroup> 
								</ListGroup.Item>
							</ListGroup>
						);
					}
					else {
						return (
							<ListGroup horizontal>
								<ListGroup.Item style = {{width: "50%"}}>
									{field}
								</ListGroup.Item>
								<ListGroup.Item style = {{width: "50%"}}>
									<FormControl as = "input" value = {this.state.newData[field]} name = {field} onChange = {(e) => {this.onChangeNewData(e)}} />
								</ListGroup.Item>
							</ListGroup>
						);
					}
				}
			}
		});
		return <div> {inputs} </div>
	}
	
	render () {
		const formInputs = this.createForm()
		const dateString = this.props.toDateString(this.props.selectedDate)
		return (
			<Modal 
				show={this.props.addModalShow}
				centered = {true}
				scrollable = {true}
				size = "lg"
				onExited = {this.resetModal}
			>
			  <Modal.Header>
				<h4 className = "modal-header-tag"> Add Training Data </h4>
				<h4 className = "modal-header-tag"> {dateString} </h4>
				{/*<Button variant = "primary"> Add </Button>*/}
			  </Modal.Header>
			  
			  <Modal.Body>
				{formInputs}
			  </Modal.Body>
				
			  
				{!this.state.showAlert
				?
					<Modal.Footer>
						<div className = "loader-container">
							<Loader type="ThreeDots" 
								color="#00BFFF" 
								height={80} 
								width={80} 
								visible = {this.props.isSaving}
							/>
						</div>
						<Button variant = "primary" disabled = {this.props.isSaving} onClick = {this.closeModal}> Close </Button>
						<Button variant = "primary" disabled = {this.props.isSaving} onClick = {this.saveNewData}> Save </Button>
					</Modal.Footer>
				
				:
					<Modal.Footer>
						<div className = "alert-container">
							<Alert className = "error-alert" variant = "danger" onClose = {this.hideAlert.bind(this)} dismissible>
								<p> {this.state.alertMessage} </p>
							</Alert>
						</div>
						<div className = "loader-container">
							<Loader type="ThreeDots" 
								color="#00BFFF" 
								height={80} 
								width={80} 
								visible = {this.props.isSaving}
							/>
						</div>
						<Button variant = "primary" disabled = {this.props.isSaving} onClick = {this.closeModal}> Close </Button>
						<Button variant = "primary" disabled = {this.props.isSaving} onClick = {this.saveNewData}> Save </Button>
					</Modal.Footer>
				}
			</Modal>
		);
	}
}

export default AddModal;