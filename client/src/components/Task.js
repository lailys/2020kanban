import React, { Component } from "react";
import { Link } from "react-router-dom";
import opensocket from "socket.io-client";
import moment from "moment";

class Task extends Component {
  state = {
    members: [],
    deadline: "",
    display: "none",
  };
  componentDidMount = () => {
    const socket = opensocket("/");
    this.fetchMembers();
    this.setState({
      deadline: !this.props.task.deadline
        ? ""
        : moment(this.props.task.deadline).format("MMMM Do YYYY, HH:mm a "),
    });
    socket.on("taskMember", (data) => {
      if (data.action === "create") {
        this.fetchMembers();
      }
    });
  };
  fetchMembers = () => {
    fetch(`/task-members/${this.props.task._id}`, {
      headers: {
        Authorization: "Bearer ",
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ members: result.members });
      });
  };
  imgRender = () => {
    let all = [];
console.log(this.state.members,"task======>members")
    for (let i = 0; i < this.state.members.length; i++) {
      const style = {
        position: "absolute",
        left: `${i * 2}vh`,
        bottom: ".3vmin",
        color: "white",
      };
      if (this.state.members[i].pic) {
        style.backgroundImage = `url("/${this.state.members[i].pic}")`;
      } else {
        style.backgroundImage = "none";
        style.backgroundColor = this.state.members[i].color;
        style.color = "white";
      }
      console.log(this.state.members[i].pic,"this.state.members[i].pic",style)
      if (style.backgroundImage !== "#5f5f64b0") {
        all.push(
          <div key={`img-${i}`} className="task-img" style={style}>
            {!this.state.members[i].pic
              ? `${this.state.members[i].name.split(" ")[0][0]}${
                  this.state.members[i].name.split(" ")[1][0]
                }`
              : ""}
          </div>
        );
      } else {
        all.push(
          <div key={`img-${i}`} className="task-img" style={style}>
            <div>
              {!this.state.members[i].pic
                ? `${this.state.members[i].name.split(" ")[0][0]}${
                    this.state.members[i].name.split(" ")[1][0]
                  }`
                : ""}
            </div>
          </div>
        );
      }
    }
    return <div className="members-container-user-page">{all}</div>;
  };
  renderRemove = () => {
    return this.props.token ? (
      <span
        id="user-page-span"
        onClick={(e) =>
          this.props.removeTask(
            e,
            this.props.task.team,
            this.props.task._id,
            this.props.task.stage,
            this.props.position
          )
        }
      >
        -
      </span>
    ) : (
      <span></span>
    );
  };
  displayModal = (e) => {
    this.state.display === "flex"
      ? this.setState({ display: "none" })
      : this.setState({ display: "flex" });
  };
  removeTask = (e) => {
    if (this.props.token) {
      fetch(`/tasks/${this.props.id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + this.props.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: localStorage.getItem("userId"),
          team: this.props.task.team,
          task: this.props.id,
          stage: this.props.task.stage,
          i: this.props.position,
        }),
      })
        .then((result) => {
          return result.json();
        })
        .then((res) => {
          if (!res.done) {
            alert(res.message);
          }
        });
    } else {
      this.props.history.push("/login");
    }
  };
  render() {
    const style = {};
    if (this.props.location1 === "top") {
      style.opacity = this.props.opacity;
      style.marginBottom = ".3vh";
      style.marginLeft = ".1vw";
      style.width = "20vw";
      // style.minHeight = "16vh";
      style.height = "26%";
    } else {
      style.margin = "0 .5vh";
      style.width = "20%";
      style.height = "80%";
    }
    return (
      // this.props.page!=="teamPage"? (
      <div
        className="task-cube-user-page"
        id={`id-${this.props.id}+${this.props.position}`}
        style={style}
        index="yes"
      >
        <div
          className="task-cube-priority"
          onClick={(e) => this.displayModal(e)}
          style={{ backgroundColor: this.props.task.priority }}
        ></div>
        <div className="task-title-user-page">
          {this.props.task.title.toUpperCase()}
        </div>
        <div className="task-cube-middle-user-page">
          <Link
            id="link"
            className="fas fa-question"
            to={`/${this.props.team.title}/${this.props.task._id}`}
          ></Link>
          <div className="member-count">
            <div className="member-sign">
              <i className="fas fa-user-friends"></i>
            </div>
            <div className="count">{this.props.task.responders.length}</div>
          </div>
          <div className="deadline">
            <i className="fas fa-clock"></i>
            <div className="time">
              {this.state.deadline === "invalid date"
                ? ""
                : this.state.deadline}
            </div>
          </div>
        </div>
        {this.imgRender()}
        {this.props.user._id === this.props.userId ? (
          <div
            className="modal-content"
            style={{
              backgroundColor: this.props.task.priority,
              color: "white",
              display: this.state.display,
            }}
          >
            <span
              onClick={(e) => this.displayModal(e)}
              className="close"
              style={{
                backgroundColor: this.props.task.priority,
              }}
            >
              &times;
            </span>
            <div className="modal-text">Are you sure you want to delete?</div>
            <div
              id="task-page-remove-task"
              onClick={(e) => this.removeTask(e)}
              style={{ color: this.props.task.priority }}
            >
              -
            </div>
          </div>
        ) : (
          <div style={{ background: "none" }}></div>
        )}
      </div>
    );
  }
}

export default Task;
