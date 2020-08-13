import React, { Component } from 'react';
import axios from 'axios';
import '../td-css/TrainingDiary.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import Loader from 'react-loader-spinner';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Tabs from 'react-bootstrap/Tabs';
import TabContent from 'react-bootstrap/TabContent';
import Tab from 'react-bootstrap/Tab';
import Calendar from './Calendar.js';
import Graph from './Graph.js';
import DataList from './DataList.js';
import Goals from './Goals.js';
import { BrowserRouter as Router, Link } from 'react-router-dom';
//import TrackExercises from './TrackExercises.js';
//PROPS: 
	//data 
	//logout()
	//saveData()
	//addModalShow
	//isSaving
	//toggleSaveBar()
	//toggleAddModal()
class TrainingDiary extends Component {
	
	state = {
		data: null,
		activeTab: "calendar",
	} 
	
	/* COMPONENT MOUNTING AND UPDATING METHODS */
	
	componentDidMount = () => {
		this.setState({data: this.props.data});
	}
	
	/* GENERAL COMPONENT METHODS */ 
	
	//toggles which tab is selected and rendered
	toggleTabs = (tab) => {
		this.setState({activeTab: tab});
	}
	
	render() {
		return (
			<Container fluid>
				{/* row 1: header, settings Button, logout Button*/}
				<Row>
					<Col xs = {8}>
						<h1> Training Diary </h1>
					</Col>
					<Col xs = {4}>
						<Button variant = "primary" onClick = {this.props.logout} className = "td-header-button"> Logout </Button>
						<Button variant = "primary" href = "/profile" className = "td-header-button"> Profile </Button> 
					</Col>
				</Row>
				
				<br/>
				
				{/* row 2: Tabs */}
				<Row style = {{height: "75vh"}}>
					<Col>
						<Tabs activeKey = {this.state.activeTab} onSelect = {(tab) => {this.toggleTabs(tab)}}>
								<Tab eventKey = "graph" title = "Graph 📉">
									{this.state.activeTab !== "graph"
									?
									<div> </div>
									:
									<div>
										<br/>
										<Graph data = {this.props.data} />
									</div>
									}
								</Tab>
								<Tab eventKey = "calendar" title = "Calendar 📅">
									{this.state.activeTab !== "calendar"
									?
									<div> </div>
									:
									<div>
										<br/>
										<Calendar 
											data = {this.props.data} 
											saveData = {this.props.saveData}
											addModalShow = {this.props.addModalShow}
											editModalShow = {this.props.editModalShow}
											isSaving = {this.props.isSaving}
											toggleAddModal = {this.props.toggleAddModal}
											toggleEditModal = {this.props.toggleEditModal}
											toggleSaveBar = {this.props.toggleSaveBar}
											dataToEdit = {this.props.dataToEdit}
										/>
									</div>
									}
								</Tab>
								
								<Tab eventKey = "dataList" title = "Data-List 📝">
									{this.state.activeTab !== "dataList"
									?
									<div> </div>
									:
									<div>
										<br/> 
										<DataList 
											data = {this.props.data} 
											saveData = {this.props.saveData}
											addModalShow = {this.props.addModalShow}
											editModalShow = {this.props.editModalShow}
											isSaving = {this.props.isSaving}
											toggleAddModal = {this.props.toggleAddModal}
											toggleEditModal = {this.props.toggleEditModal}
											toggleSaveBar = {this.props.toggleSaveBar}
											dataToEdit = {this.props.dataToEdit}
										/>
									</div>
									}
								</Tab>
								
								<Tab eventKey = "goals" title = "Goals 🎯">
									{this.state.activeTab !== "goals"
									?
									<div> </div>
									:
									<div>
										<br/>
										<Goals 
											data = {this.props.data} 
											saveData = {this.props.saveData}
										/>
									</div>
									}
								</Tab>
							</Tabs>
						</Col>
					</Row>
			</Container>
		);
	}
}

export default TrainingDiary;