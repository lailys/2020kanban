import React, { Component } from "react";
import "./App.css";
import { Route, Router, Switch, Link } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import TeamSwitch from "./components/TeamSwitch";
import UserPage from "./components/UserPage";
import TeamPage from "./components/TeamPage";
import TaskPage from "./components/TaskPage";
import history from "./components/History";
import opensocket from "socket.io-client";
import axios from 'axios'

class App extends Component {
  state = {
    authSign: "fas fa-sign-in-alt",
    signupBtnDisplay: "flex",
    sigoutBtnDisplay: "none",
    id: "login",
    loginDisplay: "flex",
    teamPageDisplay: "flex",
    teamDisplay: "flex",
    homeDisplay: "none",
    memberDisplay: "none",
    expandedWidth: "7.3vh",
    flexFlow: "center",
    overflowWidth: "91vw",
    pageLeft: "5vw",
    pageWidth: "94vw",
    pageRadius: "0",
    taskWidth: "91vw",
    menuSignId: "",
    btnTitle: "LOGIN",
    link: "",
    teams: [],
    tasks: [],
    users: [],
    isAuth: false,
    token: null,
    userId: null,
    authLoading: false,
    members: [],
  };
  componentDidMount = () => {



    const token = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");
    const userId = localStorage.getItem("userId");
    const socket = opensocket("http://localhost:8080");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();
    this.fetchUsers();
    this.fetchTasks();
    this.fetchTeams();
    this.setState({ isAuth: true, token: token, userId: userId });
    this.setAutoLogout(remainingMilliseconds);
    socket.on("team", (data) => {
      if (data.action === "create") {
        this.fetchTeams();
      }
    });
    socket.on("loggedin", (data) => {
      if (data.action === "create") {
        this.setState({
          signupBtnDisplay: "none",
          sigoutBtnDisplay: "flex",
          loginDisplay: "none",
        });
      }
    });
    socket.on("task", (data) => {
      if (data.action === "create") {
        this.fetchTasks();
      }
    });
    socket.on("signup", (data) => {
      if (data.action === "create") {
        this.fetchUsers();
      }
    });

    if (new Date(expiryDate) <= new Date()) {
      this.logout();
      return;
    }
    this.setState({ userId, token });
    if (!token) {
      this.setState({
        authSign: "fas fa-sign-in-alt",
        signupBtnDisplay: "flex",
        loginDisplay: "flex",
      });
    } else {
      this.setState({
        authSign: "fas fa-sign-out-alt",
        signupBtnDisplay: "none",
        sigoutBtnDisplay: "flex",
        loginDisplay: "none",
      });
    }
  };

