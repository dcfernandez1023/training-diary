import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Overlay from 'react-bootstrap/Overlay';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import PopoverContent from 'react-bootstrap/PopoverContent';
import PopoverTitle from 'react-bootstrap/PopoverTitle';
import uuid from 'react-uuid';
import Table from 'react-bootstrap/Table';
import DatePicker from 'react-datepicker';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import CardDeck from 'react-bootstrap/CardDeck';
import Modal from "react-bootstrap/Modal";
import Alert from 'react-bootstrap/Alert';
import Pie from 'react-chartjs-2';
import InputGroup from 'react-bootstrap/InputGroup';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Tooltip from 'react-bootstrap/Tooltip';

class Goals extends Component {
	
	state = {
		editing: false,
		adding: false, 
		goalEditing: "",
		goalAdding: "",
		editingData: {},
		addingData: {},
		goalIndex: -1,
		data: null,
		invalidFields: false,
		alertMessage: "",
		colors: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'],
		nameMenuShow: false,
		screenWidth: 0
		
	}
	
	componentDidMount = () => {
		window.addEventListener("resize", this.updateWidth);
		this.setState({data: this.props.data, screenWidth: window.innerWidth});
	}
	
	updateWidth = () => {
		this.setState({screenWidth: window.innerWidth});
	}
	
	openEditModal = (category, index) => {
		var editingData = this.state.data.goals[index];
		this.setState({editing: true, goalEditing: category, editingData: editingData, goalIndex: index});
	}
	
	closeEditModal = () => {
		this.setState({editing: false, goalEditing: "", editingData: {}, goalIndex: -1, alertMessage: "", invalidFields: false});
	}
	
	openAddModal = (category) => {
		var addingData = {};
		for(var key in this.state.data.metaData.goalStructure) {
			addingData[key] = this.state.data.metaData.goalStructure[key];
		}
		addingData["Goal Type"] = category;
		addingData.Fields = {};
		for(var i = 0; i < this.state.data.metaData.entryTypes.length; i++) {
			var entry = this.state.data.metaData.entryTypes[i];
			if(category === entry.Category) {
				addingData.Fields.Type = "";
			}
		}
		this.setState({adding: true, goalAdding: category, addingData: addingData});
	}
	
	closeAddModal = () => {
		this.setState({adding: false, goalAdding: "", addingData: {}, alertMessage: "", invalidFields: false});
	}
	
