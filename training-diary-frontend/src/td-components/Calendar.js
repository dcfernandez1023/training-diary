import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import {Calendar as ReactCalendar} from 'react-calendar';
import '../td-css/Calendar.css';
import AddModal from './AddModal.js';
import EditModal from './EditModal.js';
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

//PROPS
	//data 
	//onClickAdd()
	//addModalShow
	//isSaving
	//toggleSaveBar()
	//toggleAddModal()
	//saveData()
class Calendar extends Component {
	
	state = {
		selectedDate: null,
		selectedDateString: null,
		minDate: null,
		isDataOnDate: null,
		hasLoaded: false, //flag to determine if data has loaded, mainly using it for initially determining if selected date has data 
		displayData: null,
		eventKey: 0,
		dataToEdit: null,
		editIndex: -1,
		eventKey: -1
	}
	
	/* COMPONENT MOUNTING AND UPDATING METHODS */ 

	componentDidMount = () => {
		this.setState({selectedDate: this.formatNewDate(), selectedDateString: this.toDateString(this.formatNewDate())});
	}

	componentDidUpdate = () => {
		if(this.state.selectedDateString !== this.toDateString(this.state.selectedDate)){
			this.setState({selectedDateString: this.toDateString(this.state.selectedDate), isDataOnDate: this.isSelectedDateInDateList()});
		}
		if(!this.state.hasLoaded && this.props.data !== null) {
			this.setState({hasLoaded: true, minDate: this.formatDate(this.props.data.birthday), isDataOnDate: this.isSelectedDateInDateList()});
		}
		if(this.props.dataToEdit !== this.props.dataToEdit) {
			this.setState({dataToEdit: this.props.dataToEdit});
		}
		if(this.state.eventKey > 1000) {
			this.setState({eventKey: -1});
		}
	}
	
	//onclick event to handle edit button click
	onClickEdit = (index) => {
		this.setState({editIndex: index});
		this.props.toggleEditModal(this.props.data.userData[index]);
	}
	
	/* CALENDAR METHODS */
	
	//reloads after save from Add Modal
	reloadCalendar = () => {
		this.setState({hasLoaded: false});
	}
	
	//returns true if selected date is in dateList, false if not
	isSelectedDateInDateList = () => {
		if(this.props.data === null || this.props.data === undefined || this.state.selectedDate === null || this.state.selectedDate === undefined) {
			return false;
		}
		const dateList = this.createDateList();
		for(var i = 0; i < dateList.length; i++) {
			const date = dateList[i];
			if(date.getTime() === this.state.selectedDate.getTime()) {
				return true;
			}
		}
		return false;
	}
	
	//creates dateList to mark calendar 
	createDateList = () => {
		if(this.props.data === null || this.props.data === undefined) {
			return null;
		}
		const dateList = [];
		for(var i = 0; i < this.props.data.userData.length; i++) {
			const data = this.props.data.userData[i];
			const dateString = data.Date;
			const date = this.formatDate(dateString);
			dateList.push(date);
		}
		return dateList;
	}
	
	//used to set today's date to zero hours, minutes, and seconds
	formatNewDate () {
		var today = new Date();
		var formatToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
		return formatToday;
	}
	
	//used to format a new date based on date string
	formatDate = (dateString) => {
		var date = new Date(dateString);
		var formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
		return formattedDate;
	}
	
	//converts date into a string
	toDateString = (date) => {
		if(date === null || date === undefined) {
			return null;
		}
		var formattedDate = require('dateformat');
		return formattedDate(date.toString(), "fullDate");
	}
	
	//onclick event handler when a day on the calendar is selected
	selectDay = (value) => {
		this.setState({selectedDate: value});
	}
	
	//onclick event handler to delete an entry
	deleteEntry = (index) => {
		console.log(index);
		var approveDelete = window.confirm("Are you sure you want to delete this entry?");
		if(approveDelete) {
			this.props.data.userData.splice(index, 1);
			this.props.saveData(this.props.data, "delete", "Calendar");
		}
		else {
			return;
		}
	}
	
	/* DATA DISPLAY METHODS */ 
	
