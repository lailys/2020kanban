import React, { Component } from "react";
import { Link } from "react-router-dom";

class TeamSwitch extends Component {
  state = {
    teams: [],
    name: "",
    display: "none",
    render: "team",
    user: "",
    task: "",
    team: "",
    teamID: "",
    userID: "",
  };
  componentDidMount() {
    if (this.props.teamDisplay === "none") {
      this.setState({ display: "none" });
    }
  }
  addTeam = (e) => {
    this.props.history.push("/");
    this.props.movePage("close");
    if (this.props.token) {
      this.props.teamPageDisplaySwitch(this.state.display);
      this.state.display === "none"
        ? this.setState({ display: "flex" })
        : this.setState({ display: "none" });
    } else {
      this.props.history.push("/login");
    }
  };
  submitTeam = (e) => {
    e.preventDefault();
    if (this.props.token) {
      fetch("/teams", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + this.props.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: this.state.name,
          color: "red",
          teamMembers: [],
          user: this.props.user,
        }),
      })
        .then((result) => {
          return result.json();
        })
        .then((message) => {
          this.props.teamPageDisplaySwitch("flex");
          this.setState({ display: "none", name: "" });
          this.redirect();
        });
    }
  };
  redirect = () => {
    this.props.fetchTeams();
    fetch("/teams")
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ teams: result.teams });
        this.props.history.push(
          `/teams/${result.teams[result.teams.length - 1]._id}`
        );
      });
  };
  createTeam = (e) => {
    this.setState({ name: e.target.value });
  };
  removeTeam = (e, teamTitle, teamId) => {
    fetch(`/teams/${teamId}`, {
      method: "DELETE",
      body: JSON.stringify({
        title: teamTitle,
        team: teamId,
      }),
      headers: {
        Authorization: "Bearer " + this.props.token,
        "Content-Type": "application/json",
      },
    })
      .then((result) => {
        return result.json();
      })
      .then((res) => {
        if (res.msg) {
          this.props.history.push("/login");
        } else {
          this.props.fetchTeams();
          this.props.history.push(
            // `/teams/${res.teams[res.teams.length - 1]._id}`
            "/"
          );
        }
      });
  };
  renderTeams = (render) => {
    let all = [];
    if (render === "team") {
      all.push(
        <div key="team-title" id="board-title">
          TEAMS
        </div>
      );
      if (this.props.teams.length > 0) {
        this.props.teams.map((team, i) => {
          all.push(
            <Link
              to={`/teams/${team._id}`}
              key={`link-${i}`}
              className="team-box"
              id={`${i}-team`}
              style={{ textDecoration: "none" }}
            >
              <div> {team.title.toUpperCase()}</div>
            </Link>
          );
        });
      }
    } else if (render === "user") {
      all.push(
        <div key="users-title" id="board-title">
          USERS
        </div>
      );
      if (this.props.users.length > 0) {
        this.props.users.map((user, i) => {
          all.push(
            <Link
              to={`/users/${user._id}`}
              key={`user-link-${i}`}
              className="user-box"
              id={`${i}-user`}
              style={{ textDecoration: "none" }}
            >
              <div> {user.name.toUpperCase()}</div>
            </Link>
          );
        });
      }
    }
    return <div className="menu-cubes-container">{all}</div>;
  };
  switchTeamUser = (e) => {
    e.preventDefault();
    this.setState({ display: "none" });
    this.props.teamPageDisplaySwitch("flex");
    if (e.target.className === "fas fa-address-card") {
      this.props.movePage("open");
      this.setState({
        containerDisplay: "flex",
        render: "user",
        user: "menu-btn-clicked",
        team: "",
        task: "",
      });
    } else if (e.target.className === "fas fa-users") {
      this.props.movePage("open");
      this.setState({
        render: "team",
        user: "",
        team: "menu-btn-clicked",
        task: "",
      });
    } else if (e.currentTarget.className === "menu-sign") {
      if (e.currentTarget.id === "") {
        this.props.movePage("open");
        this.setState({
          render: "user",
          user: "menu-btn-clicked",
          team: "",
          task: "",
        });
      } else {
        this.props.movePage("close");
        this.setState({
          user: "",
          team: "",
          task: "",
        });
      }
    }
  };
  render() {
    return (
      <div id="menu-location" style={{ display: this.props.teamDisplay }}>
        <button
          onClick={(e) => this.addTeam(e)}
          className="fas fa-plus"
          id="team-plus"
        ></button>
        <div
          className="expanded-menu"
          style={{ width: this.props.expandedWidth }}
        >
          {this.renderTeams(this.state.render)}
        </div>
        <div className="unexpanded-menu">
          <div
            className="menu-sign"
            id={this.props.menuSignId}
            onClick={(e) => this.switchTeamUser(e)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="user" id={this.state.user}>
            <i
              className="fas fa-address-card"
              onClick={(e) => this.switchTeamUser(e)}
            ></i>
          </div>
          <div className="team" id={this.state.team}>
            <i
              className="fas fa-users"
              onClick={(e) => this.switchTeamUser(e)}
            ></i>
          </div>
          <div className="task" id={this.state.task}>
            <i className="fas fa-tasks"></i>
          </div>
        </div>
        <form
          onSubmit={(e) => this.submitTeam(e)}
          className="add-team-form"
          style={{ display: this.state.display }}
        >
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <div className="add-team">NEW TEAM</div>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <input
            onChange={(e) => this.createTeam(e)}
            className="name-input"
            id="name"
            type="text"
            placeholder="Name"
            value={this.state.name}
          />
          <br />
          <br />
          <button type="submit" className="add-team-btn">
            ADD TEAM
          </button>
        </form>
      </div>
    );
  }
}

export default TeamSwitch;
