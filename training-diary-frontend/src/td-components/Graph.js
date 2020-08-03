import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../td-css/Graph.css';
//import DatePicker from 'react-date-picker';
import DatePicker from 'react-datepicker';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
//import DatePicker from 'react-date-picker/dist/entry.nostyle';
//PROPS
	//data
class Graph extends Component {
	
	state = {
		testData: [
			{name: "test1", data: 1},
			{name: "test2", data: 2},
			{name: "test3", data: 3},
			{name: "test4", data: 4},
		],
		graphOption: "Graph Options",
		startDate: null,
		endDate: null,
		graphData: [],
		lineColors: ["Aqua", "Black", "Blue", "BlueViolet", "Brown", "Chocolate", "Crimson", "DarkGreen", "DeepPink", "LightSeaGreen", "Maroon",
					"Navy", "Olive", "MidnightBlue", "Tomato"],
		usedColors: [],
		colorIndex: -1,
		graphFilters: [],
		rangeValue: null
	}
	
	componentDidUpdate = () => {
		if(this.state.colorIndex > this.state.lineColors.length) {
			this.setState({colorIndex: -1});
		}
	}
	
	onSelectOption = (option) => {
		this.setState({graphOption: option, graphFilters: []});
	}
	
	onSelectStartDate = (date) => {
		this.setState({startDate: date});
	}
	
	onSelectEndDate = (date) => {
		this.setState({endDate: date});
	}
	
	onChangeSlider = (e) => {
		console.log(e.target.value);
		this.setState({rangeValue: e.target.value});
	}
	
	onSelectFilter = (filterName) => {
		var filtersCopy = this.state.graphFilters.slice();
		if(!filtersCopy.includes(filterName)) {
			filtersCopy.push(filterName);
			this.setState({graphFilters: filtersCopy});
			return;
		}
		filtersCopy.splice(filtersCopy.indexOf(filterName), 1);
		this.setState({graphFilters: filtersCopy});
	}
	
	createOptionDropdown = () => {
		if(this.props.data === null || this.props.data === undefined) {
			return null;
		}
		return (
			<Dropdown className = "options-button">
				<Dropdown.Toggle variant = "primary">
					{this.state.graphOption}
				</Dropdown.Toggle>
				<Dropdown.Menu>
					{this.props.data.metaData.categories.map((category, index) => {
						return (
							<div>
								<Dropdown.Header>
									<strong> {category} </strong>
								</Dropdown.Header>
								{this.props.data.metaData.entryTypes.map((entry) => {
									if(category === entry.Category) {
										for(var key in entry) {
											if(entry[key] === "number") {
												return (
													<Dropdown.Item onSelect = {this.onSelectOption.bind(this, entry.Type)}>
														{entry.Type}
													</Dropdown.Item>
												)
											}
										}
									}
								})}
							</div>
						)
					})}
				</Dropdown.Menu>
			</Dropdown>
		)
	}
	
	createDateDropdown = () => {
		return (
			<Dropdown className = "options-button">
				<Dropdown.Toggle variant = "primary">
					Date Range
				</Dropdown.Toggle>
				<Dropdown.Menu>
					<Dropdown.Item as = {this.dateOption}> </Dropdown.Item>
				</Dropdown.Menu>
			</Dropdown>
		);
	}
	
	filterGraphData = (graphData) => {
		if(this.state.graphFilters === null || this.state.graphFilters.length === 0 || graphData === null || graphData.length === 0) {
			return null;
		}
		var filteredGraphData = [];
		var numericFilters = [];
		//apply name filters first
		for(var i = 0; i < graphData.length; i++) {
			var entry = graphData[i];
			for(var x = 0; x < this.state.graphFilters.length; x++) {
				var filter = this.state.graphFilters[x];
				for(var key in entry) {
					if(entry[key] === filter) {
						filteredGraphData.push(entry);
					}
					else if(!isNaN(entry[filter])){
						if(!numericFilters.includes(filter)) {
							numericFilters.push(filter);
						}
					}
				}
			}
		}
		//apply numeric filters now
		if(filteredGraphData.length === 0) {
			for(i = 0; i < graphData.length; i++) {
				var entry = graphData[i];
				var filteredEntry = {};
				for(x = 0; x < this.state.graphFilters.length; x++) {
					var filter = this.state.graphFilters[x];
					if(Object.keys(entry).includes(filter)) {
						filteredEntry[filter] = entry[filter];
					}
				}
				filteredEntry["Name"] = entry["Name"];
				filteredEntry["Date"] = entry["Date"];
				filteredGraphData.push(filteredEntry);
			}
			console.log(filteredGraphData);
			return filteredGraphData
		}
		else {
			console.log(numericFilters);
			if(numericFilters.length === 0) {
				return filteredGraphData;
			}
			var finalFilteredGraphData = [];
			for(i = 0; i < filteredGraphData.length; i++) {
				var entry = filteredGraphData[i];
				var filteredEntry = {};
				for(x = 0; x < this.state.graphFilters.length; x++) {
					var filter = this.state.graphFilters[x];
					if(Object.keys(entry).includes(filter)) {
						filteredEntry[filter] = entry[filter];
					}
					
				}
				filteredEntry["Name"] = entry["Name"];
				filteredEntry["Date"] = entry["Date"];
				finalFilteredGraphData.push(filteredEntry);
			}
			console.log(finalFilteredGraphData);
			return finalFilteredGraphData;
		}
		return null;
	}
	
