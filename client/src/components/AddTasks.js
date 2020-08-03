import React from "react";
import {DateTimeInput,} from "semantic-ui-calendar-react";


const AddTasks = (props) => {
  return (
    <div id="task-form" style={{ display: props.displayTask }}>
      <div id="add-task-close" onClick={(e) => props.closeTask(e)}>
        X
      </div>
      <form onSubmit={(e) => props.submitTask(e)} className="add-task-form" style={{width:props.taskWidth}}>
        <div id="add-task-title">REQUEST</div>
        <input
          onChange={(e) => props.createTask(e)}
          id="title"
          type="text"
          placeholder="title"
          value={props.newTask.title || ""}
        />
        <textarea
          onChange={(e) => props.createTask(e)}
          id="description"
          type="text"
          placeholder="description"
          rows="10"
          style={{ resize: "none" }}
          value={props.newTask.description || ""}
        />
        <input
          onChange={(e) => props.createTask(e)}
          id="url"
          type="url"
          placeholder="url"
          value={props.newTask.url || ""}
        />
        <DateTimeInput
          name="dateTime"
          placeholder="Date Time"
          value={props.dateTime}
          iconPosition="left"
          onChange={props.handleChange}
          style={{ width: "20vw",}}
          dateTimeFormat="YYYY-MM-DD HH:mm"
        />
        <select
          value={props.newTask.priority}
          onChange={(e) => props.createTask(e)}
          id="priority"
        >
          <option value="#0aa7f5">STANDARD</option>
          <option value="#EDF67D">FIXED DATE</option>
          <option value="#ff006e">EXPEDITE</option>
        </select>
        <button type="submit" className="main-button">
          SUBMIT
        </button>
      </form>
    </div>
  );
};

export default AddTasks;
