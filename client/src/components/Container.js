import React, { Component } from "react";
import Card from "./Card";
import update from "immutability-helper";
import opensocket from "socket.io-client";
import { DropTarget } from "react-dnd";

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: props.list,
      tasks: {},
      sort: "asc",
    };
  }
  componentDidMount = () => {
    this.fetchTasks("na", "na");
    const socket = opensocket("/");
    socket.on("task", (data) => {
      if (data.action === "create") {
        this.fetchTasks("na", "na");
      }
    });
    socket.on("taskChange", (data) => {
      if (data.action === "create") {
        this.fetchTasks("na", "na");
      }
    });
  };
  fetchTasks = (priority, i) => {
    fetch(`/team/tasks-${this.props.team._id}-${i}-${priority}`)
      .then((res) => {
        return res.json();
      })
      .then((result) => {
        this.setState({ tasks: result.tasks });
      });
  };
  sort = (e, i) => {
    e.preventDefault();
    if (e.target.value === "dsc") {
      this.fetchTasks("na", "na");
      this.setState({ sort: "dsc" });
    } else if (e.target.value === "asc") {
      fetch(`/team/tasks-${this.props.team._id}-na-na`)
        .then((res) => {
          return res.json();
        })
        .then((result) => {
          let tempTeam = result.tasks;
          tempTeam[i] = tempTeam[i].reverse();
          this.setState({ tasks: tempTeam });
        });
    } else if (e.target.value === "STANDARD") {
      fetch(`/team/tasks-${this.props.team._id}-${i}-STANDARD`)
        .then((res) => {
          return res.json();
        })
        .then((result) => {
          let tempTeam = this.state.tasks;
          tempTeam[i] = result.tasks;
          this.setState({ tasks: tempTeam });
        });
    } else if (e.target.value === "FIXED") {
      fetch(`/team/tasks-${this.props.team._id}-${i}-FIXED`)
        .then((res) => {
          return res.json();
        })
        .then((result) => {
          let tempTeam = this.state.tasks;
          tempTeam[i] = result.tasks;
          this.setState({ tasks: tempTeam });
        });
    } else if (e.target.value === "EXPEDITE") {
      fetch(`/team/tasks-${this.props.team._id}-${i}-EXPEDITE`)
        .then((res) => {
          return res.json();
        })
        .then((result) => {
          let tempTeam = this.state.tasks;
          tempTeam[i] = result.tasks;
          this.setState({ teamTasks: tempTeam });
        });
    }
  };
  pushCard(card) {
    if (
      card.responders.filter((responder) => responder._id === this.props.user)
        .length > 0
    ) {
      let tempTasks = this.state.tasks;
      card.stage = this.props.name;
      tempTasks[this.props.name].push(card);

      this.setState({ tasks: tempTasks });
      fetch(`/team-push/${this.props.team._id}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + this.props.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // user: this.props.user,
          // oldBoard: taskName.split("-")[0],
          // newBoard: board,
          // i: parseFloat(taskName.split("+")[1]),
          // situation: 1,
          user: this.props.user,
          board: this.props.name,
          card: card,
          action: "push",
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
      alert("YOu dont have the right to move this task");
    }
    // this.setState(update(this.state, {
    // 	cards: {
    // 		$push: [ card ]
    // 	}
    // }));
  }
  removeCard(index) {
    console.log(
      this.state.tasks[this.props.name][index],
      "this.state.tasks[this.props.name][index]"
    );
    if (
      this.state.tasks[this.props.name][index].responders.filter(
        (responder) => responder._id === this.props.user
      ).length > 0
    ) {
      let tempTasks = this.state.tasks;
      tempTasks[this.props.name].splice(index, 1);
      this.setState({ tasks: tempTasks });
      fetch(`/team-remove/${this.props.team._id}`, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + this.props.token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // user: this.props.user,
          // oldBoard: taskName.split("-")[0],
          // newBoard: board,
          // i: parseFloat(taskName.split("+")[1]),
          // situation: 1,
          user: this.props.user,
          board: this.props.name,
          index: index,
          action: "push",
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
      alert("YOu dont have the right to move this task");
    }
    // this.setState(update(this.state, {
    // 	cards: {
    // 		$splice: [
    // 			[index, 1]
    // 		]
    // 	}
    // }));
  }
  moveCard(dragIndex, hoverIndex, draggedItem) {
    let tempTasks = this.state.tasks;
    tempTasks[this.props.name].splice(dragIndex, 1);
    tempTasks[this.props.name].splice(hoverIndex, 0, draggedItem);
    this.setState({ tasks: tempTasks });
    // const { cards } = this.state;
    // const dragCard = cards[dragIndex];

    // this.setState(update(this.state, {
    // 	cards: {
    // 		$splice: [
    // 			[dragIndex, 1],
    // 			[hoverIndex, 0, dragCard]
    // 		]
    // 	}
    // }));
  }
  render() {
    const { cards, tasks } = this.state;
    const { canDrop, isOver, connectDropTarget } = this.props;
    const boardTasks = tasks[this.props.name] ? tasks[this.props.name] : [];
    const isActive = canDrop && isOver;
    const backgroundColor = isActive ? "#f5f4f386" : "#f5f4f349";
    return connectDropTarget(
      <div
        className="each-board"
        style={{ display: "flex" }}
        key={`board-${this.props.name}`}
      >
        <div className="board-header">
          <div id="board-header-title">
            <div id="circle"></div>
            {this.props.name}
          </div>
          <select
            onChange={(e) => this.sort(e, this.props.name)}
            className="select-sort "
          >
            <option className="react-select-option" value="all"></option>
            <option className="react-select-option" value="asc">
              LEAST RECENT
            </option>
            <option className="react-select-option" value="dsc">
              MOST RECENT
            </option>
            <option className="react-select-option" value="STANDARD">
              STANDARD
            </option>
            <option className="react-select-option" value="FIXED">
              FIXED DATE
            </option>
            <option className="react-select-option" value="EXPEDITE">
              EXPEDITE
            </option>
          </select>
        </div>
        <div
          className="tasks-container"
          key={"tasks-container"}
          style={{ backgroundColor }}
        >
          {boardTasks.map((task, i) => {
            return (
              <Card
                key={`Task-${i}`}
                index={i}
                listId={this.props.id}
                card={task}
                removeCard={this.removeCard.bind(this)}
                moveCard={this.moveCard.bind(this)}
                token={this.props.token}
                user={this.props.user}
                team={this.props.team}
                opacity={this.props.opacity}
                history={this.props.history}
                taskId={`${task.stage}-${task._id}+${i}`}
                id={task._id}
                task={task}
                position={i}
                location1="top"
                location2="left"
                location2Digit=".5vw"
                unit="vh"
                page="teamPage"
              />
            );
          })}
        </div>
      </div>
    );
  }
}
const cardTarget = {
  drop(props, monitor, component) {
    const { id } = props;
    const sourceObj = monitor.getItem();
    if (id !== sourceObj.listId) component.pushCard(sourceObj.card);
    return {
      listId: id,
    };
  },
};
export default DropTarget("CARD", cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(Container);
