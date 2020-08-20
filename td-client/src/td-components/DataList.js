import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import AddModal from './AddModal.js';
import EditModal from './EditModal.js';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import uuid from 'react-uuid';
import '../td-css/DataList.css';
import DatePicker from 'react-datepicker';
import Dropdown from 'react-bootstrap/Dropdown';
import Form from 'react-bootstrap/Form';

//props
	//data
class DataList extends Component {
	
	state = {
		startDate: null,
		endDate: null,
		listOption: "List Options",
		listFilters: [],
		allChecked: true,
		selectedDate: null
	}
	
	onSelectOption = (option) => {
		var filtersCopy = this.state.listFilters.slice();
		if(option === "All") {
			this.setState({listFilters: [], allChecked: !this.state.allChecked});
			return;
		}
		else if(!filtersCopy.includes(option)) {
			filtersCopy.push(option);
		}
		else if(filtersCopy.includes(option)) {
			filtersCopy.splice(filtersCopy.indexOf(option), 1);
		}
		this.setState({listFilters: filtersCopy, allChecked: false});
	}
	
	toggleAddModal = async (date) => {
		await this.setState({selectedDate: new Date(date)});
		this.props.toggleAddModal();
	}
	
	onSelectEndDate = (date) => {
		this.setState({endDate: date});
	}
	
	onSelectStartDate = (date) => {
		this.setState({startDate: date});
	}
	
	//onclick event to handle edit button click
	onClickEdit = async (index, date) => {
		await this.setState({editIndex: index, selectedDate: new Date(date)});
		this.props.toggleEditModal(this.props.data.userData[index]);
	}
	
	//onclick event handler to delete an entry
	deleteEntry = (index) => {
		var approveDelete = window.confirm("Are you sure you want to delete this entry?");
		if(approveDelete) {
			this.props.data.userData.splice(index, 1);
			this.props.saveData(this.props.data, "delete", "Calendar");
		}
		else {
			return;
		}
	}
	
	reload = () => {
		this.forceUpdate();
	}
	
	goalAchieved = (entry) => {
		var numKey = "Amount";
		for(var key in entry) {
			if(!isNaN(entry[key]) && entry[key].toString().trim().length !== 0) {
				numKey = key;
			}
		}
		for(var i = 0; i < this.props.data.goals.length; i++) {
			var goal = this.props.data.goals[i];
			if(goal["Goal Type"] === entry.Category) {
				if(!goal.deletable) {
					if(Number(goal.Fields[entry.Type]) === Number(entry[numKey])) {
						return true;
					}
				}
				else {
					var isAchieved = false;
					for(key in goal.Fields) {
						if(goal.Fields[key] === entry[key]) {
							isAchieved = true;
						}
						else {
							isAchieved = false;
						}
					}
					if(isAchieved) {
						return true;
					}
				}
			}
		}
		return false;
	}
	
	createOptionDropdown = () => {
		if(this.props.data === null || this.props.data === undefined) {
			return null;
		}
		return (
			<Dropdown>
				<Dropdown.Toggle variant = "primary">
					{this.state.listOption}
				</Dropdown.Toggle>
				<Dropdown.Menu>
					<div style = {{margin: "5%"}}>
						{this.state.startDate === null || this.state.endDate === null || this.state.startDate.getTime() > this.state.endDate.getTime()
							?
								<Form.Check 
								type = "checkbox"
								label = "All"
								checked = {true}
								disabled = {true}
								onChange = {this.onSelectOption.bind(this, "All")}
								/>
							:
								<Form.Check 
								type = "checkbox"
								label = "All"
								checked = {this.state.allChecked}
								onChange = {this.onSelectOption.bind(this, "All")}
								/>
						}
					</div>
					{this.props.data.metaData.categories.map((category, index) => {	
						return (
							<div>
								<Dropdown.Header>
									<strong> {category} </strong>
								</Dropdown.Header>
								{this.props.data.metaData.entryTypes.map((entry) => {
									if(category === entry.Category) {
										if(this.state.startDate === null || this.state.endDate === null || this.state.startDate.getTime() > this.state.endDate.getTime()) {
											return (
												<div style = {{margin: "5%"}}>
													<Form.Check 
														type = "checkbox"
														label = {entry.Type}
														checked = {false}
														disabled = {true}
														onChange = {this.onSelectOption.bind(this, entry.Type)}
													/>
												</div>
											)
										}
										else if(this.state.listFilters.length === 0) {
											return (
												<div style = {{margin: "5%"}}>
													<Form.Check 
														type = "checkbox"
														label = {entry.Type}
														checked = {false}
														onChange = {this.onSelectOption.bind(this, entry.Type)}
													/>
												</div>
											)
										}
										return (
											<div style = {{margin: "5%"}}>
												<Form.Check 
													type = "checkbox"
													label = {entry.Type}
													onChange = {this.onSelectOption.bind(this, entry.Type)}
												/>
											</div>
										)
									}
								})}
							</div>
						)
					})}
				</Dropdown.Menu>
			</Dropdown>
		);
	}
	
