import React, { Component } from "react";
import { Link } from "react-router-dom";

class Member extends Component {
  state = {
    optionDisplay: "none",
    pic: "",
  };
  componentDidMount = () => {
    this.props.member.pic !== ""
      ? this.setState({
          pic: `/${this.props.member.pic}`,
        })
      : this.setState({
          pic: "",
        });
  };
  memberOption = (e) => {
    this.state.optionDisplay === "none"
      ? this.setState({ optionDisplay: "flex" })
      : this.setState({ optionDisplay: "none" });
  };
  outOfProject = (e) => {
    e.preventDefault();
    fetch("/task-members/remove", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: this.props.task._id,
        user: this.props.user,
      }),
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
  };
  render() {
    const style1 = {};
    style1.color = "white";
    // this.state.pic === ""
    //   ? (style1.background = this.props.member.color)
    //   : (style1.background = "none");
    style1.background = this.props.member.color
    const style = {
      position: "relative",
      // backgroundRepeat: "no-repeat",
      // backgroundPosition: "center",
      // backgroundSize: "cover",
    };
    // if (this.state.pic) {
    //   style.backgroundImage = `url("${this.state.pic}")`;
    // } else {
    //   style.backgroundImage = "";
    // }
    return !this.props.token ? (
      <div
        className="task-page-img"
        id={this.props.i}
        onClick={(e) => this.memberOption(e)}
        style={style}
      >
        <div className="task-page-member-pic" style={style1}>
          {
          // this.state.pic === ""
          //   ? 
            `${this.props.member.name.split(" ")[0][0].toUpperCase()}
              ${this.props.member.name.split(" ")[1][0].toUpperCase()}`
            // : ""
            }
        </div>
        <Link
          to={`/users/${this.props.member._id}`}
          className="task-page-img-info"
          style={{ display: this.state.optionDisplay }}
        >
          ?
        </Link>
      </div>
    ) : (
      <div
        className="task-page-img"
        id={this.props.i}
        onClick={(e) => this.memberOption(e)}
        style={style}
      >
        <div className="task-page-member-pic" style={style1}>
          {
          // this.state.pic === ""
          //   ? 
            `${this.props.member.name.split(" ")[0][0].toUpperCase()}
              ${this.props.member.name.split(" ")[1][0].toUpperCase()}`
            // : ""
            }
        </div>
        <Link
          to={`/users/${this.props.member._id}`}
          className="task-page-img-info"
          style={{ display: this.state.optionDisplay }}
        >
          ?
        </Link>
        {
          this.props.member._id===this.props.user?
          <div
          className="task-page-img-remove"
          onClick={(e) => this.outOfProject(e)}
          style={{ display: this.state.optionDisplay }}
        >
          -
        </div>:
        <div/>
        }
      </div>
    );
  }
}

export default Member;
