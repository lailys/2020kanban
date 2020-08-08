import React, { Component } from "react";
import { findDOMNode } from "react-dom";
import { DragSource, DropTarget } from "react-dnd";
import flow from "lodash/flow";
import { Link } from "react-router-dom";
import opensocket from "socket.io-client";
import moment from "moment";



class Card extends Component {
  state = {
    members: [],
    deadline: "",
    display: "none",
  };
  componentDidMount = () => {
    const socket = opensocket("/");
    this.fetchMembers();
    this.setState({
      deadline: !this.props.card.deadline
        ? ""
        : moment(this.props.card.deadline).format("MMMM Do YYYY, HH:mm a "),
    });
    socket.on("taskMember", (data) => {
      if (data.action === "create") {
        this.fetchMembers();
      }
    });
  };
  fetchMembers = () => {
    fetch(`/task-members/${this.props.card._id}`, {
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
  renderRemove = () => {
    return this.props.token ? (
      <span
        id="user-page-span"
        onClick={(e) =>
          this.props.removeTask(
            e,
            this.props.card.team,
            this.props.card._id,
            this.props.card.stage,
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
          team: this.props.card.team,
          task: this.props.id,
          stage: this.props.card.stage,
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
    const {
      card,
      isDragging,
      connectDragSource,
      connectDropTarget,
    } = this.props;
    const members=this.state.members
    const opacity = isDragging ? 0.5 : 1;
    return connectDragSource(
       connectDropTarget(
          <div
            className="task-cube"
            id={`id-${this.props.id}+${this.props.position}`}
            style={{  opacity }}
            index="whatttt"
          >
            <i
              className="fas fa-bookmark"
              id={`bookmark-${this.props.id}+${this.props.position}`}
              style={{ color: card.priority }}
            ></i>
            <div
              className="task-title"
              id={`cube-${this.props.id}+${this.props.position}`}
            >
              {card.title.toUpperCase()}
            </div>
            <div className="task-cube-middle">
              <Link
                id="link"
                className="fas fa-question"
                to={`/${this.props.team.title}/${card._id}`}
              ></Link>
              <div className="member-count">
                <div className="member-sign">
                  <i className="fas fa-user-friends"></i>
                </div>
                <div className="count">{card.responders.length}</div>
              </div>
              {this.props.card.deadline ? (
                <div className="deadline">
                  <div className="background"></div>
                  <div
                    id="cube-deadline"
                    style={{ opacity: this.state.timeOpacity }}
                  >
                    {!this.props.card.deadline
                      ? ""
                      : moment(this.props.card.deadline).format(
                          "MMMM Do YYYY, HH:mm a "
                        )}
                  </div>
                  <div
                    className="fas fa-clock"
                    onMouseOver={(e) => {
                      this.setState({ timeOpacity: "1" });
                    }}
                    onMouseLeave={(e) => {
                      this.setState({ timeOpacity: "0" });
                    }}
                  />
                </div>
              ) : (
                <div className="deadline"></div>
              )}
            </div>
            <div className="members-container">
              {this.props.card.responders.map((member, i) => {
                let style = {};
                  (style = {
                      position: "absolute",
                      right: `${i * 2}vh`,
                      top: "0",
                      backgroundImage: "none",
                      color: "white",
                      backgroundColor: member.color,
                    });
                return(
                  <div key={`img-${i}`} className="task-img" style={style}>
                    <div>
                      {
                        `${member.name.split(" ")[0][0].toUpperCase()}
                        ${member.name.split(" ")[1][0].toUpperCase()}`
                        }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
    );
  }
}
// const cardSource = {
//   beginDrag(props,monitor, component) {
//     console.log("beginDrag",props,monitor, component)
//     const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
//     return {
//       index: props.index,
//       listId: props.listId,
//       card: props.card,
//       cardBottom:hoverBoundingRect.bottom,
//       cardTop:hoverBoundingRect.top
//     };
//   },
//   endDrag(props, monitor) {
//     console.log("beginDrag",props,monitor)
//     const item = monitor.getItem();
//     const dropResult = monitor.getDropResult();
//     console.log("beginDrag","dropResult",dropResult)
//     if (dropResult && dropResult.listId !== item.listId) {
//       props.removeCard(item.index);
//     }
//   },
// };
// const cardTarget = {
//   hover(props, monitor, component) {
//     const dragIndex = monitor.getItem().index;
//     const hoverIndex = props.index;
//     const sourceListId = monitor.getItem().listId;
//     const draggedItem = monitor.getItem().card;
//     const draggedBottom = monitor.getItem().cardBottom;
//     const draggedTop = monitor.getItem().cardTop;
//     // Don't replace items with themselves
//     if (dragIndex === hoverIndex) {
//       return;
//     }
//     const draggedHeight=draggedBottom-draggedTop
//     // Determine rectangle on screen
//     const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
//     // Get vertical middle
//     const hoverY = (hoverBoundingRect.bottom - hoverBoundingRect.top) ;
//     // Determine mouse position
//     const clientOffset = monitor.getClientOffset();
//     // Get pixels to the top
//     const hoverClientY = (clientOffset.y - hoverBoundingRect.top);
//     // Dragging downwards
//     if (dragIndex < hoverIndex && hoverClientY < hoverY/400) {
//       return;
//     }
//     // Dragging upwards
//     if (dragIndex > hoverIndex && (hoverClientY/4) > hoverY) {
//       return;
//     }
//     if (props.listId === sourceListId) {
//       // props.moveCard(dragIndex, hoverIndex, draggedItem);
//       monitor.getItem().index = hoverIndex;
//     }
//   },
// };
const cardSource = {
  beginDrag(props,monitor, component) {
    console.log("beginDrag",props,monitor, component)
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    return {
      index: props.index,
      listId: props.listId,
      card: props.card,
      cardBottom:hoverBoundingRect.bottom,
      cardTop:hoverBoundingRect.top
    };
  },
  endDrag(props, monitor) {
    console.log("beginDrag",props,monitor)
    const item = monitor.getItem();
    const dropResult = monitor.getDropResult();
    if (dropResult && dropResult.listId !== item.listId) {
      console.log("beginDrag","dropResult",item.card._id)

      props.removeCard(item.card._id);
    }
  },
};
const cardTarget = {
  hover(props, monitor, component) {
    console.log(props,"props", component)
    const dragIndex = monitor.getItem().index;
    const dragId = monitor.getItem().card._id;
    const hoverIndex = props.index;
    const hoverId = props.card._id;
    const sourceListId = monitor.getItem().listId;
    const draggedItem = monitor.getItem().card;
    const draggedBottom = monitor.getItem().cardBottom;
    const draggedTop = monitor.getItem().cardTop;
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return;
    }
    const draggedHeight=draggedBottom-draggedTop
    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();
    // Get vertical middle
    const hoverY = (hoverBoundingRect.bottom - hoverBoundingRect.top) ;
    // Determine mouse position
    const clientOffset = monitor.getClientOffset();
    // Get pixels to the top
    const hoverClientY = (clientOffset.y - hoverBoundingRect.top);
    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverY/400) {
      return;
    }
    // Dragging upwards
    if (dragIndex > hoverIndex && (hoverClientY/4) > hoverY) {
      return;
    }
    if (props.listId === sourceListId) {
      console.log(dragId,dragIndex,"===>",hoverId,hoverIndex)

      props.moveCard(dragIndex, hoverIndex, draggedItem);
      monitor.getItem().index = hoverIndex;
    }
  },
};
export default flow(
  DropTarget("CARD", cardTarget, (connect) => ({
    connectDropTarget: connect.dropTarget(),
  })),
  DragSource("CARD", cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }))
)(Card);
