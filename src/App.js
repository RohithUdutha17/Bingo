import { useEffect, useState } from 'react';
import './App.css';
import Layout from './layout';
import {io} from 'socket.io-client';
import Loading from './Loading'
import Form from './Form';
import click from './click.mp3'

const randomGenerator = ()=>{
  let arr = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]
  let randomRow = []
  const randomArr = []
  for(let i=0;i<5;i++){
    for(let j=0;j<5;j++){
      const ele =arr[Math.floor(Math.random() * arr.length + 1) - 1]
      arr = arr.filter((element)=>element!=ele)
      randomRow.push(ele)
    }
    randomArr.push(randomRow)
    randomRow = []
  }
  return randomArr;
}

const audio = new Audio(click);
const socket = io.connect("http://localhost:8000");
function App() {
  const defaultMark = [0,0,0,0,0,
                        0,0,0,0,0,
                        0,0,0,0,0,
                        0,0,0,0,0,
                        0,0,0,0,0]

  const [values, setValues] = useState(randomGenerator())
  const [mark,setMark] = useState(defaultMark)
  const [start,setStart] = useState(false)
  const [rowMatch,setRowMatch] = useState([0,0,0,0,0])
  const [columnMatch,setColumnMatch] = useState([0,0,0,0,0])
  const [diagonal,setDiagonal] = useState([0,0])
  const [count,setCount] = useState(0)
  const [isYourTurn,setIsYourTurn] = useState(true)
  const [joinRoom,setJoinRoom] = useState(false)
  const [room,setRoom] = useState(localStorage.getItem('room') != null ?localStorage.getItem('room'):'')
  const [username,setUsername] = useState(localStorage.getItem('username') != null ?localStorage.getItem('username'):'')
  const [winner,setWinner] = useState(false)
  const [exitgame,setExitGame] = useState(false)
  const [opponent,setOpponent] = useState(localStorage.getItem('opponent') != null ?localStorage.getItem('opponent'):'')
  const [opponentResponse,setOpponentResponse] = useState(false)

  const bingo = ['B','BI','BIN','BING','BINGO']
    useEffect(()=>{
      checkForBingo()
    },[mark])

    useEffect(()=>{
      if(count>=5){
        setWinner(true)
        alert(`You won the game`);
        socket.emit("winner",{roomno:room,username:username})
      }
    },[count])

    useEffect(()=>{
      if(room && username){
        socket.emit("join_room",{roomno:room,username:username})
        setJoinRoom(true)
      }
      socket.on("receivemarks",(data=>{
        console.log(data);
          setMark(prevMarks => {
          let dupPrevMarks = [...prevMarks]
          let flag = false;
          for(let i=0;i<5;i++){
            for(let j=0;j<5;j++){
              if(values[i][j] == data.marks){
                dupPrevMarks[i*5+j] = 1;
                flag = true;
                console.log(dupPrevMarks);
                break;
              }
            }
            if(flag) break;
          }
          return dupPrevMarks
        })
        setIsYourTurn(true)
      }))

      socket.on("updatewinner",(data)=>{
        alert(`${data.username} won the game`);
        setExitGame(true)
      })
      
      socket.on('refresh',async(data)=>{
        if(data.count == 2){
          setOpponentResponse(true);
        }
        else{
          if(window.confirm("Opponent wants to play again")){
            await socket.emit('refreshPage',{roomno:room,count:data.count+1})
            window.location.reload(true)
          }else{
            exit()
          }
        }
      })

      socket.on("userConnected",async(data)=>{
        localStorage.setItem('opponent',data.username)
        setOpponent(localStorage.getItem('opponent'))
        setOpponentResponse(true)
        if(data.clients == 1){
          await socket.emit("join_room",{roomno:localStorage.getItem('room'),username:localStorage.getItem('username')})
        }
      })

      socket.on("left_room",(data)=>{
        alert(`${data.username} left the room`)
        leavingRoom()
      })

    },[socket,values])
  
  const checkForBingo = ()=>{
    //Row checking
    let flag = true;
    for(let i=0;i<5;i++){
      flag = true;
      if(rowMatch[i] != 1){
        for(let j=0;j<5;j++){
          if(mark[i*5+j] == 0){
            flag = false;
            break;
          }
        }
        if(flag){
          setMark(prevMark => {
            let dupmark = [...prevMark]
            for(let k=0;k<5;k++){
              dupmark[i*5+k] = 2;
            }
            return dupmark
          })
          setRowMatch(prevRowMatch =>{
            let dupRowMatch = [...prevRowMatch]
            dupRowMatch[i] = 1;
            return dupRowMatch
          })
          setCount(prevCount => prevCount+1)
        } 
      }
    }
    //Column Checking
    flag = true;
    for(let i=0;i<5;i++){
      flag = true;
      if(columnMatch[i] != 1){
        for(let j=0;j<5;j++){
          if(mark[j*5+i] == 0){
            flag = false;
            break;
          }
        }
        if(flag){
          setMark(prevMark => {
            let dupmark = [...prevMark]
            for(let k=0;k<5;k++){
              dupmark[k*5+i] = 2;
            }
            return dupmark
          })
          setColumnMatch(prevColumnMatch => {
            let dupColumnMatch = [...prevColumnMatch]
            dupColumnMatch[i] = 1
            return dupColumnMatch
          })
          setCount(prevCount => prevCount+1)
        } 
      }
    }

    //Left Diagonal Checking
    flag = true;
    if(diagonal[0]!=1){
      for(let i=0;i<5;i++){
        if(mark[i*6] == 0){
          flag = false;
          break;
        }
      }
      if(flag){
        setMark(prevMark => {
          let dupmark = [...prevMark]
          for(let k=0;k<5;k++){
            dupmark[k*6] = 2;
          }
          return dupmark
        })
      
        setDiagonal(prev => {
          let dupDiagonal = [...prev]
          dupDiagonal[0] = 1;
          return dupDiagonal
        })
        setCount(prevCount => prevCount+1)
      } 
    }

    //Right Diagonal Checking
    flag = true;
    if(diagonal[1]!=1){
      for(let i=1;i<=5;i++){
        if(mark[i*4] == 0){
          flag = false;
          break;
        }
      }
      if(flag){
        setMark(prevMark => {
          let dupmark = [...prevMark]
          for(let k=1;k<=5;k++){
            dupmark[k*4] = 2;
          }
          return dupmark
        })
        setDiagonal(prev => {
          let dupDiagonal = [...prev]
          dupDiagonal[1] = 1;
          return dupDiagonal
        })
        setCount(prevCount => prevCount+1)
      } 
    }
  }

  const markData =async (key,data)=>{
    if(isYourTurn){
      audio.play()
      var flag = true;
      let dupPrevMarks = [...mark]
      if(dupPrevMarks[key] == 0){
      setMark(prevMark => {
        let dupPrevMarks = [...prevMark]
        if(dupPrevMarks[key] == 0){
          dupPrevMarks[key] = 1;
          setStart(true)
        }
        else{
          flag = false;
        }
        return dupPrevMarks
      })
      await socket.emit("updatemarks",{marks:data,roomno:room})
    }
    else{
      flag = false;
      alert("Selected number already striked")
    }
    if(flag){
      setIsYourTurn(false)
    }
    }
  }
  
  const reset = ()=>{
    setMark(defaultMark)
    setValues(randomGenerator())
    setStart(false)
    setCount(0) 
    setIsYourTurn(true)
  }
  
console.log(mark);

  const joinRoomHandler = (e)=>{
    if(username != "" && room != ""){
      localStorage.setItem('username',username);
      localStorage.setItem('room',room);
      socket.emit("join_room",{roomno:room,username:username});
      setJoinRoom(true)
    }
    else{
      alert("please provide the details")
    }
  }

  const refresh = async()=>{
    setOpponentResponse(false)
    await socket.emit("refreshPage",{roomno:room,count:1})
    window.location.reload(true)
  }

  
  const exit = async()=>{
    await socket.emit("leave_room",{room:localStorage.getItem('room'),username:localStorage.getItem('username')});
    leavingRoom()
  }

  const leavingRoom = ()=>{
    localStorage.removeItem('room');
    localStorage.removeItem('username');
    localStorage.removeItem('opponent');
    window.location.reload(true)
  }

  const content = opponent ? `${username} and ${opponent} connected` : "waiting for opponent to connect"; 
  return (
    <div className={winner ? 'winner':' App'}>
      {!joinRoom ?
       <Form joinRoomHandler = {joinRoomHandler} setUsername = {setUsername} setRoom = {setRoom}/> : <div><p>{content}</p></div>}
      {opponent && opponentResponse? 
      <div>
        <h1>BINGO</h1>
        <Layout values = {values} mark = {mark} Mark = {markData}/>
        <div>
          <h1>{bingo[count-1]}</h1>
        </div>
        <div>
          <h1>{winner || exitgame ?<form><button type='submit' onClick={refresh}>Play again</button></form> : isYourTurn ? "It's your turn":`${opponent}'s turn`}</h1>
        </div>
        {/* {winner ? <img src={require('./partypop.gif')}></img> : ' '} */}
        {/* <div>
        <button className='btn' onClick={reset} disabled={start!=true?true:false}>Reset</button>
        </div> */}
      </div> : <div>{joinRoom ? <Loading/> : " "}</div>}
      {joinRoom ? <form><button type='submit' onClick={exit}>Exit from this room</button></form>:''}
    </div>
  );
}

export default App;