	calculateTotals = (data) => {
		var totalList = [];
		for(var i = 0; i < this.props.data.metaData.entryTypes.length; i++) {
			var entryType = this.props.data.metaData.entryTypes[i];
			var total = {Category: "", Type: "", calculationType: "", numOfEntries: 0, total: 0};
			for(var x = 0; x < data.length; x++) {
				var entry = data[x];
				var numKey = "";
				for(var key in entry) {
					if(!isNaN(entry[key]) && entry[key].length !== 0) {
						numKey = key;
					}
				}
				if(entryType.Category === entry.Category && entryType.Type === entry.Type && entryType.calculationType !== "none" && numKey !== "") {
					total.Category = entry.Category;
					total.Type = entry.Type;
					total.calculationType = entryType.calculationType;
					total.numOfEntries = total.numOfEntries + 1;
					total.total = total.total + Number(entry[numKey]);
				}
			}
			if(total.Category !== "" && total.Type !== "" && total.calculationType !== "none" && total.total !== 0) {
				totalList.push(total);
			}
		}
		if(totalList.length === 0) {
			return totalList;
		}
		var results = [];
		for(i = 0; i < totalList.length; i++) {
			var total = totalList[i];
			var result = {};
			if(total.numOfEntries === 1) {
				result.Category = total.Category;
				result.Type = total.Type;
				result.Amount = total.total;
				result.calculationType = total.calculationType.charAt(0).toUpperCase() + total.calculationType.slice(1);
			}
			else {
				//only going to support add and average for now, since subtract, multiply, and divide don't really make sense for the given categories and types
				if(total.calculationType === "add") {
					result.Category = total.Category;
					result.Type = total.Type;
					result.Amount = total.total;
					result.calculationType = total.calculationType.charAt(0).toUpperCase() + total.calculationType.slice(1);
				}
				else if(total.calculationType === "average") {
					result.Category = total.Category;
					result.Type = total.Type;
					result.Amount = (total.total / total.numOfEntries).toFixed(2);
					result.calculationType = total.calculationType.charAt(0).toUpperCase() + total.calculationType.slice(1);
				}
			}
			results.push(result);
		}
		return results;
	}
	
	toDateString = (date) => {
		if(date === null || date === undefined) {
			return null;
		}
		var formattedDate = require('dateformat');
		return formattedDate(date.toString(), "fullDate");
	}
	
