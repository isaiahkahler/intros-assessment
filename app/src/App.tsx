
import React, { MouseEventHandler, useEffect, useState } from 'react';
import { css, jsx } from '@emotion/react'
import moment from 'moment';

interface TodoType {
  item_id: string,
  contents: string,
  timestamp: string,
  last_edited?: string,
  completed: boolean,
}


/** @jsxImportSource @emotion/react */
function App() {

  const [textInput, setTextInput] = useState('');
  const [todos, setTodos] = useState<TodoType[]>([]);


  const updateItems = () => {
    (async () => {
      try {
        const response = await fetch('http://localhost:8888/api/get-items', {
          method: 'get'
        });
        setTodos(await response.json() as TodoType[]);
      } catch (error) {
        alert(`Error while fetching items: ${error}`)
      }
    })();
  }

  useEffect(() => {
    updateItems();
  }, []);

  const handleClick = () => {
    if (!textInput.trim()) return;

    (async () => {
      try {
        await fetch('http://localhost:8888/api/new-item', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            contents: textInput
          })
        });
        setTextInput('');
        updateItems();
      } catch (error) {
        alert(`ERROR while creating your todo: ${error}`)
      }
    })();

  };

  const handleSave = (todo: TodoType) => {
    const { last_edited, timestamp, ...rest } = todo;
    (async () => {
      try {
        await fetch('http://localhost:8888/api/edit-item', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({ ...rest })
        });
        updateItems();
      } catch (error) {
        alert(`ERROR while saving your todo: ${error}`)
      }
    })();
  };

  const handleDelete = (item_id: string) => {
    (async () => {
      try {
        await fetch('http://localhost:8888/api/delete-item', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'DELETE',
          body: JSON.stringify({ item_id })
        });
        updateItems();
      } catch (error) {
        alert(`ERROR while deleting your todo: ${error}`)
      }
    })();
  };

  const handleComplete = (item_id: string) => {
    (async () => {
      try {
        await fetch('http://localhost:8888/api/check-item', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({ item_id })
        });
        updateItems();
      } catch (error) {
        alert(`ERROR while completing todo: ${error}`)
      }
    })();
  }

  return (
    <div css={css`
      min-height: 100vh;
      width: 100%;
      background-color: #f2f2f6;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    `}>
      <h1>Cool Todo List</h1>
      <div css={css`
        background-color: #fff;
        box-shadow: -5px 5px 10px 10px rgba(0,0,0,0.05);
        border-radius: 5px;
        width: 90vw;
        max-width: 680px;
      `}>
        <div css={css`
          padding: 15px;
          display: flex;
          flex-direction: row;
        `}>
          <input type="text" name="name" css={css`
              flex: 1;
            `}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button onClick={() => handleClick()}><h2 css={css`margin: 10px 5px 10px 5px`}>add</h2></button>
        </div>
        <div css={css`padding: 15px; position: relative;`}>
          {todos.sort((a, b) => {
            const a_time = a.last_edited ? a.last_edited : a.timestamp;
            const b_time = b.last_edited ? b.last_edited : b.timestamp;

            if (a_time > b_time) return -1;
            return 1;
          }).sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            return 0;
          }).map(todo => <Todo key={todo.item_id} handleDelete={handleDelete} handleSave={handleSave} handleComplete={handleComplete} todo={todo} />)}
        </div>
      </div>
    </div>
  );
}


interface TodoProps {
  todo: TodoType,
  handleSave: (todo: TodoType) => void,
  handleDelete: (item_id: string) => void,
  handleComplete: (item_id: string) => void,
}

function Todo({ todo, handleDelete, handleSave, handleComplete }: TodoProps) {

  const [editMode, setEditMode] = useState(false);
  const [inputValue, setInputValue] = useState(todo.contents);

  const onEditButtonClick = () => {
    if (editMode) {
      if (inputValue.trim() === todo.contents.trim()) return;
      handleSave({
        ...todo,
        contents: inputValue
      });
      setEditMode(false);
      return;
    }
    setEditMode(!editMode)
  }

  return (
    <div css={css`
      box-shadow: -5px 5px 10px 10px rgba(0,0,0,0.05);
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 15px;
      background-color: #e3e3e8;
      display: flex;
      flex-direction: row;
      color: ${todo.completed ? '#aaa' : "#000"}
      `}
    >
      <div css={css`flex: 1;`}>
        {!editMode && <h2 css={css`margin: 5px 0 5px 0`}>{todo.contents}</h2>}
        {editMode && <input
          css={css`font-size: 1.5em; font-weight: bold;`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />}
        <p css={css`margin: 5px 0 5px 0`}>Created {moment(todo.timestamp).calendar()}</p>
        {todo.last_edited && <p css={css`margin: 5px 0 5px 0`}>Last Edited at {moment(todo.last_edited).calendar()}</p>}
        <div css={css`
          display: flex;
          flex-direction: row;
          align-items: center;
        `}>
          <p css={css`margin-right: 10px`}>{todo.completed ? 'Completed' : 'Complete?'}</p>
          <input type="checkbox" id={todo.item_id} name={todo.item_id} checked={todo.completed} onChange={() => handleComplete(todo.item_id)}></input>
        </div>
      </div>
      <div css={css`display: flex; flex-direction: column;`}>
        <button css={css`
          border-radius: 5px; 
          background-color: #6363ff; 
          border: none; 
          transition: 250ms;
          margin-bottom: 10px;
          &:hover {
            background-color: #4c44a6;
          }
        `} onClick={onEditButtonClick}><p>{editMode ? 'save' : 'edit'}</p></button>
        <button css={css`
          border-radius: 5px; 
          background-color: #d45785; 
          border: none; 
          transition: 250ms;
          &:hover {
            background-color: #b53557;
          }
        `} onClick={() => handleDelete(todo.item_id)}><p>delete</p></button>
      </div>
    </div>
  );
}

export default App;
