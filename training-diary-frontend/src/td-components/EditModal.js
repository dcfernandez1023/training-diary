import React, { Component } from 'react';
import Modal from "react-bootstrap/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import '../td-css/EditModal.css';
import Alert from 'react-bootstrap/Alert';
import Dropdown from 'react-bootstrap/Dropdown';
import ListGroup from 'react-bootstrap/ListGroup';

//PROPS
	//data
	//editModalShow
	//selectedDate
	//toDateString()
	//isSaving
	//dataToEdit
	//editIndex
	//toggleEditModal()
	//toggleSaveBar()
	//reloadCalendar()
	//saveData()
class EditModal extends Component {
	
	state = {
		dataToEdit: null,
		hasLoaded: false,
		entryType: null,
		showAlert: false,
		alertMessage: "",
		nameMenuShow: false
	}

	componentDidMount = () => {
		this.setState({dataToEdit: this.props.dataToEdit});
	}
	componentDidUpdate = () => {
		if(this.state.dataToEdit === null && this.props.dataToEdit !== null) {
			this.setState({dataToEdit: this.props.dataToEdit});
			for(var i = 0; i < this.props.data.metaData.entryTypes.length; i++) {
				if(this.props.dataToEdit.Category === this.props.data.metaData.entryTypes[i].Category && this.props.dataToEdit.Type === this.props.data.metaData.entryTypes[i].Type) {
					this.setState({entryType: this.props.data.metaData.entryTypes[i]});
				}
			}
		}
	}
	
	onSelectName = (value) => {
		var dataCopy = JSON.parse(JSON.stringify(this.state.dataToEdit));
		dataCopy.Name = value;
		this.setState({dataToEdit: dataCopy});
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
		this.setState({showAlert: false});
	}
	
	closeModal = () => {
		this.props.toggleEditModal(null);
		this.setState({dataToEdit: null, hasLoaded: false});
		this.setState({newData: {}, showAlert: false, alertMessage: ""});
	}
	
	resetModal = () => {
		this.setState({dataToEdit: null, hasLoaded: false});
		this.setState({newData: {}, showAlert: false, alertMessage: ""});
	}
	
	validateFields = () => {
		if(this.state.entryType === null) {
			this.showAlert("Cannot save data, you're missing some required fields!");
			return false;
		}
		for(var key in this.state.dataToEdit) {
			if(key === "Notes" || key === "displayOrder") {
				continue;
			}
			else if(this.state.dataToEdit[key].toString().trim().length === 0) {
				this.showAlert("Cannot save data, you're missing some required fields!");
				return false;
			}
			else if(this.state.entryType[key] === "number" && isNaN(Number(this.state.dataToEdit[key]))) {
				this.showAlert("'" + key + "'" + " must be a number!"); 
				return false;
			}
			else if(this.state.entryType[key] === "string" && !isNaN(Number(this.state.dataToEdit[key]))) {
				this.showAlert("'" + key + "'" + " cannot be a number!"); 
				return false;
			}
			else {
				this.state.dataToEdit[key] = this.state.dataToEdit[key].toString().trim();
			}
		}
		this.hideAlert();
		return true;
	}
	
	onChangeEdit = (e) => {
		var copy = JSON.parse(JSON.stringify(this.state.dataToEdit));
		const key = [e.target.name][0];
		const value = e.target.value;
		if(key === "Name") {
			this.showNameList(value);
			copy[key] = value;
		}
		else {
			copy[key] = value;
		}
		this.setState({dataToEdit: copy});
	}
	
	onSelectName = (value) => {
		var dataCopy = JSON.parse(JSON.stringify(this.state.dataToEdit));
		dataCopy.Name = value;
		this.setState({dataToEdit: dataCopy});
	}
	
