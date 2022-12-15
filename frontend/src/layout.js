import react from 'react'
import './App.css'
const Layout = (props) =>{
    const arr = props.values;
    const marked = props.mark;
    let count = 0;
    const markHandler = (event)=>{
        
        props.Mark(event.target.id,event.target.innerHTML);
    }
    
    return(
        <div>
            <table>
                {
                    arr.map((row)=>{
                       return(<tr>{ row.map((ele)=>{
                            return(
                                <td 
                                className={marked[count] == 2 ? 'finish' : marked[count] == 1 ? 'marked' : 'unmarked'} 
                                key={ele}
                                id={count++}
                                onClick = {(event)=>{markHandler(event)}}>{ele}</td>
                            )
                        })}</tr>)
                    })
                }
            </table>
        </div>
    )
}

export default Layout