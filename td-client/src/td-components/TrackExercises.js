import React, { Component } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';
import ListGroup from 'react-bootstrap/ListGroup';
import Overlay from 'react-bootstrap/Overlay';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import PopoverContent from 'react-bootstrap/PopoverContent';
import PopoverTitle from 'react-bootstrap/PopoverTitle';
import '../td-css/TrackExercises.css';

class TrackExercises extends Component {
	
	state = {
	}
	
	createInfoPopover = () => {
		return (
			<Popover>
				<Popover.Title as = "h3"> Tracking Exercises? </Popover.Title>
				    <Popover.Content>
						Tracking exercises allows you to graph specific exercises 
						so you can easily visualize your progress on certain exercises.
						All you need to do is specify the type and name of the exercise you
						want to track, and how you want to measure/quantify the exercise.
					</Popover.Content>
			</Popover>
		);
	}
	
	render() {
		const infoPopover = this.createInfoPopover();
		return (
			<Container fluid>
				<Row>
					<Col xs = {5}>
						<div className = "container">
							<Row>
								<Col>
									<h3> Track an Exercise </h3>
								</Col>
								<Col>
									<OverlayTrigger trigger = "click" placement = "right" overlay = {infoPopover}>
										<Button className = "info-button" variant = "success"> Info </Button>
									</OverlayTrigger>
								</Col>
							</Row>
							<br/>
							<Row>
								<Col>
									<InputGroup>
										<InputGroup.Prepend> 
											<InputGroup.Text> Exercise Type </InputGroup.Text>
										</InputGroup.Prepend>
										<FormControl as = "select" name = "type"/>
									</InputGroup>
								</Col>
							</Row>
							<br/>
							<Row>
								<Col>
									<InputGroup>
										<InputGroup.Prepend> 
											<InputGroup.Text> Exercise Name </InputGroup.Text>
										</InputGroup.Prepend>
										<FormControl as = "select" name = "type"/>
									</InputGroup>
								</Col>
							</Row>
							<br/>
							<Row>
								<Col>
									<InputGroup>
										<InputGroup.Prepend> 
											<InputGroup.Text> Track Type </InputGroup.Text>
										</InputGroup.Prepend>
										<FormControl as = "select" name = "type"/>
									</InputGroup>
								</Col>
							</Row>
							<br/>
							<Row>
								<Col>
									<Button className = "track-button" variant = "primary"> Add Exercise </Button>
									<Button className = "track-button" variant = "primary"> Reset Fields </Button>
								</Col>
							</Row>
						</div>
					</Col>
					<Col xs = {7}>
						<div className = "container">
							<h3> Trackable Exercises </h3>
						</div>
					</Col>
				</Row>
			</Container>
		);
	}
}

export default TrackExercises;