	getGraphData = () => {
		var graphData = [];
		if(this.state.startDate === null || this.state.endDate === null || this.state.graphOption === "Graph Options" || this.state.startDate.getTime() > this.state.endDate.getTime()) {
			return null;
		}
		for(var i = 0; i < this.props.data.userData.length; i++) {
			const entry = this.props.data.userData[i];
			const entryDate = new Date(entry.Date);
			if(this.state.startDate.getTime() <= entryDate.getTime() && entryDate.getTime() <= this.state.endDate.getTime() && entry.Type === this.state.graphOption) {
				var graphEntry = {};
				for(var key in entry) {
					if(!isNaN(Number(entry[key])) && entry[key].length !== 0 || key === "Name") {
						graphEntry[key] = entry[key];
					}
				}
				graphEntry.Date = entryDate.toLocaleDateString();
				graphData.push(graphEntry);
			}
		}
		//sorting graph data by date
		for(i = 0; i < graphData.length; i++) {		
			var min = i; 
			for(var x = i + 1; x < graphData.length; x++) {
				if(new Date(graphData[min].Date).getTime() > new Date(graphData[x].Date).getTime()) {
					min = x;
				}
			}
			if(min !== i) {
				var temp = graphData[i];
				graphData[i] = graphData[min];
				graphData[min] = temp;
			}
		}
		return graphData;
	}
	
	createLines = (graphData) => {
		if(graphData === null) {
			return null;
		}
		var dataKeys = [];
		for(var i = 0; i < graphData.length; i++) {
			var entry = graphData[i];
			for(var key in entry) {
				if(!isNaN(Number(entry[key])) && entry[key].length !== 0 && !dataKeys.includes(key) || key === "Name" && !dataKeys.includes(key)) {
					dataKeys.push(key);
				}
			}
		}
		console.log(dataKeys);
		const lines = dataKeys.map((dataKey, index) => {
			return (
				<Line dataKey = {dataKey} stroke = {this.state.lineColors[index]}/>
			);
		});
		return lines;
	}
	
	getLegendData = (graphData) => {
		if(graphData === null) {
			return null;
		}
		var legendData = [];
		for(var i = 0; i < graphData.length; i++) {
			var entry = graphData[i];
			for(var key in entry) {
				//if(!isNaN(Number(entry[key])) && entry[key].length !== 0 && !legendData.includes(key))
				if(entry[key].length !== 0 && !legendData.includes(key) && key !== "Date" && key !== "Notes") {
					legendData.push(key);
				}
			}
		}
		var matchingColorIndex = -1;
		if(legendData.length === 1) {
			matchingColorIndex = this.state.colorIndex;
		}
		else {
			matchingColorIndex = this.state.colorIndex - legendData.length;
		}
		for(i = 0; i < legendData.length; i++) {
			console.log(this.state.lineColors[matchingColorIndex]);
			legendData[i] = {"color": this.state.lineColors[i], dataKey: legendData[i], "type": "line", "value": legendData[i]}
			matchingColorIndex++;
		}
		console.log(legendData);
		return legendData;
	}

	
	createStringFilters = (graphData) => {
		if(graphData === null || graphData === undefined || graphData.length === 0) {
			return <div> </div>;
		}
		var filters = [];
		var filterData = [];
		for(var i = 0; i < graphData.length; i++) {
			var entry = graphData[i];
			for(var key in entry) {
				if(!isNaN(Number(entry[key])) && entry[key].length !== 0 && !filters.includes(key) || this.props.data.metaData.graphFilterConstants.includes(key) && !filters.includes(key)) {
					filters.push(key);
				}
			}
		}
		if(filters.length < 1) {
			return <div> </div>;
		}
		for(i = 0; i < filters.length; i++) {
			var filter = filters[i];
			if(!isNaN(graphData[0][filter])) {
				filterData.push(filter);
			}
			for(var x = 0; x < graphData.length; x++) {
				if(isNaN(graphData[x][filter]) && !filterData.includes(graphData[x][filter])) {
					filterData.push(graphData[x][filter]);
				}
			}
		}
		if(filterData === null || filterData === undefined || filterData.length === 0) {
			return <div> </div>;
		}
		return (
				<Card>
					<Card.Body>
						<Card.Title> 
							Show By 
						</Card.Title>
						{filterData.length === 1
							?
								<Form.Check type = "checkbox" label = {filterData[0]} onClick = {this.onSelectFilter.bind(this, filterData[0])}/> 
							:
								<div>
									{filterData.map((data) => {
										return (
											<Form.Check type = "checkbox" label = {data} onClick = {this.onSelectFilter.bind(this, data)}/> 
										)
									})}
								</div>
						}
					</Card.Body>
				</Card>
		)
	}
	
