import react from 'react'
import './App.css'
const Form = (props)=>{

    const joinRoom = (e)=>{
        props.joinRoomHandler(e)
    }

    return(
        <div className='form'>
            <h1>Let's BINGO</h1>
            <form onSubmit={(e)=>joinRoom(e)}>
                <fieldset>
                    <legend>JOIN ROOM</legend>
                    <input className='input' type='text' placeholder='username' onChange={(e)=>props.setUsername(e.target.value)}></input><br></br>
                    <input className='input' type="text" inputmode="numeric" pattern="[0-9]+" placeholder='room_no in numerics' onChange={(e)=>props.setRoom(e.target.value)}></input><br></br>
                    <button>Join Room</button>
                </fieldset>
            </form>
      </div>
    )
}

export default Form