	getListData = () => {
		var listData = [];
		if(this.state.startDate === null || this.state.endDate === null || this.state.startDate.getTime() > this.state.endDate.getTime()) {
			return null;
		}
		
		if(this.state.listFilters.length === 0 && !this.state.allChecked) {
			return null;
		}
		//all checkbox is selected
		else if(this.state.listFilters.length === 0 && this.state.allChecked) {
			for(var i = 0; i < this.props.data.userData.length; i++) {
				const entry = this.props.data.userData[i];
				const entryDate = new Date(entry.Date);
				if(this.state.startDate.getTime() <= entryDate.getTime() && entryDate.getTime() <= this.state.endDate.getTime()) {
					entry.Date = entryDate.toLocaleDateString();
					listData.push(entry);
				}
			}
		}
		//all is not selected and other checkboxes have been selected
		else {
			for(i = 0; i < this.props.data.userData.length; i++) {
				const entry = this.props.data.userData[i];
				const entryDate = new Date(entry.Date);
				if(this.state.startDate.getTime() <= entryDate.getTime() && entryDate.getTime() <= this.state.endDate.getTime() && this.state.listFilters.includes(entry.Type)) {
					listData.push(entry);
				}
			}
		}
		//sorting list data by date
		for(i = 0; i < listData.length; i++) {		
			var min = i; 
			for(var x = i + 1; x < listData.length; x++) {
				if(new Date(listData[min].Date).getTime() > new Date(listData[x].Date).getTime()) {
					min = x;
				}
			}
			if(min !== i) {
				var temp = listData[i];
				listData[i] = listData[min];
				listData[min] = temp;
			}
		}
		return listData;
	}
	