	createNumFilters = (graphData) => {
		if(graphData === null) {
			return null;
		}
		var rangeSliders;
		var sliderLabels = [];
		
		if(this.state.graphFilters.length === 0) {
			for(var i = 0; i < graphData.length; i++) {
				var entry = graphData[i];
				for(var key in entry) {
					if(!isNaN(entry[key]) && !sliderLabels.includes(key)) {
						sliderLabels.push(key);
					}
				}
			}
			if(sliderLabels.length === 0) {
				return null;
			}
			rangeSliders = sliderLabels.map((label, index) => {
				return (
					<Form>
						<Form.Group controlId = {index}>
							<Form.Label> {label} </Form.Label>
							<Form.Control type = "range" />
						</Form.Group>
					</Form>
				)
			});
		}
		else {
			for(var i = 0; i < graphData.length; i++) {
				var entry = graphData[i];
				for(var key in entry) {
					if(!isNaN(entry[key]) && !sliderLabels.includes(key) && !this.state.graphFilters.includes(key)) {
						sliderLabels.push(key);
					}
				}
			}
			if(sliderLabels.length === 0) {
				return null;
			}
			rangeSliders = sliderLabels.map((label, index) => {
				return (
					<Form>
						<Form.Group controlId = {index}>
							<Form.Label> {label} </Form.Label>
							<Form.Control type = "range" />
						</Form.Group>
					</Form>
				)
			});
		}
		return rangeSliders;
	}
	
	getMaxValue = (graphData) => {
		if(graphData === null || graphData === undefined) {
			return null;
		}
		var max = 0;
		for(var i = 0; i < graphData.length; i++) {
			var entry = graphData[i];
			for(var key in entry) {
				if(!isNaN(entry[key])) {
					if(Number(entry[key]) > max) {
						max = Number(entry[key]);
					}
				}
			}
		}
		if(this.state.rangeValue === null) {
			this.state.rangeValue = max;
		}
		return max;
	}
	
	render() {
		const startPicker = <Form.Control
								type = "input"
							/>
		const endPicker = <Form.Control
								type = "input"
							/>
		const dropdownOption = this.createOptionDropdown();
		var graphData = this.getGraphData();
		const stringFilters = this.createStringFilters(graphData);
		const rangeSliders = this.createNumFilters(graphData);
		const filteredGraphData = this.filterGraphData(graphData);
		var legendPayload;
		var lines;
		var maxValue;
		if(filteredGraphData !== null) {
			lines = this.createLines(filteredGraphData);
			//legendPayload = this.getLegendData(filteredGraphData);
			maxValue = this.getMaxValue(filteredGraphData);
			graphData = filteredGraphData;
		}
		else {
			lines = this.createLines(graphData);
			//legendPayload = this.getLegendData(graphData);
			maxValue = this.getMaxValue(graphData);
		}
		
		return (
			<Container fluid> 
				<Row>
					<Col sm = {2}>
						<Row>
							<Col>
								{dropdownOption}
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
							<Col>
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
								{stringFilters}
							</Col>
						</Row> 
						<br/>
						<Row>
						{/*
							<Form>
								<Form.Group controlId = {23}>
									{maxValue === null
										?
											<div>
												<Form.Label> <strong> Toggle Y-Axis: </strong> N/A </Form.Label>
												<Form.Control type = "range" disabled = {true}/>
											</div>
										:
											<div>
												<Form.Label> <strong> Toggle Y-Axis: </strong> {this.state.rangeValue} </Form.Label>
												<Form.Control type = "range" value = {this.state.rangeValue} max = {this.state.rangeValue} onChange = {(e) => {this.onChangeSlider(e)}}/>
											</div>
									}
								</Form.Group>
							</Form>
						*/}
						</Row>
					</Col>
					<Col sm = {10}>
						<div className = "graph-container">
						{graphData === null ?
							<h3> <i> Graph Title </i> </h3>
							:
							<h3> {this.state.graphOption} </h3>
						}
							<ResponsiveContainer>
								<LineChart 
									data = {graphData}
								>
									<XAxis dataKey = "Date"/>
									<YAxis type = "number" domain = {[0, maxValue]}/>
									 <CartesianGrid strokeDasharray="3 3" />
									<Tooltip/>
									<Legend />
									{lines}
								</LineChart>
							</ResponsiveContainer>
						</div>
					</Col>
				</Row>
			</Container>

		);
	}
}

export default Graph;