	onChangeEdit = (e) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		var dataCopy = JSON.parse(JSON.stringify(this.state.editingData));
		dataCopy.Fields[name] = value;
		this.setState({editingData: dataCopy});
	}
	
	onClickRootClose = () => {
		if(this.state.nameMenuShow) {
			this.setState({nameMenuShow: false});
		}
		else {
			this.setState({nameMenuShow: true});
		}
	}
	
	showNameList = (nameSearch) => {
		if(nameSearch.length === 0) {
			this.setState({nameMenuShow: false});
		}
		else {
			this.setState({nameMenuShow: true});
		}
	}
	
	onSelectName = (value) => {
		var dataCopy = JSON.parse(JSON.stringify(this.state.addingData));
		dataCopy.Fields.Name = value;
		this.setState({addingData: dataCopy});
	}
	
	onChangeAdd = (e) => {
		var name = [e.target.name][0];
		var value = e.target.value;
		var dataCopy = JSON.parse(JSON.stringify(this.state.addingData));
		if(name === "Type") {
			dataCopy.Fields = {};
			dataCopy.Fields[name] = value;
			for(var i = 0; i < this.state.data.metaData.entryTypes.length; i++) {
				var entry = this.state.data.metaData.entryTypes[i];
				if(entry.Category === this.state.goalAdding && entry.Type === value) {
					for(var x = 0; x < entry.displayOrder.length; x++) {
						var field = entry.displayOrder[x];
						if(entry[field] === "string" && field !== "Notes" && field !== "Category") {
							dataCopy.Fields[field] = "";
						}
						else if(entry[field] === "number") {
							dataCopy.Fields[field] = 0;
						}
					}
					break;
				}
			}
		}
		else if(name === "Name") {
			this.showNameList(value);
			dataCopy.Fields[name] = value;
		}
		else {
			dataCopy.Fields[name] = value;
		}
		this.setState({addingData: dataCopy});
	}
	
	deleteGoal = async (goalIndex) => {
		var dataCopy = JSON.parse(JSON.stringify(this.state.data));
		if(window.confirm("Are you sure you want to delete this goal?")) {
			dataCopy.goals.splice(goalIndex, 1);
			this.setState({data: dataCopy});
			await this.props.saveData(dataCopy, "save", "Goals");
		}
	}
	
	showAlert = (msg) => {
		this.setState({invalidFields: true, alertMessage: msg});
	}
	
	hideAlert = () => {
		this.setState({invalidFields: false, alertMessage: ""});
	}
	
	checkEditFields = () => {
		var entryType = null;
		for(var i = 0; i < this.state.data.metaData.entryTypes.length; i++) {
			var entry = this.state.data.metaData.entryTypes[i];
			if(entry.Category === this.state.editingData["Goal Type"] && Object.keys(this.state.editingData.Fields).includes(entry.Type)) {
				entryType = entry;
				break;
			}
			else if(entry.Category === this.state.editingData["Goal Type"] && this.state.editingData.Fields.Type === entry.Type) {
				entryType = entry;
				break;
			}
		}
		if(entryType === null) {
			alert("Sorry, an error occurred -- you cannot update this goal");
			return;
		}
		for(var key in this.state.editingData.Fields) {
			if(this.state.editingData.Fields[key].toString().trim().length === 0) {
				this.showAlert("Cannot save data. You're missing some required fields!");
				return false;
			}
			else if(entryType[key] === "number" && isNaN(this.state.editingData.Fields[key])) {
				this.showAlert("'" + key + "' " + "must be a number!");
				return false;
			}
		}
		return true;
	}
	
	checkAddFields = () => {
		var entryType = null;
		for(var i = 0; i < this.state.data.metaData.entryTypes.length; i++) {
			var entry = this.state.data.metaData.entryTypes[i];
			if(entry.Category === this.state.addingData["Goal Type"] && entry.Type === this.state.addingData.Fields.Type) {
				entryType = entry;
				break;
			}
		}
		for(var key in this.state.addingData.Fields) {
			if(this.state.addingData.Fields[key].toString().trim().length === 0) {
				this.showAlert("Cannot save data. You're missing some required fields!");
				return false;
			}
			else if(entryType[key] === "number" && isNaN(this.state.addingData.Fields[key])) {
				this.showAlert("'" + key + "' " + "must be a number!");
				return false;
			}
		}
		return true;
	}
	
	onClickSaveEdit = async () => {
		if(this.checkEditFields()) {
			var dataCopy = JSON.parse(JSON.stringify(this.state.data));
			for(var key in this.state.editingData.Fields) {
				this.state.editingData.Fields[key] = this.state.editingData.Fields[key].toString().trim();
			}
			this.state.editingData.lastUpdated = new Date();
			dataCopy.goals[this.state.goalIndex] = this.state.editingData;
			this.setState({data: dataCopy});
			await this.props.saveData(dataCopy, "save", "Goals");
			this.closeEditModal();
		}
		else {
			return;
		}
	}
	
	onClickSaveAdd = async () => {
		if(this.checkAddFields()) {
			var dataCopy = JSON.parse(JSON.stringify(this.state.data));
			for(var key in this.state.addingData.Fields) {
				this.state.addingData.Fields[key] = this.state.addingData.Fields[key].toString().trim();
			}
			this.state.addingData.lastUpdated = new Date();
			this.state.addingData.fieldOrder = Object.keys(this.state.addingData.Fields);
			dataCopy.goals.push(this.state.addingData);
			this.setState({data: dataCopy});
			await this.props.saveData(dataCopy, "save", "Goals");
			this.closeAddModal();
		}
		else {
			return;
		}
	}
	
	validateMacros = () => {
		var percentageTotal = 0;
		for(var key in this.state.editingData.Fields) {
			if(key !== "Calories") {
				percentageTotal = percentageTotal + Number(this.state.editingData.Fields[key])
			}
		}
		if(percentageTotal !== 100) {
			this.showAlert("Macronutrients must total 100%");
			return false;
		}
		return true;
	}
	
	constructPieData = (fields) => {
		var data = [];
		var labels = [];
		for(var key in fields) {
			if(key !== "Calories" && !isNaN(fields[key])) {
				data.push(fields[key]);
				labels.push(key);
			}
		}
		var pieData = {
			datasets: [{
				data: data,
				backgroundColor: [
					'#FF6384',
					'#36A2EB',
					'#FFCE56',
					'#484a47',
					'#a37774',
					'#e88873',
					'#e0ac9d',
					'#7ebdc2',
					'#f3dfa2',
					'#efe6dd',
					],
				hoverBackgroundColor: [
					'#FF6384',
					'#36A2EB',
					'#FFCE56',
					'#484a47',
					'#a37774',
					'#e88873',
					'#e0ac9d',
					'#7ebdc2',
					'#f3dfa2',
					'#efe6dd',
				]
			}],
			labels: labels,
		}
		return pieData;
	}
	
	render() {
		if(this.state.data === null) {
			return (
				<div> </div>
			);
		}
		
		const breakpoint = 500;
		const width = this.state.screenWidth;
		
		return (
			<Container fluid>
				{this.state.editing 
					?
						<Modal size = "lg" show = {this.state.editing} onHide = {this.closeEditModal.bind(this)}>
							<Modal.Header closeButton>
								<Modal.Title as = "h5"> Edit {this.state.goalEditing} Goal </Modal.Title>
							</Modal.Header>
							<Modal.Body>
							{!this.state.editingData.deletable
							?
							<div>
								{this.state.editingData.fieldOrder.map((field) => {
									if(width < breakpoint) {
										return (
											<div style = {{marginBottom: "5%"}}>
												<Form.Label> {field} </Form.Label>
												<Form.Control
													as = "input"
													autoComplete = "off"
													name = {field}
													value = {this.state.editingData.Fields[field]}
													onChange = {(e) => {this.onChangeEdit(e)}}
												/>			
											</div>
										)
									}
									return (
										<ListGroup horizontal>
											<ListGroup.Item style = {{width: "50%"}}>
												{field}
											</ListGroup.Item>
											<ListGroup.Item style = {{width: "50%"}}>
												<Form.Control
													as = "input"
													autoComplete = "off"
													name = {field}
													value = {this.state.editingData.Fields[field]}
													onChange = {(e) => {this.onChangeEdit(e)}}
												/>			
											</ListGroup.Item>
										</ListGroup>
									);
								})}
							</div>
							:
							<div>
								{this.state.editingData.fieldOrder.map((field) => {
									if(width < breakpoint) {
										if(field === "Type") {
											return (
												<div style = {{marginBottom: "5%"}}>
													<Form.Label> {field} </Form.Label>
													<Form.Control 
														as = "select"
														name = {field}
														value = {this.state.editingData.Fields[field]}
														onChange = {(e) => {this.onChangeEdit(e)}}
														disabled = {true}
													>
														<option  value = "" selected disabled hidden> Select </option>
														{this.props.data.metaData.entryTypes.map((entry) => {
															if(this.state.goalEditing === entry.Category) {
																return (
																	<option value = {entry.Type}> {entry.Type} </option>
																);
															}
														})}
													</Form.Control>
												</div>
											)
										}
										else if (field === "Name") {
											var nameList = [];
											for(var i = 0; i < this.state.data.entryNames.length ; i++) {
												var nameData = this.state.data.entryNames[i];
												if(this.state.goalEditing === nameData.Category && this.state.editingData.Fields.Type === nameData.Type) {
													nameList.push(nameData.Name);
												}
											}
											return (
												<div style = {{marginBottom: "5%"}}>
													<Form.Label> {field} </Form.Label>
													<InputGroup>
														<Form.Control
															as = "input"
															autoComplete = "off"
															name = {field}
															value = {this.state.editingData.Fields[field]}
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
												</div>
											)
										}
										else {
											return (
												<div style = {{marginBottom: "5%"}}>
													<Form.Label> {field} </Form.Label>
													<Form.Control
														as = "input"
														autoComplete = "off"
														name = {field}
														value = {this.state.editingData.Fields[field]}
														onChange = {(e) => {this.onChangeEdit(e)}}
													/>	
												</div>
											);
										}
									}
									else {
										if(field === "Type") {
											return (
												<ListGroup horizontal>
													<ListGroup.Item style = {{width: "50%"}}>
														{field}
													</ListGroup.Item>
													<ListGroup.Item style = {{width: "50%"}}>
														<Form.Control 
															as = "select"
															name = {field}
															value = {this.state.editingData.Fields[field]}
															onChange = {(e) => {this.onChangeEdit(e)}}
															disabled = {true}
														>
															<option  value = "" selected disabled hidden> Select </option>
															{this.props.data.metaData.entryTypes.map((entry) => {
																if(this.state.goalEditing === entry.Category) {
																	return (
																		<option value = {entry.Type}> {entry.Type} </option>
																	);
																}
															})}
														</Form.Control>
													</ListGroup.Item>
												</ListGroup>
											)
										}
										else if (field === "Name") {
											var nameList = [];
											for(var i = 0; i < this.state.data.entryNames.length ; i++) {
												var nameData = this.state.data.entryNames[i];
												if(this.state.goalEditing === nameData.Category && this.state.editingData.Fields.Type === nameData.Type) {
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
															<Form.Control
																as = "input"
																autoComplete = "off"
																name = {field}
																value = {this.state.editingData.Fields[field]}
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
											)
										}
										else {
											return (
												<ListGroup horizontal>
													<ListGroup.Item style = {{width: "50%"}}>
														{field}
													</ListGroup.Item>
													<ListGroup.Item style = {{width: "50%"}}>
														<Form.Control
															as = "input"
															autoComplete = "off"
															name = {field}
															value = {this.state.editingData.Fields[field]}
															onChange = {(e) => {this.onChangeEdit(e)}}
														/>			
													</ListGroup.Item>
												</ListGroup>
											);
										}
									}
								})}
								</div>
							}
							</Modal.Body>
							<Modal.Footer>
								{this.state.invalidFields 
									?
										<Alert show = {this.state.invalidFields} variant = "danger" onClose = {this.hideAlert.bind(this)} dismissible>
											<p> {this.state.alertMessage} </p>
										</Alert>
									:
										<div> </div>
								}
								<Button variant = "secondary" onClick = {this.closeEditModal.bind(this)}> Close </Button>
								<Button variant = "primary" onClick = {this.onClickSaveEdit.bind(this)}> Save </Button>
							</Modal.Footer>
						</Modal>
					:
					<div> </div>
				}
				
				{this.state.adding 
					?
						<Modal size = "lg" show = {this.state.adding} onHide = {this.closeAddModal.bind(this)}>
							<Modal.Header closeButton>
								<Modal.Title as = "h5"> Add {this.state.goalAdding} Goal </Modal.Title>
							</Modal.Header>
							<Modal.Body>
							{this.state.goalAdding !== "Diet" && this.state.goalAdding !== "Body"
							?
							<div>
								{Object.keys(this.state.addingData.Fields).map((field) => {
									if(field === "Type") {
										if(width < breakpoint) {
											return (
												<div style = {{marginBottom: "5%"}}>
													<Form.Label> {field} </Form.Label>
													<Form.Control 
														as = "select"
														name = {field}
														value = {this.state.addingData.Fields[field]}
														onChange = {(e) => {this.onChangeAdd(e)}}
													>
														<option  value = "" selected disabled hidden> Select </option>
														{this.props.data.metaData.entryTypes.map((entry) => {
															if(this.state.goalAdding === entry.Category) {
																return (
																	<option value = {entry.Type}> {entry.Type} </option>
																);
															}
														})}
													</Form.Control>
												</div>
											)
										}
										return (
											<ListGroup horizontal>
												<ListGroup.Item style = {{width: "50%"}}>
													{field} 
												</ListGroup.Item>
												<ListGroup.Item style = {{width: "50%"}}>
													<Form.Control 
														as = "select"
														name = {field}
														value = {this.state.addingData.Fields[field]}
														onChange = {(e) => {this.onChangeAdd(e)}}
													>
														<option  value = "" selected disabled hidden> Select </option>
														{this.props.data.metaData.entryTypes.map((entry) => {
															if(this.state.goalAdding === entry.Category) {
																return (
																	<option value = {entry.Type}> {entry.Type} </option>
																);
															}
														})}
													</Form.Control>
												</ListGroup.Item>
											</ListGroup>
										)
									}
									else if (field === "Name") {
										var nameList = [];
										for(var i = 0; i < this.state.data.entryNames.length ; i++) {
											var nameData = this.state.data.entryNames[i];
											if(this.state.goalAdding === nameData.Category && this.state.addingData.Fields.Type === nameData.Type) {
												nameList.push(nameData.Name);
											}
										}
										if(width < breakpoint) {
											return (
												<div style = {{marginBottom: "5%"}}>
													<Form.Label> {field} </Form.Label>
													<InputGroup>
														<Form.Control
															as = "input"
															autoComplete = "off"
															name = {field}
															value = {this.state.addingData.Fields[field]}
															onChange = {(e) => {this.onChangeAdd(e)}}
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
												</div>
											)
										}
										return (
											<ListGroup horizontal>
												<ListGroup.Item style = {{width: "50%"}}>
													{field}
												</ListGroup.Item>
												<ListGroup.Item style = {{width: "50%"}}>
													<InputGroup>
														<Form.Control
															as = "input"
															autoComplete = "off"
															name = {field}
															value = {this.state.addingData.Fields[field]}
															onChange = {(e) => {this.onChangeAdd(e)}}
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
										)
									}
									else {
										if(width < breakpoint) {
											return (
												<div style = {{marginBottom: "5%"}}>
													<Form.Label> {field} </Form.Label>
													<Form.Control
														as = "input"
														name = {field}
														value = {this.state.addingData.Fields[field]}
														onChange = {(e) => {this.onChangeAdd(e)}}
													/>		
												</div>
											);
										}
										return (
											<ListGroup horizontal>
												<ListGroup.Item style = {{width: "50%"}}>
													{field}
												</ListGroup.Item>
												<ListGroup.Item style = {{width: "50%"}}>
													<Form.Control
														as = "input"
														name = {field}
														value = {this.state.addingData.Fields[field]}
														onChange = {(e) => {this.onChangeAdd(e)}}
													/>			
												</ListGroup.Item>
											</ListGroup>
										);
									}
								})}
								</div>
							:
							<div>
								{Object.keys(this.state.addingData.Fields).map((field) => {
									if(field === "Type") {
										var toolTip = <Tooltip> The default {this.state.goalAdding} fields cannot be edited, deleted, or added. If you want to add additional {this.state.goalAdding} goals, 
											then add a new Type under the Customize Data tab in your Profile page. </Tooltip>
										if(width < breakpoint) {
											return (
												<div style = {{marginBottom: "5%"}}>
													<Row>
														<Col>
															<Form.Label> {field} </Form.Label>
																<OverlayTrigger
																	placement = "right"
																	delay = {{ show: 250, hide: 400 }}
																	overlay = {toolTip}
																	
																>
																	<Button variant = "light" size = "sm" style = {{marginLeft: "1.5%"}}> ℹ️ </Button>
																</OverlayTrigger>
														</Col>
													</Row>
													<Row>
														<Col>
															<Form.Control 
																as = "select"
																name = {field}
																value = {this.state.addingData.Fields[field]}
																onChange = {(e) => {this.onChangeAdd(e)}}
															>
																<option  value = "" selected disabled hidden> Select </option>
																{this.props.data.metaData.entryTypes.map((entry) => {
																	if(this.state.goalAdding === entry.Category && !this.state.data.metaData.nonDeletableGoalFields.includes(entry.Type)) {
																		return (
																			<option value = {entry.Type}> {entry.Type} </option>
																		);
																	}
																})}
															</Form.Control>
														</Col>
													</Row>
												</div>
											)
										}
										return (
											<ListGroup horizontal>
												<ListGroup.Item style = {{width: "50%"}}>
													{field}
													<OverlayTrigger
														placement = "right"
														delay = {{ show: 250, hide: 400 }}
														overlay = {toolTip}
														
													>
														<Button variant = "light" size = "sm" style = {{marginLeft: "1.5%"}}> ℹ️ </Button>
													</OverlayTrigger>
												</ListGroup.Item>
												<ListGroup.Item style = {{width: "50%"}}>
													<Form.Control 
														as = "select"
														name = {field}
														value = {this.state.addingData.Fields[field]}
														onChange = {(e) => {this.onChangeAdd(e)}}
													>
														<option  value = "" selected disabled hidden> Select </option>
														{this.props.data.metaData.entryTypes.map((entry) => {
															if(this.state.goalAdding === entry.Category && !this.state.data.metaData.nonDeletableGoalFields.includes(entry.Type)) {
																return (
																	<option value = {entry.Type}> {entry.Type} </option>
																);
															}
														})}
													</Form.Control>
												</ListGroup.Item>
											</ListGroup>
										)
									}
									else if (field === "Name") {
										var nameList = [];
										for(var i = 0; i < this.state.data.entryNames.length ; i++) {
											var nameData = this.state.data.entryNames[i];
											if(this.state.goalAdding === nameData.Category && this.state.addingData.Fields.Type === nameData.Type) {
												nameList.push(nameData.Name);
											}
										}
										if(width < breakpoint) {
											return (
												<div style = {{marginBottom: "5%"}}>
													<Form.Label> {field} </Form.Label>
													<InputGroup>
														<Form.Control
															as = "input"
															autoComplete = "off"
															name = {field}
															value = {this.state.addingData.Fields[field]}
															onChange = {(e) => {this.onChangeAdd(e)}}
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
												</div>
											)
										}
										return (
											<ListGroup horizontal>
												<ListGroup.Item style = {{width: "50%"}}>
													{field}
												</ListGroup.Item>
												<ListGroup.Item style = {{width: "50%"}}>
													<InputGroup>
														<Form.Control
															as = "input"
															autoComplete = "off"
															name = {field}
															value = {this.state.addingData.Fields[field]}
															onChange = {(e) => {this.onChangeAdd(e)}}
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
										)
									}
									else {
										if(width < breakpoint) {
											return (
												<div style = {{marginBottom: "5%"}}>
													<Form.Label> {field} </Form.Label>
													<Form.Control
														as = "input"
														name = {field}
														value = {this.state.addingData.Fields[field]}
														onChange = {(e) => {this.onChangeAdd(e)}}
													/>	
												</div>
											);
										}
										return (
											<ListGroup horizontal>
												<ListGroup.Item style = {{width: "50%"}}>
													{field}
												</ListGroup.Item>
												<ListGroup.Item style = {{width: "50%"}}>
													<Form.Control
														as = "input"
														name = {field}
														value = {this.state.addingData.Fields[field]}
														onChange = {(e) => {this.onChangeAdd(e)}}
													/>			
												</ListGroup.Item>
											</ListGroup>
										);
									}
								})}
							</div>
							}
							</Modal.Body>
							<Modal.Footer>
								{this.state.invalidFields 
									?
										<Alert show = {this.state.invalidFields} variant = "danger" onClose = {this.hideAlert.bind(this)} dismissible>
											<p> {this.state.alertMessage} </p>
										</Alert>
									:
										<div> </div>
								}
								<Button variant = "secondary" onClick = {this.closeAddModal.bind(this)}> Close </Button>
								<Button variant = "primary" onClick = {this.onClickSaveAdd.bind(this)}> Save </Button>
							</Modal.Footer>
						</Modal>
					:
						<div> </div>
				}
				
			{this.state.data.metaData.categories.map((category) => {
				var lastUpdated = "";
				return (
					<div>
						<Card>
							<Card.Body>
								<Card.Title> 
									<Row>
										{category} Goals 
										<Col>
											<Button variant = "primary" style = {{float: "right"}} onClick = {this.openAddModal.bind(this, category)}>
												+
											</Button>
										</Col>
									</Row>
								</Card.Title>
								<Card.Text>
								{this.state.data.goals.map((goal, goalIndex) => {
									var pieData = this.constructPieData(goal.Fields);
									if(goal["Goal Type"] === category) {
										if(goal.lastUpdated !== "") {
											if(lastUpdated === "") {
												lastUpdated = new Date(goal.lastUpdated);
											}
											else {
												if(new Date(lastUpdated).getTime() < new Date(goal.lastUpdated).getTime()) {
													lastUpdated = new Date(goal.lastUpdated).toLocaleString();
												}
											}
										}
										return <div>
										<Row> 
											<Col sm = {6}>
												{goal.fieldOrder.map((field) => {
													return (
														<ListGroup horizontal>
															<ListGroup.Item style = {{width: "50%"}} variant = "primary">
																{field}
															</ListGroup.Item>
															<ListGroup.Item style = {{width: "50%"}}>
																{goal.Fields[field]}
															</ListGroup.Item>
														</ListGroup>
													);
												})}
												<Row style = {{marginTop: "1%"}}>
													<Col>
														<Button variant = "light" 
															style = {{float: "left", margin: "1%", backgroundColor: "#E0E0E0"}} 
															onClick = {this.openEditModal.bind(this, category, goalIndex)}
														> 
														✏️ 
														</Button>
														{goal.deletable
														?
															<Button variant = "light" style = {{float: "left", margin: "1%", backgroundColor: "#E0E0E0"}} onClick = {this.deleteGoal.bind(this, goalIndex)}> 🗑️ </Button>
														:
															<div> </div>
														}
													</Col>
												</Row>
											</Col>
											<Col sm = {6}>
												<Card>
													<Card.Body>
														<Card.Title> {category} Analysis </Card.Title>
														<Card.Text>
															<Pie data = {pieData} options={{ maintainAspectRatio: false }}/>
														</Card.Text>
													</Card.Body>
												</Card>
											</Col>
										</Row>
										<Row>
											<Col>
												<hr style = {{border: "1px solid #DCDCDC"}} />
											</Col>
										</Row>
									</div>
									}
								})}
								</Card.Text>
							</Card.Body>
							<Card.Footer>
								<small className="text-muted"> Last Updated: {lastUpdated.toLocaleString()}</small>
							</Card.Footer>
						</Card>
						<br/>
					</div>
				  )
			  })}
			</Container>
		);
	}
}

export default Goals;