	sortByDisplayName = (entry) => {
		const displayOrder = entry.displayOrder;
		const orderedJson = {};
		for(var i = 0; i < displayOrder.length; i++) {
			orderedJson[displayOrder[i]] = entry[displayOrder[i]];
		}
		return orderedJson;
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
		console.log(totalList);
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
				result[total.Type] = total.total;
				result.calculationType = total.calculationType.charAt(0).toUpperCase() + total.calculationType.slice(1);
			}
			else {
				//only going to support add and average for now, since subtract, multiply, and divide don't really make sense for the given categories and types
				if(total.calculationType === "add") {
					result.Category = total.Category;
					result.Type = total.Type;
					result[total.Type] = total.total;
					result.calculationType = total.calculationType.charAt(0).toUpperCase() + total.calculationType.slice(1);
				}
				else if(total.calculationType === "average") {
					result.Category = total.Category;
					result.Type = total.Type;
					result[total.Type] = (total.total / total.numOfEntries).toFixed(2);
					result.calculationType = total.calculationType.charAt(0).toUpperCase() + total.calculationType.slice(1);
				}
			}
			results.push(result);
		}
		console.log(results);
		return results;
	}
	
	goalAchieved = (entry) => {
		var numKey = "Amount";
		for(var key in entry) {
			if(!isNaN(entry[key]) && entry[key].toString().trim().length !== 0) {
				numKey = key;
				console.log(numKey);
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
					for(var key in goal.Fields) {
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
	
	displayData = () => {
		if(this.state.selectedDate === null || this.state.selectedDate === undefined || this.props.data === null || this.props.data === undefined) {
			return null;
		}
		const enteredCategories = [];
		const entries = [];
		for(var i = 0; i < this.props.data.userData.length; i++) {
			if(new Date(this.props.data.userData[i].Date).getTime() === this.state.selectedDate.getTime()) {
				entries.push(this.props.data.userData[i]);
				if(!enteredCategories.includes(this.props.data.userData[i].Category)) {
					enteredCategories.push(this.props.data.userData[i].Category);
				}
			}
		}
		const totals = this.calculateTotals(entries);
		
		const cards = enteredCategories.map((category, catIndex) => {
			this.state.eventKey++;
			return (
				<Card key = {uuid}>
					<Card.Header>
						<Accordion.Toggle as = {Button} variant = "link" eventKey = {this.state.eventKey}>
							{category}
						</Accordion.Toggle>
					</Card.Header>
					<Accordion.Collapse eventKey = {this.state.eventKey}>
						<Card.Body>
							{this.props.data.userData.map((entry, index) => {
								if(new Date(entry.Date).getTime() === this.state.selectedDate.getTime() && category === entry.Category) {
									return (
										<div>
											{this.goalAchieved(entry) && entry.calculationType === "none"
											?
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
																<Button variant = "light" className = "deleteEditButtons" onClick = {this.onClickEdit.bind(this, index)}> ✏️ </Button>
																<hr style = {{border: "1px solid black"}} />
															</div>
														)
													})}
												</div>
											:
												<div>
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
																<Button variant = "light" className = "deleteEditButtons" onClick = {this.onClickEdit.bind(this, index)}> ✏️ </Button>
																<hr style = {{border: "1px solid black"}} />
															</div>
														)
													})}
												</div>
											}
										</div>
									)
								}
								return null;
							})}
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			)
		});
		return (
			<Accordion> 
				{cards} 
				<Card key = {uuid()}>
					<Card.Header>
						<Accordion.Toggle as = {Button} variant = "link" eventKey = "total">
							Data Totals 
						</Accordion.Toggle>
					</Card.Header>
					<Accordion.Collapse eventKey = "total">
						<Card.Body>
						{totals.map((total) => {
							if(this.goalAchieved(total)) {
								return (
									<div>
										<div> Goal Achieved 🏆 </div>
										<br/>
										<ListGroup horizontal key = {uuid()}>
											<ListGroup.Item style = {{width: "50%"}}> <strong> {total.Type} </strong> </ListGroup.Item>
											<ListGroup.Item style = {{width: "50%"}}> {total[total.Type]} </ListGroup.Item>
										</ListGroup>
										<hr style = {{border: "1px solid black"}} />
									</div>
								)
							}
							return (
								<div>
									<ListGroup horizontal key = {uuid()}>
										<ListGroup.Item style = {{width: "50%"}}> <strong> {total.Type} </strong> </ListGroup.Item>
										<ListGroup.Item style = {{width: "50%"}}> {total[total.Type]} </ListGroup.Item>
									</ListGroup>
									<hr style = {{border: "1px solid black"}} />
								</div>
							)
						})}
						</Card.Body>
					</Accordion.Collapse>
				</Card>
			</Accordion>
		)
	}
	
	render() {
		const markedCalendar = ({activeStartDate, date, view}) => {
			if(this.props.data === null || this.props.data == undefined) {
				return null;
			}
			if(view === "month" && this.createDateList().find(x => x.getTime() === date.getTime())) {
				return <div> 💪 </div>
			}
			else {
				return null;
			}
		}

		const displayData = this.displayData();
		return (
			<Container fluid>
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
						reloadCalendar = {this.reloadCalendar}
						createDateList = {this.createDateList}
					/> 
				</Row>
				<Row>
					<EditModal 
						data = {this.props.data}
						editModalShow = {this.props.editModalShow}
						selectedDate = {this.state.selectedDate}
						toDateString = {this.toDateString}
						isSaving = {this.props.isSaving}
						toggleEditModal = {this.props.toggleEditModal}
						toggleSaveBar = {this.props.toggleSaveBar}
						reloadCalendar = {this.reloadCalendar}
						saveData = {this.props.saveData}
						dataToEdit = {this.props.dataToEdit}
						editIndex = {this.state.editIndex}
					/>
				</Row>
				<Row>
					<Col sm = {5}>
						{this.state.isDataOnDate 
						?
						<div className = "calendar-container">
							<Row>
								<Col sm = {11}>
									<h2 className = "date-string"> {this.state.selectedDateString} </h2>
								</Col>
								<Col sm = {1}>
									<Button variant = "primary" className = "add-data-button" onClick = {this.props.toggleAddModal}> + </Button>
								</Col>
							</Row>
							<Row>
								<Col>
									{displayData}
								</Col>
							</Row>
						</div>
						:
						<div className = "calendar-container">
							<Row>
								<Col sm = {11}>
									<h2 className = "date-string"> {this.state.selectedDateString} </h2>
								</Col>
								<Col sm = {1}>
									<Button variant = "primary" className = "add-data-button" onClick = {this.props.toggleAddModal}> + </Button>
								</Col>
							</Row>
							<br/>
							<Row>
								<Col sm = {6}>
									<p style = {{marginLeft: "1%"}}> Nothing to see here... </p>
								</Col>
							</Row>
						</div>
						}
					</Col>
					
					<Col sm = {7}>
						<div className = "calendar-container">
							<ReactCalendar 
								minDate = {this.state.minDate}
								showNeighboringMonth = {false}
								onClickDay = {this.selectDay}
								tileContent = {markedCalendar}
							/>
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Calendar;