	displayData = (listData) => {
		if(listData === null || listData === undefined) {
			return null;
		}
		const dateStrings = [];
		for(var i = 0; i < listData.length; i++) {
			if(this.state.startDate.getTime() <= new Date(listData[i].Date).getTime() && new Date(listData[i].Date).getTime() <= this.state.endDate.getTime()) {
				var dateString = this.toDateString(new Date(listData[i].Date));
				if(!dateStrings.includes(dateString)) {
					dateStrings.push(dateString);
				}
			}
		}

		const cards = dateStrings.map((date, index) => {
			var totalList = [];
			return (
				<Card key = {uuid()}>
					<Card.Header>
						<Button variant = "primary" onClick = {this.toggleAddModal.bind(this, date)} style = {{float: "right"}}> + </Button>
						<Accordion.Toggle as = {Button} variant = "link" eventKey = {index}>
							{date}
						</Accordion.Toggle>
					</Card.Header>
					<Accordion.Collapse eventKey = {index}>
						<Card.Body>
							{this.props.data.userData.map((entry, index) => {
								if(this.state.listFilters.length === 0) {
									if(new Date(entry.Date).getTime() === new Date(date).getTime()) {
										totalList.push(entry);
										if(this.goalAchieved(entry) && entry.calculationType === "none") {
											return (
												<div>
													<div> Goal Achieved 🏆 </div>
													<br/>
													{entry.displayOrder.map((key) => {
														if(key !== "Notes") {
															return (
																<ListGroup horizontal key = {uuid()}>
																	<ListGroup.Item style = {{width: "40%"}}> <strong> {key} </strong> </ListGroup.Item>
																	<ListGroup.Item style = {{width: "60%"}}> {entry[key]} </ListGroup.Item>
																</ListGroup>
															)
														}
														const popover = (
															<Popover>
																<Popover.Title as = "h3"> {key} </Popover.Title>
																<Popover.Content> {entry[key]} </Popover.Content>
															</Popover>
														);
														return (
															<div key = {uuid()}>
																<br/>
																<OverlayTrigger trigger = "click" placement = "right" overlay = {popover} rootClose = {true}>
																	<Button variant = "success"> {key} </Button>
																</OverlayTrigger>
																<Button variant = "light" className = "deleteEditButtons" onClick = {this.deleteEntry.bind(this, index)}> 🗑️ </Button>
																<Button variant = "light" className = "deleteEditButtons" onClick = {this.onClickEdit.bind(this, index, date)}> ✏️ </Button>
																<hr style = {{border: "1px solid black"}} />
															</div>
														)
													})}
												</div>
											)
										}
										return (
											entry.displayOrder.map((key) => {
												if(key !== "Notes") {
													return (
														<ListGroup horizontal key = {uuid()}>
															<ListGroup.Item style = {{width: "40%"}}> <strong> {key} </strong> </ListGroup.Item>
															<ListGroup.Item style = {{width: "60%"}}> {entry[key]} </ListGroup.Item>
														</ListGroup>
													)
												}
												const popover = (
													<Popover>
														<Popover.Title as = "h3"> {key} </Popover.Title>
														<Popover.Content> {entry[key]} </Popover.Content>
													</Popover>
												);
												return (
													<div key = {uuid()}>
														<br/>
														<OverlayTrigger trigger = "click" placement = "right" overlay = {popover} rootClose = {true}>
															<Button variant = "success"> {key} </Button>
														</OverlayTrigger>
														<Button variant = "light" className = "deleteEditButtons" onClick = {this.deleteEntry.bind(this, index)}> 🗑️ </Button>
														<Button variant = "light" className = "deleteEditButtons" onClick = {this.onClickEdit.bind(this, index, date)}> ✏️ </Button>
														<hr style = {{border: "1px solid black"}} />
													</div>
												)
											})
										)
									}
								}
								else {
									if(new Date(entry.Date).getTime() === new Date(date).getTime() && this.state.listFilters.includes(entry.Type)) {
										totalList.push(entry);
										if(this.goalAchieved(entry) && entry.calculationType === "none") {
											return (
												<div>
													<div> Goal Achieved 🏆 </div>
													<br/>
													{entry.displayOrder.map((key) => {
														if(key !== "Notes") {
															return (
																<ListGroup horizontal key = {uuid()}>
																	<ListGroup.Item style = {{width: "40%"}}> <strong> {key} </strong> </ListGroup.Item>
																	<ListGroup.Item style = {{width: "60%"}}> {entry[key]} </ListGroup.Item>
																</ListGroup>
															)
														}
														const popover = (
															<Popover>
																<Popover.Title as = "h3"> {key} </Popover.Title>
																<Popover.Content> {entry[key]} </Popover.Content>
															</Popover>
														);
														return (
															<div key = {uuid()}>
																<br/>
																<OverlayTrigger trigger = "click" placement = "right" overlay = {popover} rootClose = {true}>
																	<Button variant = "success"> {key} </Button>
																</OverlayTrigger>
																<Button variant = "light" className = "deleteEditButtons" onClick = {this.deleteEntry.bind(this, index)}> 🗑️ </Button>
																<Button variant = "light" className = "deleteEditButtons" onClick = {this.onClickEdit.bind(this, index, date)}> ✏️ </Button>
																<hr style = {{border: "1px solid black"}} />
															</div>
														)
													})}
												</div>
											)
										}
										return (
											entry.displayOrder.map((key) => {
												if(key !== "Notes") {
													return (
														<ListGroup horizontal key = {uuid()}>
															<ListGroup.Item style = {{width: "40%"}}> <strong> {key} </strong> </ListGroup.Item>
															<ListGroup.Item style = {{width: "60%"}}> {entry[key]} </ListGroup.Item>
														</ListGroup>
													)
												}
												const popover = (
													<Popover>
														<Popover.Title as = "h3"> {key} </Popover.Title>
														<Popover.Content> {entry[key]} </Popover.Content>
													</Popover>
												);
												return (
													<div key = {uuid()}>
														<br/>
														<OverlayTrigger trigger = "click" placement = "right" overlay = {popover} rootClose = {true}>
															<Button variant = "success"> {key} </Button>
														</OverlayTrigger>
														<Button variant = "light" className = "deleteEditButtons" onClick = {this.deleteEntry.bind(this, index)}> 🗑️ </Button>
														<Button variant = "light" className = "deleteEditButtons" onClick = {this.onClickEdit.bind(this, index, date)}> ✏️ </Button>
														<hr style = {{border: "1px solid black"}} />
													</div>
												)
											})
										)
									}
								}
							})}
							<div>
								{this.calculateTotals(totalList).map((total) => {
									if(this.goalAchieved(total)) {
										return (
											<div>
												<div> Goal Achieved 🏆 </div>
												<br/>
												<ListGroup horizontal key = {uuid()}>
													{total.calculationType === "Add"
													?
														<ListGroup.Item style = {{width: "50%"}}> <strong> Total {total.Type}: </strong> </ListGroup.Item>
													:
														<ListGroup.Item style = {{width: "50%"}}> <strong> {total.calculationType} {total.Type}: </strong> </ListGroup.Item>
													}
													<ListGroup.Item style = {{width: "50%"}}> {total.Amount} </ListGroup.Item>
												</ListGroup>
											</div>
										)
									}
									return (
										<ListGroup horizontal key = {uuid()}>
											{total.calculationType === "Add"
											?
												<ListGroup.Item style = {{width: "50%"}}> <strong> Total {total.Type}: </strong> </ListGroup.Item>
											:
												<ListGroup.Item style = {{width: "50%"}}> <strong> {total.calculationType} {total.Type}: </strong> </ListGroup.Item>
											}
											<ListGroup.Item style = {{width: "50%"}}> {total.Amount} </ListGroup.Item>
										</ListGroup>
									)
								})}
							</div>
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			);
		});
		return (
			<Accordion> 
				{cards} 
			</Accordion>
		)
	}
	