	saveEdit = async () => {
		var data = JSON.parse(JSON.stringify(this.props.data));
		var nameExists = false;
		if(this.validateFields()) {
			if(this.state.dataToEdit.Name !== undefined && this.state.dataToEdit.Name !== null) {
				for(var i = 0; i < data.entryNames.length; i++) {
					if(this.state.dataToEdit.Name === data.entryNames[i].Name) {
						nameExists = true;
						break;
					}
				}
				if(!nameExists) {
					var newName = {};
					newName.Name = this.state.dataToEdit.Name
					newName.Category = this.state.dataToEdit.Category;
					newName.Type = this.state.dataToEdit.Type;
					data.entryNames.push(newName);
				}
			}
			data.userData[this.props.editIndex] = this.state.dataToEdit;
			await this.props.saveData(data, "save", "EditModal");
			this.props.reloadCalendar();
			this.closeModal();
		}
		else {
			return;
		}
	}
	
	createEditFields = () => {
		if(this.state.dataToEdit === null || this.state.dataToEdit == undefined) {
			return null;
		}
		const editFields = this.state.dataToEdit.displayOrder.map((key) => {
			if(key === "Category" || key === "Type") {
				return (
					<ListGroup horizontal>
						<ListGroup.Item style = {{width: "50%"}}>
							{key}
						</ListGroup.Item>
						<ListGroup.Item style = {{width: "50%"}}>
								<FormControl
									as = "input"
									name = {key}
									value = {this.state.dataToEdit[key]}
									disabled = {true}
								/>
						</ListGroup.Item>
					</ListGroup>
				);
			}
			else if(key === "Name") {
				var nameList = [];
				for(var i = 0; i < this.props.data.entryNames.length ; i++) {
					var nameData = this.props.data.entryNames[i];
					if(this.state.dataToEdit.Category === nameData.Category && this.state.dataToEdit.Type === nameData.Type) {
						nameList.push(nameData.Name);
					}
				}
				return (
					<ListGroup horizontal>
						<ListGroup.Item style = {{width: "50%"}}>
							{key}
						</ListGroup.Item>
						<ListGroup.Item style = {{width: "50%"}}>
							<InputGroup>
								<Form.Control
									as = "input"
									autoComplete = "off"
									name = {key}
									value = {this.state.dataToEdit[key]}
									onChange = {(e) => {this.onChangeEdit(e)}}
								/>
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
							</InputGroup> 
						</ListGroup.Item>
					</ListGroup>
				);
			}
			else {
				return (
					<ListGroup horizontal>
						<ListGroup.Item style = {{width: "50%"}}>
							{key}
						</ListGroup.Item>
						<ListGroup.Item style = {{width: "50%"}}>
							<FormControl
								as = "input"
								name = {key}
								value = {this.state.dataToEdit[key]}
								onChange = {(e) => {this.onChangeEdit(e)}}
							/>
						</ListGroup.Item>
					</ListGroup>
				);
			}
		});
		return <div> {editFields} </div>
	}
	
	render() {
		const inputs = this.createEditFields();
		const dateString = this.props.toDateString(this.props.selectedDate);
		return (
			<Modal 
				show={this.props.editModalShow}
				centered = {true}
				scrollable = {true}
				size = "lg"
				onExited = {this.resetModal}
			>
			  <Modal.Header>
				<h4 className = "modal-header-tag"> Edit Training Data </h4>
				<h4 className = "modal-header-tag"> {dateString} </h4>
			  </Modal.Header>
			  
			  <Modal.Body>
				{inputs}
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
						<Button variant = "primary" disabled = {this.props.isSaving} onClick = {(e) => {this.saveEdit(e)}}> Save </Button>
					</Modal.Footer>
				
				:
				
					<Modal.Footer>
						<Alert className = "error-alert" variant = "danger" onClose = {this.hideAlert.bind(this)} dismissible>
							<p> {this.state.alertMessage} </p>
						</Alert>
						<div className = "loader-container">
							<Loader type="ThreeDots" 
								color="#00BFFF" 
								height={80} 
								width={80} 
								visible = {this.props.isSaving}
							/>
						</div>
						<Button variant = "primary" disabled = {this.props.isSaving} onClick = {this.closeModal}> Close </Button>
						<Button variant = "primary" disabled = {this.props.isSaving} onClick = {(e) => {this.saveEdit(e)}}> Save </Button>
					</Modal.Footer>
				}
			</Modal>		
		);
	}
}

export default EditModal; 