import { useEffect, useReducer } from 'react';
import '../App.css';
import Header from './Header';
import { Main } from './Main';
import Loader from './Loader';
import Error from './Error';
import StartScreen from './StartScreen';
import Question from './Question';
import NextButton from './NextButton';
import Progress from './Progress';
import FinishScreen from './FinishScreen';

const initialState = {
questions: [],

  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0
}

function reducer ( state, action){
switch(action.type) {
  case "dataRecieved": 
  return {
    ...state, 
    questions: action.payload,
    status: "ready"
  };
case "dataFailed":
  return {
    ...state, 
    status: 'error'
  };
  case 'start':
    return {
      ...state, 
    status: 'active'
    }
    case "newAnswer":
     const question = state.questions.at(state.index);
      return {
        ...state, 
        answer: action.payload, 
        points: action.payload === question.correctOption ? state.points + question.points : state.points,
      };

      case "nextQuestion":
        return {
          ...state, 
          index: state.index + 1, 
          answer: null 
        };
 
     case "finish":
       return {...state, status: 'finished', 
       highscore: 
       state.points > state.highscore ? state.points :
      state.highscore
      }; 
      case "restart":
      //  const question = state.questions.at(state.index);
       return {
        ...initialState,
        questions: state.questions,
        status: "ready"
      } 
     
  default: 
  throw new Error('Action Unknown')
}
}


function App() {
const  [{ questions, status, index, answer, points, highscore }, dispatch] = useReducer(reducer, initialState);
const numberOfQuestions = questions.length;
const maxPossiblePoints = questions.reduce((prev, cur) => prev + cur.points, 0);

  useEffect( function(){
    fetch("http://localhost:8000/questions")
    .then((res) => res.json())
    .then((data) => dispatch({type: "dataRecieved", payload: data }))
    .catch((err) => dispatch({type: "dataFailed" }))
  }, [])


  return (
    <div className="app">
      <Header />
      
      <Main className='main'>
       {status === "loading" && <Loader />}
       {status === "error" && <Error />}
       {status === "ready" && <StartScreen numberOfQuestions={numberOfQuestions} dispatch={dispatch} />}
       {status === 'active' && ( 
        <>
        <Progress 
        answer={answer}
        index={index} 
        numberOfQuestions={numberOfQuestions} 
        points={points}
        maxPossiblePoints={maxPossiblePoints}
        />
       <Question question={questions[index]} 
       dispatch={dispatch} 
       answer={answer}/>  
       <NextButton dispatch={dispatch} answer={answer} index={index} numberOfQuestions={numberOfQuestions}/>
       </>
       )}

       {status === 'finished' && <FinishScreen 
       points={points}
       dispatch={dispatch}
       maxPossiblePoints={maxPossiblePoints}
       highscore={highscore}
      //  initialState={initialState}
       />}
      </Main>
    </div>
  );
}

export default App;