	render() {
		const startPicker = <Form.Control
								type = "input"
							/>
		const endPicker = <Form.Control
								type = "input"
							/>
		const optionDropdown = this.createOptionDropdown();
		const listData = this.getListData();
		const displayData = this.displayData(listData);
		return (
			<Container fluid>
			{this.state.selectedDate === null
			?
				<div> </div>
			:
				<Row>
					<AddModal 
						data = {this.props.data} 
						selectedDate = {this.state.selectedDate}
						saveData = {this.props.saveData}
						toDateString = {this.toDateString}
						addModalShow = {this.props.addModalShow}
						isSaving = {this.props.isSaving}
						toggleAddModal = {this.props.toggleAddModal}
						toggleSaveBar = {this.props.toggleSaveBar}
						reloadCalendar = {this.reload}
						createDateList = {this.createDateList}
					/> 

					<EditModal 
						data = {this.props.data}
						editModalShow = {this.props.editModalShow}
						selectedDate = {this.state.selectedDate}
						toDateString = {this.toDateString}
						isSaving = {this.props.isSaving}
						toggleEditModal = {this.props.toggleEditModal}
						toggleSaveBar = {this.props.toggleSaveBar}
						reloadCalendar = {this.reload}
						saveData = {this.props.saveData}
						dataToEdit = {this.props.dataToEdit}
						editIndex = {this.state.editIndex}
					/>
				</Row>
			}
				<Row>
					<Col lg = {2}>
						<Row>
							<Col>
								{optionDropdown}
							</Col>
						</Row>
						<br/>
						<Row>
							<Col>
								<Row>
									<Col>
										<p> <u> Start Date </u> </p>
									</Col>
								</Row>
								<Row>
									<Col>
										<DatePicker
											selected = {this.state.startDate}
											onChange = {this.onSelectStartDate}
											customInput = {startPicker}
											placeholderText = "mm/dd/yyyy"
										/>
									</Col>
								</Row>
							</Col>
						</Row>
						<br/>
						<Row>
							<Col style = {{marginBottom: "1%"}}>
								<Row>
									<Col>
										<p> <u> End Date </u> </p>	
									</Col>
								</Row>
								<Row>
									<Col>
										<DatePicker
											selected = {this.state.endDate}
											onChange = {this.onSelectEndDate}
											customInput = {endPicker}
											placeholderText = "mm/dd/yyyy"
										/>
									</Col>
								</Row>
							</Col>
						</Row>
						<br/>
						<Row>
							<Col>
							{this.state.allChecked 
								?
									<Card>
										<Card.Body>
											<Card.Title>
												Options Selected
											</Card.Title>
											<Card.Text>
												<li> All </li>
											</Card.Text>
										</Card.Body>
									</Card>
								:
									<Card>
										<Card.Body>
											<Card.Title>
												Options Selected
											</Card.Title>
											<Card.Text>
												{this.state.listFilters.map((filter) => {
													return (
														<li> {filter} </li>
													)
												})}
											</Card.Text>
										</Card.Body>
									</Card>
							}
							</Col>
						</Row>
					</Col>
					<Col lg = {10}>
						<div className = "list-container">
							{this.state.startDate === null || this.state.endDate === null || this.state.startDate.getTime() > this.state.endDate.getTime()
								?
									<h3> <i> Select a start and end date to view your training data. </i> </h3>
								:
								<div>
									{displayData}
								</div>
							}	
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default DataList;