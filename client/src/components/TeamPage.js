import React, { Component } from "react";
import opensocket from "socket.io-client";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";
import Container from "./Container";
import AddTasks from "./AddTasks";
import Task from "./Task";
import Search from "./Search";

class TeamPage extends Component {
  state = {
    boards: ["REQUESTED", "INPROGRESS", "DONE", "TRASH"],
    displayTask: "none",
    display: "flex",
    priority: "",
    opacity: "1",
    newTask: { priority: "#0aa7f5", stage: "REQUESTED" },
    teamTasks: {},
    dragged: {},
    draggedfrom: {},
    sign: {
      REQUESTED: "fas fa-sort-up",
      INPROGRESS: "fas fa-sort-up",
      DONE: "fas fa-sort-up",
    },
    date: "",
    time: "",
    dateTime: "",
    datesRange: "",
    selectedOption: null,
  };
  componentDidMount = () => {
    this.fetchTasks("na","na");
    const socket = opensocket("http://localhost:8080");
    socket.on("task", (data) => {
      if (data.action === "create") {
        this.fetchTasks("na","na");
      }
    });
    socket.on("taskChange", (data) => {
      if (data.action === "create") {
        this.fetchTasks("na","na");
      }
    });
  };
  fetchTasks = (priority, i) => {
    fetch(
      `/team/tasks-${this.props.team._id}-${i}-${priority}`
    )
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ teamTasks: result.tasks });
      });
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };
  search = (e) => {};

  submitTask = (e) => {
    e.preventDefault();
    this.setState({ display: "flex" });
    if (this.props.token) {
      fetch("/tasks", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + this.props.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: this.state.newTask.title,
          description: this.state.newTask.description,
          creator: this.props.user,
          priority: this.state.newTask.priority,
          responder: [],
          url: this.state.newTask.url || "",
          stage: this.state.newTask.stage,
          datetime: this.state.dateTime || "",
          team: this.props.team,
        }),
      })
        .then((result) => {
          return result.json();
        })
        .then((message) => {
          if (message.done) {
            this.setState({
              displayTask: "none",
              newTask: {
                title: "",
                description: "",
                url: "",
                priority: "#priority",
                stage: "REQUESTED",
              },
            });
          } else {
            alert(message.message);
          }
        });
    } else {
      this.props.history.push("/login");
    }
  };
  closeTask = (e) => {
    this.setState({ displayTask: "none", display: "flex" });
  };
  createTask = (e) => {
    let newTask = Object.assign({}, this.state.newTask);
    newTask[e.target.id] = e.target.value;
    this.setState({ newTask: newTask });
    this.setState({
      newTask,
    });
  };
  requestTasks = (e) => {
    this.props.teamPageDisplaySwitch("none");
    this.props.movePage("close");
    if (this.props.token) {
      this.state.displayTask === "none"
        ? this.setState({ displayTask: "flex", display: "none" })
        : this.setState({ displayTask: "none", display: "flex" });
    } else {
      this.props.history.push("/login");
    }
  };
  render() {
    const REQ = this.state.teamTasks.REQUESTED;
    const PROG = this.state.teamTasks.INPROGRESS;
    const DONE = this.state.teamTasks.DONE;
    return (
        <div
          className="each-page"
          style={{ width: this.props.pageWidth, left: this.props.pageLeft }}
        >
            <div className="team-title">
            {this.props.team.title.toUpperCase()}
          </div>
          <div style={{ display: this.state.display }}>
          <Container
            key={`Container-${0}`}
            name={"REQUESTED"}
            className={"REQUESTED"}
            id={0}
            i={"REQUESTED"}
            team={this.props.team}
            token={this.props.token}
            user={this.props.user}
            display={this.state.display}
            sortOptions={this.state.sortOptions}
            sign={this.state.sign["REQUESTED"]}
            requestTasks={this.requestTasks}
            renderTasks={this.renderTasks}
            opacity={this.state.opacity}
            // location1="top"
            // location2="left"
            // location2Digit=".5vw"
            // unit="vh"
            history={this.props.history}
          />
          <Container
            key={`Container-${1}`}
            name={"INPROGRESS"}
            className={"INPROGRESS"}
            id={1}
            i={"INPROGRESS"}
            team={this.props.team}
            token={this.props.token}
            user={this.props.user}
            display={this.state.display}
            sortOptions={this.state.sortOptions}
            sign={this.state.sign["INPROGRESS"]}
            tasks={PROG || []}
           requestTasks={this.requestTasks}
            renderTasks={this.renderTasks}
            opacity={this.state.opacity}
            history={this.props.history}
          />
          <Container
            key={`Container-${2}`}
            name={"DONE"}
            className={"DONE"}
            id={2}
            i={"DONE"}
            team={this.props.team}
            token={this.props.token}
            user={this.props.user}
            display={this.state.display}
            sortOptions={this.state.sortOptions}
            sign={this.state.sign["DONE"]}
            tasks={DONE || []}
           requestTasks={this.requestTasks}
            renderTasks={this.renderTasks}
            opacity={this.state.opacity}
            history={this.props.history}
          />
          <Container
            key={`Container-${3}`}
            name={"TRASH"}
            className={"TRASH"}
            id={3}
            i={"TRASH"}
            team={this.props.team}
            token={this.props.token}
            user={this.props.user}
            display={this.state.display}
            sortOptions={this.state.sortOptions}
            sign={this.state.sign["DONE"]}
            tasks={[]}
            requestTasks={this.requestTasks}
            renderTasks={this.renderTasks}
            opacity={this.state.opacity}
            history={this.props.history}
          />
             </div>
          {this.props.token ? (
            <div>
              <i
                className="fas fa-plus"
                id="add-task-btn"
                onClick={(e) => this.requestTasks(e)}
              />
              <div className="team-title">
                {this.props.team.title.toUpperCase()}
              </div>
              <AddTasks
                displayTask={this.state.displayTask}
                createTask={this.createTask}
                handleChange={this.handleChange}
                date={this.state.date}
                dateTime={this.state.dateTime}
                priority={this.priority}
                submitTask={this.submitTask}
                closeTask={this.closeTask}
                newTask={this.state.newTask}
                taskWidth={this.props.taskWidth}
              />
            </div>
          ) : (
            <div />
          )}
     
      </div>
    );
  }
}
export default DragDropContext(HTML5Backend)(TeamPage);
