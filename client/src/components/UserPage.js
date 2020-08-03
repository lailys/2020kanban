import React, { Component } from "react";
import opensocket from "socket.io-client";
import Task from "./Task";

class UserPage extends Component {
  state = {
    user: {},
    responded: [],
    requested: [],
    pic: "",
    image: {},
  };
  componentDidMount = () => {
    this.fetchUserInfo();
    if (this.props.user.pic === "") {
      this.setState({
        pic: "",
        user: this.props.user,
      });
    } else {
      this.setState({
        pic: `/${this.props.user.pic}`,
        user: this.props.user,
      });
    }
    const socket = opensocket("http://localhost:8080");
    socket.on("task", (data) => {
      if (data.action === "create") {
        this.fetchUserInfo();
        // this.props.fetchUsers();
      }
    });
    socket.on("taskChange", (data) => {
      if (data.action === "create") {
        this.fetchUserInfo();
        // this.props.fetchUsers();
      }
    });
    socket.on("taskChange", (data) => {
      if (data.action === "create") {
        this.fetchUserInfo();
        // this.props.fetchUsers();
      }
    });
    socket.on("taskMember", (data) => {
      if (data.action === "create"||data.action === "delete") {
        this.fetchUserInfo();
        // this.props.fetchUsers();
      }
    });
    
    socket.on("userImg", (data) => {
      if (data.action === "create") {
        this.fetchUserInfo();
        // this.props.fetchUsers();
        // this.setState({
        //   pic: `http://localhost:8080/${data}`,
        // });
      }
    });
  };
  fetchUserInfo = () => {
    fetch(`/user/${this.props.user._id}`)
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        console.log(result,"yserpage")

        this.setState({ user: result.user,
          responded:result.user.responded,
          requested:result.user.requested });
      });
  };
  createimg = (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    this.setState({ pic: URL.createObjectURL(file) });
    let image = Object.assign({}, this.state.image);
    image[e.target.id] = e.target.files[0];
    this.setState({ image });
  };
  renderRequested = () => {
    console.log(this.state.user,"yserpage555")

    let all = [];
    if (this.state.requested.length>0) {
      this.state.requested.map((task, i) => {
        const team = { title: task.teamName };
        all.push(
          <Task
            userId={this.props.userId}
            user={this.props.user}
            taskId={`${task.stage}-${task._id}+${i}`}
            token={this.props.token}
            id={task._id}
            key={`Task-${i}`}
            task={task}
            team={team}
            position={i}
            location1="left"
            location2="top"
            location2Digit="1vh"
            unit="vw"
          />
        );
      });
    }
    return (
      <div className="user-req-container">
        <div className="inside">{all}</div>
      </div>
    );
  };
  renderResponded = () => {
    let all = [];
    if (this.state.responded.length>0) {
      this.state.responded.map((task, i) => {
        const team = { title: task.teamName };
        all.push(
          <Task
            userId={this.props.userId}
            user={this.props.user}
            taskId={`${task.stage}-${task._id}+${i}`}
            token={this.props.token}
            id={task._id}
            key={`Task-${i}`}
            task={task}
            team={team}
            position={i}
          />
        );
      });
    }
    return (
      <div className="user-res-container">
        <div className="inside">{all}</div>
      </div>
    );
  };
  submitImg = (e) => {
    e.preventDefault();
    var formData = new FormData();
    Object.keys(this.state.image).map((key) => {
      formData.append(key, this.state.image[key]);
    });
    fetch(
      `/userImg/${this.props.userId}-${this.props.user._id}`,
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + this.props.token,
        },
        body: formData,
      }
    )
      .then((result) => {
        return result.json();
      })
      .then((result) => {
        if (result.done) {
  
        } else {
          alert(result.message);
        }
      });
  };
  render() {
    const style = {
      position: "relative",
    };
    if (this.state.pic !== "") {
      style.backgroundImage = `url("${this.state.pic}")`;
    } else {
      style.backgroundImage = "";
    }
    return this.props.token ? (
      <div
        className="user-page"
        style={{
          width: this.props.pageWidth,
          left: this.props.pageLeft,
          borderRadius: this.props.pageRadius,
          alignItems: this.props.flexFlow,
        }}
      >
        <div id="user-overflow" style={{ width: this.props.overflowWidth }}>
          {this.props.user._id === this.props.userId ? (
            <form
              style={style}
              id="user-page-img"
              onSubmit={this.submitImg}
              encType="multipart/form-data"
            >
              <input
                className="task-picUrl2"
                type="file"
                name="picUrl"
                id="picUrl"
                onChange={(e) => this.createimg(e)}
              />
              <button
                type="submit"
                id="add-edit-user-img-btn"
                className="fas fa-pencil-alt"
              />
            </form>
          ) : (
            <div style={style} id="user-page-img"></div>
          )}
          <div className="user-name">{this.props.user.name}</div>
          <div className="user-req">
            <span className="user-req-pan">REQUESTED</span>
            {this.renderRequested()}
          </div>
          <div className="user-res">
            <span className="user-req-pan">RESPONDED</span>
            {this.renderResponded()}
          </div>
        </div>
      </div>
    ) : (
      <div
        className="user-page"
        style={{
          width: this.props.pageWidth,
          left: this.props.pageLeft,
          borderRadius: this.props.pageRadius,
          alignItems: this.props.flexFlow,
        }}
      >
        <div
          id="user-overflow"
          style={{
            width: this.props.overflowWidth,
          }}
        >
          <div style={style} id="user-page-img"></div>
          <div className="user-name">{this.props.user.name}</div>
          <div className="user-req">
            <span className="user-req-pan">REQUESTED</span>
            {this.renderRequested()}
          </div>

          <div className="user-res">
            <span className="user-req-pan">RESPONDED</span>
            {this.renderResponded()}
          </div>
        </div>
      </div>
    );
  }
}

export default UserPage;
