import React, { Component } from "react";
import { Link } from "react-router-dom";

class LoginPage extends Component {
  state = {
    authentication: {},
    message: "",
  };
  renderPage = () => {
    if (!this.props.token) {
      if (this.props.link === "login") {
        return (
          <div className="login-page">
            <div className="login-page-form">
              <div className="login-title">LOGIN</div>
              <form onSubmit={this.login} className="login-form">
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="email"
                  type="email"
                  placeholder="Email"
                />
                <br />
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="password"
                  type="password"
                  placeholder="Password"
                />
                <Link to="/password-Update-request" className="change-password">
                  Forgot your password?
                </Link>
                <button type="submit" className="login-page-login-btn">
                  LOGIN
                </button>
                <br />
                <Link
                  onClick={(e) => this.props.authPicker(e)}
                  className="header-link login-page-signup-btn"
                  id="signup"
                  to="/signup"
                >
                  SIGNUP
                </Link>
                <br />
                <br />
                <br />
                <br />
              </form>
              {this.message()}
            </div>
          </div>
        );
      } else if (this.props.link === "signup") {
        return (
          <div
            className="login-page"
            style={{ display: `${this.props.display}` }}
          >
            <div className="login-page-form">
              <div className="login-title">SIGNUP</div>
              <form onSubmit={this.signup} className="signup-form">
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="name"
                  type="text"
                  placeholder="Name"
                />
                <br />
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="email"
                  type="email"
                  placeholder="Email"
                />
                <br />
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="password"
                  type="password"
                  placeholder="Password"
                />
                <br />
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  required
                />
                <Link
                  to="/login"
                  className="have-account"
                  id="login"
                  onClick={(e) => this.props.authPicker(e)}
                >
                  Already have an account?
                </Link>
                <br />
                <button type="submit" className="login-page-login-btn">
                  SIGNUP
                </button>
                <br />
                <br />
              </form>
              {this.message()}
            </div>
          </div>
        );
      } else if (this.props.link === "passwordUpdateReq") {
        return (
          <div className="login-page">
            <div className="login-page-form">
              <div className="password-update-title">
                UPDATE PASSWORD REQUEST
              </div>
              <form className="password-update-form" onSubmit={this.requestFor}>
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="email"
                  type="text"
                  placeholder="Email"
                />
                <br />
                <br />
                <br />
                <button className="password-update-btn" type="submit">
                  SUBMIT
                </button>
                <br />
                <Link to="/login" className="back-login-btn">
                  {" "}
                  LOGIN
                </Link>
              </form>
              {this.message()}
            </div>
          </div>
        );
      } else {
        return (
          <div className="login-page">
            <div className="password-update-request">
              <div className="password-update-title">UPDATE PASSWORD</div>
              <form
                className="password-update-form"
                onSubmit={this.requestSubmit}
              >
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="password"
                  type="password"
                  placeholder="Password"
                />
                <br />
                <input
                  onChange={(e) => this.createAcount(e)}
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  required
                />
                <br />
                <br />
                <br />
                <button className="password-update-btn" type="submit">
                  SUBMIT
                </button>
                <br />
                <Link to="/login" className="back-login-btn">
                  {" "}
                  LOGIN
                </Link>
              </form>
              {this.message()}
            </div>
          </div>
        );
      }
    } else {
      this.props.history.push("/");
    }
  };
  logout = (e) => {
    e.preventDefault();
    localStorage.clear();
  };
  createAcount = (e) => {
    let authentication = Object.assign({}, this.state.authentication);
    authentication[e.target.id] = e.target.value;
    this.setState({ authentication });
  };
  signup = (e) => {
    e.preventDefault();
    const color = `hsla(${~~(360 * Math.random())},94%,70%,.8)`;
    fetch(`/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: this.state.authentication.name,
        email: this.state.authentication.email,
        password: this.state.authentication.password,
        confirmPassword: this.state.authentication.confirmPassword,
        color: color,
      }),
    })
      .then((result) => {
        return result.json();
      })
      .then((res) => {
        if (res.user) {
          this.props.history.push("/login");
        } else {
          this.setState({ message: res.data });
        }
      });
  };
  login = (e) => {
    e.preventDefault();
    fetch(`/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: this.state.authentication.email,
        password: this.state.authentication.password,
      }),
    })
      .then((result) => {
        return result.json();
      })
      .then((res) => {
        if (res.err) {
          this.setState({ message: res.err });
        } else {
          this.props.authChange(res._id, res.token);
          localStorage.setItem("token", res.token);
          localStorage.setItem("userId", res._id);
          const remainingMilliseconds = 60 * 60 * 1000;
          const expiryDate = new Date(
            new Date().getTime() + remainingMilliseconds
          );
          localStorage.setItem("expiryDate", expiryDate.toISOString());
          this.setAutoLogout(remainingMilliseconds);
          this.props.history.push("/");
        }
      });
  };
  setAutoLogout = (milliseconds) => {
    setTimeout(() => {
      this.logoutHandler();
    }, milliseconds);
  };

  message = () => {
    let all = [];
    if (this.state.message.length > 0) {
      this.state.message.map((each, i) => {
        all.push(<div key={i}>{each.msg}</div>);
      });
    }
    return <div id="message"> {all}</div>;
  };
  requestFor = (e) => {
    e.preventDefault();
    fetch(`/update-pass-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: this.state.authentication.email,
      }),
    })
      .then((result) => {
        return result.json();
      })
      .then((res) => {
        if (!res.err) {
          this.props.setToken(res.token);
          this.setState({
            message: [
              { value: "follow email", msg: "please check your email" },
            ],
            authentication: { email: "" },
          });
        } else {
          this.setState({ message: res.err });
        }
      });
  };
  requestSubmit = (e) => {
    e.preventDefault();
    fetch(
      `/update-pass/${this.props.history.location.pathname.split("/")[2]}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: this.state.authentication.password,
          confirmPassword: this.state.authentication.confirmPassword,
        }),
      }
    )
      .then((result) => {
        return result.json();
      })
      .then((res) => {
        if (res.user) {
          this.props.history.push("/login");
        } else {
          this.setState({ message: res.err });
        }
      });
  };
  render() {
    return <div>{this.renderPage()}</div>;
  }
}

export default LoginPage;