  fetchUsers = () => {
    fetch("/allUsers")
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ users: result.users });
      });
  
  };
  fetchTeams = () => {
    fetch("/teams")
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ teams: result.teams });
      });
  };
  fetchTasks = () => {
    fetch("/tasks", {})
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ tasks: result.tasks });
      });
  };
  setAutoLogout = (milliseconds) => {
    setTimeout(() => {
      this.logout();
    }, milliseconds);
  };
  logout = () => {
    localStorage.clear();
    this.setState({
      isAuth: false,
      userId: null,
      authSign: "fas fa-sign-in-alt",
      signupBtnDisplay: "flex",
      sigoutBtnDisplay: "none",
      loginDisplay: "flex",
    });
    // history.push("/login");
  };
  authChange = (id, token) => {
    this.setState({
      isAuth: true,
      authLoading: false,
      token: token,
      userId: id,
      sigoutBtnDisplay: "flex",
    });
    this.fetchTeams();
  };
  userPages = () => {
    // if (this.state.users.length > 0) {
      return this.state.users.map((user, i) => {
        return (
          <Route
            key={`user-${i}`}
            exact
            path={`/users/${user._id}`}
            render={() => (
              <UserPage
                fetchUsers={this.fetchUsers}
                user={user}
                token={localStorage.getItem("token")}
                userId={localStorage.getItem("userId")}
                expiryDate={localStorage.getItem("expiryDate")}
                pageLeft={this.state.pageLeft}
                pageWidth={this.state.pageWidth}
                pageRadius={this.state.pageRadius}
                taskWidth={this.state.taskWidth}
                overflowWidth={this.state.overflowWidth}
                flexFlow={this.state.flexFlow}
              />
            )}
          />
        );
      });
    // }
  };
  teamPages = () => {
    // if (this.state.teams.length > 0) {
      return this.state.teams.map((team, i) => {
        return (
          <Route
            key={`team-${i}`}
            exact
            path={`/teams/${team._id}`}
            render={() => (
              <TeamPage
                title={team.title}
                team={team}
                history={history}
                teamPageDisplay={this.state.teamPageDisplay}
                members={this.fetchTaskMembers}
                pageLeft={this.state.pageLeft}
                pageWidth={this.state.pageWidth}
                taskLeft={this.state.taskLeft}
                pageRadius={this.state.pageRadius}
                taskWidth={this.state.taskWidth}
                overflowWidth={this.state.overflowWidth}
                teamPageDisplaySwitch={this.teamPageDisplaySwitch}
                token={localStorage.getItem("token")}
                user={localStorage.getItem("userId")}
                fetchTasks={this.fetchTasks}
                movePage={this.movePage}
              />
            )}
          />
        );
      });
    // }
  };

  taskPages = () => {
    if (this.state.tasks.length > 0) {
      return this.state.tasks.map((task, i) => {
        return (
          <Route
            key={`rout-${i}`}
            exact
            path={`/${task.teamName}/${task._id}`}
            render={() => (
              <TaskPage
                fetchTasks={this.fetchTasks}
                task={task}
                participate={this.participate}
                user={localStorage.getItem("userId")}
                token={localStorage.getItem("token")}
                pageLeft={this.state.pageLeft}
                pageWidth={this.state.pageWidth}
                pageRadius={this.state.pageRadius}
                taskWidth={this.state.taskWidth}
                overflowWidth={this.state.overflowWidth}
                flexFlow={this.state.flexFlow}
              />
            )}
          />
        );
      });
    }
  };
  authPages = () => {
    let all = [];
    const pages = [
      { key: "login", path: "/login" },
      { key: "signup", path: "/signup" },
      { key: "passwordUpdateReq", path: "/password-Update-request" },
      { key: "passwordUpdate", path: `/password-Update` },
    ];
    pages.map((page) => {
      if (page.key === "passwordUpdate") {
        all.push(
          <Route
            key={page.key}
            path={page.path}
            render={() => (
              <LoginPage
                user={this.state.user}
                token={localStorage.getItem("token")}
                link={page.key}
                authPicker={this.authPicker}
                history={history}
                authChange={this.authChange}
              />
            )}
          />
        );
      } else {
        all.push(
          <Route
            key={page.key}
            exact
            path={page.path}
            render={() => (
              <LoginPage
                user={this.state.user}
                token={localStorage.getItem("token")}
                link={page.key}
                authPicker={this.authPicker}
                history={history}
                authChange={this.authChange}
              />
            )}
          />
        );
      }
    });
    all.push(<Route key="home" exact path="/" render={() => <div></div>} />);
    return (
      <Switch>
        {all}
        {this.userPages()}
        {this.teamPages()}
        {this.taskPages()}
      </Switch>
    );
  };

  authPicker = (e) => {
    this.movePage("close");
    if (e.target.id === "logout") {
      if (e.target.className.split(" ")[1] === "fa-sign-out-alt") {
        this.logout();
      }
      this.fetchTeams();
      this.setState({
        link: "login",
        homeDisplay: "flex",
      });
    } else if (e.target.id === "signup") {
      this.setState({
        link: "signup",
        homeDisplay: "flex",
      });
    }
  };

  home = (e) => {
    this.movePage("close");
    this.setState({
      link: "",
      homeDisplay: "none",
    });
  };
  buttonRender = () => {
    if (this.state.user) {
      return (
        <Link
          to={this.state.link}
          className="log-btn"
          id={this.state.navBtn}
          onClick={(e) => this.authPicker(e)}
        >
          {this.state.btnTitle}
        </Link>
      );
    } else {
      return (
        <div
          className="log-btn"
          id={this.state.navBtn}
          onClick={(e) => this.authPicker(e)}
        >
          {this.state.btnTitle}
        </div>
      );
    }
  };

  switchTeams = () => {
    return (
      <TeamSwitch
        teamPageDisplaySwitch={this.teamPageDisplaySwitch}
        token={localStorage.getItem("token")}
        user={localStorage.getItem("userId")}
        users={this.state.users}
        teams={this.state.teams}
        fetchTeams={this.fetchTeams}
        expandedWidth={this.state.expandedWidth}
        menuSignId={this.state.menuSignId}
        history={history}
        movePage={this.movePage}
      />
    );
  };
  movePage = (navStatus) => {
    if (navStatus === "open") {
      this.setState({
        menuSignId: "first-btn",
        expandedWidth: "18vw",
        overflowWidth: "77vw",
        flexFlow: "flex-end",
        pageWidth: "79vw",
        pageLeft: "19vw",
        pageRadius: "15px",
        taskWidth: "76.9vw",
      });
    } else {
      this.setState({
        menuSignId: "",
        expandedWidth: "7.3vh",
        flexFlow: "center",
        overflowWidth: "91vw",
        pageWidth: "94vw",
        pageLeft: "5vw",
        pageRadius: "0",
        taskWidth: "91vw",
      });
    }
  };
  teamPageDisplaySwitch = (display) => {
    display === "none"
      ? this.setState({ teamPageDisplay: "none" })
      : this.setState({ teamPageDisplay: "flex" });
  };
  render() {
    return (
      <div className="container">
        <Router history={history}>
          {this.switchTeams()}
          <button
            className="signout-btn"
            onClick={(e) => this.authPicker(e)}
            style={{ display: this.state.sigoutBtnDisplay }}
          >
            <div className="fas fa-sign-out-alt" id="logout"></div>
          </button>
          {this.authPages()}
          <Link
            to="/signup"
            className="signup-btn"
            style={{ display: this.state.signupBtnDisplay }}
            onClick={(e) => this.movePage("close")}
          >
            <div
              className="fas fa-user-plus"
              id="signup"
              onClick={(e) => this.authPicker(e)}
            ></div>
          </Link>
          <Link
            to="/login"
            className="signin-btn"
            style={{ display: this.state.loginDisplay }}
            onClick={(e) => this.movePage("close")}
          >
            <div className="fas fa-sign-in-alt" id="login" />
          </Link>
          <Link to="/" className="back-home-btn " onClick={(e) => this.home(e)}>
            S
          </Link>
        </Router>
      </div>
    );
  }
}

export default App;
