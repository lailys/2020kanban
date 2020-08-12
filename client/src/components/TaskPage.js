import React, { Component } from "react";
import opensocket from "socket.io-client";
import moment from "moment";
import Member from "./Member";
import { DateTimeInput } from "semantic-ui-calendar-react";
import { Form } from "semantic-ui-react";

class TaskPage extends Component {
  state = {
    members: [],
    pic: "",
    image: {},
    optionDisplay: "none",
    deadline: "",
    datetime: "",
    priority: "",
    comments: [],
    newComment: {},
  };
  componentDidMount = () => {
    this.getMembers();
    this.fetchComments();
    if (this.props.task.deadline) {
      this.setState({
        deadline: moment(this.props.task.deadline).format(
          "MMMM Do YYYY, HH:mm a "
        ),
        datetime: this.props.task.deadline,
        priority: this.props.task.priority,
      });
    } else {
      this.setState({
        deadline: "",
        datetime: this.props.task.deadline,
        priority: this.props.task.priority,
      });
    }
    if (this.props.task.pic !== "") {
      this.setState({
        pic: `/${this.props.task.pic}`,
      });
    } else {
      this.setState({
        pic: "",
      });
    }
    const socket = opensocket("/");
    socket.on("taskComment", (data) => {
      if (data.action === "create") {
        this.fetchComments();
      }
    });
    socket.on("taskMember", (data) => {
      if (data.action === "create" || data.action === "delete") {
        this.getMembers();
      }
    });
    socket.on("taskImg", (data) => {
      if (data.action === "create") {
        this.setState({ pic: `/${data.img}` });
      }
    });
  };
  fetchComments = () => {
    fetch(`/comments/${this.props.task._id}`)
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ comments: result.comments });
      });
  };
  getMembers = () => {
    fetch(`/task-members/${this.props.task._id}`, {
      headers: {
        Authorization: "Bearer " + this.props.token,
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ members: result.members });
      });
  };
  createImg = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    this.setState({ pic: URL.createObjectURL(file) });
    let image = Object.assign({}, this.state.image);
    image[e.target.id] = e.target.files[0];
    this.setState({ image });
  };
  handleChange = (e, { name, value }) => {
    this.setState({
      deadline: value,
      datetime: value,
    });
  };
  createEdit = (e) => {
    this.setState({ priority: e.target.value });
  };
  createComment = (e) => {
    this.setState({
      newComment: { id: this.props.user, comment: e.target.value },
    });
  };
  updateMembers = (members) => {
    this.setState({ members });
  };
  submitImg = (e) => {
    e.preventDefault();
    if (this.props.task.creator === this.props.user) {
      var formData = new FormData();
      Object.keys(this.state.image).map((key) => {
        formData.append(key, this.state.image[key]);
      });
      fetch(`/taskImg/${this.props.user}-${this.props.task._id}`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + this.props.token,
        },
        body: formData,
      })
        .then((result) => {
          return result.json();
        })
        .then((result) => {
          if (result.done) {
          } else {
            alert(result.message);
          }
        });
    } else {
      alert("you are not eligible to change the picture");
    }
  };
  participate = (e) => {
    e.preventDefault();
    fetch("/task-members", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: this.props.task,
        user: this.props.user,
      }),
    })
      .then((result) => {
        return result.json();
      })
      .then((result) => {
        if (result.done) {
          console.log(result,"##########")
          this.setState({ members :result.members});
        } else {
          alert(result.message);
        }
      });
  };
  submitComment = (e) => {
    console.log(this.props.task.responders,"this.props.task.responders")

    e.preventDefault();
    this.setState({ newComment: {} });
    fetch(`/task-comment`, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: this.state.newComment,
        user: this.props.user,
        responders: this.props.task.responders,
        taskId: this.props.task._id,
        date: new Date(),
      }),
    })
      .then((result) => {
        return result.json();
      })
      .then((result) => {
        consol.log(result,"!!!!!!!!")
        if (result.done) {
          this.setState({ newComment: {} });
        } else {
          alert(result.message);
        }
      });
  };
  submitChange = (e) => {
    e.preventDefault();
    if (this.props.token) {
      fetch("/update-task", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + this.props.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: this.props.task._id,
          title: this.props.task.title,
          description: this.props.task.description,
          priority: this.state.priority,
          url: this.props.task.url || "",
          deadline: this.state.datetime,
          user: this.props.user,
        }),
      })
        .then((result) => {
          return result.json();
        })
        .then((result) => {
          if (!result.done) {
            alert(result.message);
          }
        });
    } else {
      this.props.history.push("/login");
    }
  };
  renderMembers = () => {
    let all = [];
    this.state.members.map((member, i) => {
      all.push(
        <Member
          key={`img-${i}`}
          member={member}
          members={member.responders}
          updateMembers={this.updateMembers}
          i={i}
          token={this.props.token}
          task={this.props.task}
          user={this.props.user}
        />
      );
    });
    return (
      <div className="task-page-members" key="task-page-members">
        {all}
      </div>
    );
  };
  renderCommentArea = () => {
    let all = [];
    if (this.state.comments.length > 0) {
      this.state.comments.map((comment, i) => {
        all.push(
          <div className="comment-cube" key={`comment-cube-${i}`}>
            <p className="comment">
              <span style={{ fontSize: "110%", fontWeight: "400" }}>
                {`${comment.commenter}: `}
              </span>
              {comment.comment}
              <br />
              <span
                className="comment-date"
                style={{ fontSize: "80%", fontWeight: "400" }}
              >
                {!comment.date
                  ? ""
                  : moment(comment.date).format("MMMM Do YYYY, HH:mm a ")}
              </span>
            </p>
          </div>
        );
      });
    }
    if (this.props.token) {
      return (
        <div className="comments-area" key="comments-area">
          {all}
          <form onSubmit={this.submitComment}>
            <br />
            <textarea
              id="text-area"
              value={this.state.newComment.comment || ""}
              onChange={(e) => this.createComment(e)}
            ></textarea>
            <br />
            <button type="submit" className="post-comment-btn">
              COMMENT
            </button>
          </form>
        </div>
      );
    } else {
      return (
        <div className="comments-area" key="comments-area">
          {all}
        </div>
      );
    }
  };
  defaultPriority = (priority) => {
    if (priority === "#0aa7f5") {
      return "STANDARD";
    } else if (priority === "#EDF67D") {
      return "FIXED DATE";
    } else if (priority === "#ff006e") {
      return "EXPEDITE";
    }
  };
  renderPage = () => {
    const now = new Date();

    if (this.props.token) {
      const style = {
        position: "relative",
      };

      if (this.state.pic) {
        style.backgroundImage = `url("${this.state.pic}")`;
        style.height = "60vh";
      } else {
        style.backgroundImage = "";
        style.height = "10vh";
      }
      return (
        <div
          className="task-page-container"
          style={{
            width: this.props.overflowWidth,
          }}
        >
          <div
            className="task-overflow"
            style={{ width: this.props.overflowWidth }}
          >
            {/* <form
              id="input"
              style={style}
              onSubmit={this.submitImg}
              encType="multipart/form-data"
            >
              <input
                className="task-picUrl"
                type="file"
                name="picUrl"
                id="picUrl"
                onChange={(e) => this.createImg(e)}
              />
              <button
                type="submit"
                id="task-img-update-btn"
                className="fas fa-pencil-alt"
              ></button>
            </form> */}
            <div className="task-page-name">
              {this.props.task.title.toUpperCase()}
            </div>
            <p className="task-page-desc">
              {this.props.task.description}
              <a href={`${this.props.task.url}`}>LINK</a>
            </p>
            <Form onSubmit={(e) => this.submitChange(e)} id="edit-date-form">
              <DateTimeInput
                initialDate={now}
                id="date-timeInput"
                className="task-page-date"
                name="dateTime"
                placeholder="Deadline"
                value={this.state.deadline}
                iconPosition="right"
                onChange={this.handleChange}
                style={{ width: "40vw", border: "none", outline: "none" }}
                dateTimeFormat="YYYY-MM-DD HH:mm"
              />
              <select
                value={this.state.priority}
                onChange={(e) => this.createEdit(e)}
                id="edit-select"
                style={{ border: "none", outline: "none" }}
              >
                <option
                  value={`${this.state.priority}`}
                  style={{
                    color: this.state.priority,
                    fontSize: "300%",
                    fontWeight: "bolder",
                  }}
                  defaultValue
                >
                  {this.defaultPriority(this.state.priority)}
                </option>
                <option value="#0aa7f5">STANDARD</option>
                <option value="#EDF67D">FIXED DATE</option>
                <option value="#ff006e">EXPEDITE</option>
                {/* DD1E00 ,  FE23BA */}
              </select>
              <br />
              <br />
              <button
                type="submit"
                id="update-button"
                className="fas fa-pencil-alt"
              />
            </Form>
            {this.renderCommentArea()}
            {this.renderMembers()}
            <div
              className="participate-btn"
              onClick={(e) => this.participate(e)}
            >
              +
            </div>
          </div>
        </div>
      );
    } else {
      const style = {
        position: "relative",
      };

      if (this.state.pic !== "") {
        style.backgroundImage = `url("${this.state.pic}")`;
        style.height = "40vh";
      } else {
        style.backgroundImage = "";
        style.height = "10vh";
      }
      return (
        <div
          className="task-page-container"
          style={{
            width: this.props.overflowWidth,
          }}
        >
          <div
            className="task-overflow"
            style={{ width: this.props.overflowWidth }}
          >
            {/* <div id="input" style={style}></div> */}
            <div className="task-page-name">
              {this.props.task.title.toUpperCase()}
            </div>
            <p className="task-page-desc">
              {this.props.task.description}
              <a
                className="task-page-link-inside"
                href={`${this.props.task.url}`}
              >
                <span></span>LINK
              </a>
              <span
                className="task-page-date-inside"
                style={{
                  color: "#ff006e",
                  width: "66vw",
                  height: "3vh",
                  margin: "1vh 0",
                }}
              >
                {this.state.deadline}{" "}
              </span>
            </p>
            <div id="edit-date-form">
              {/* <div  id="date-timeInput" 
            className="task-page-date"
            style={{color:"#ff006e", width:"66vw",height:"3vh",margin:"1vh 0"}}
            >
            {this.state.deadline}
            </div> */}
              <div
                className="edit-date-form-p"
                style={{
                  border: `solid .1px ${this.state.priority}`,
                }}
              >
                {this.defaultPriority(this.state.priority)}
              </div>
            </div>
            {this.renderCommentArea()}
            {this.renderMembers()}
          </div>
        </div>
      );
    }
  };
  render() {
    return (
      <div
        className="task-page"
        style={{
          width: this.props.pageWidth,
          left: this.props.pageLeft,
          borderRadius: this.props.pageRadius,
          alignItems: this.props.flexFlow,
        }}
      >
        {this.renderPage()}
      </div>
    );
  }
}

export default TaskPage;
