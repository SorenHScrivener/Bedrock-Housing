// import RandomAnimation from "./random-animation";
class MovementRecord {
    constructor(){
        this.events();
    }
    events(){   
        
        // let newBallCreated = RandomAnimation.prototype.newBall;

        // this.movementCompiler(ballPositions, newBallCreated);
    }
    movementCompiler(ballPositions, newBall){

        let balls = document.querySelectorAll('.balls');
        let ballsArray = Array.from(balls);
        let movementTracker;
        
        // if(!trackCurrentMovement){
        //     console.log(movementTracker)
        //     clearInterval(movementTracker)
        //     // movementTracker = undefined;
        // }
        
        ballPositions[newBall.id] ={
            'left': 0,
            'top': 0
        }

        let interval = 2000;
        
        clearInterval(movementTracker)
        
        movementTracker = 
        setInterval(()=> {
            ballsArray.forEach(b=>{
                //grab the dim of the balls and +/-3px(?) to get the collision range
            
                    if(interval < 10000){
                        // console.log('red')
                        interval+= 1000;
                        // console.log(ballPositions)
                        ballPositions[b.id].left = b.offsetLeft;
                        ballPositions[b.id].top = b.offsetTop;

                        console.log(ballsArray.length)
                    }
                
            })
        }, interval)

        // ballPositions[newBall.id].left = newBall.offsetLeft;
        // clearInterval(movementTracker)
        console.log(movementTracker)
    }
}

export default MovementRecord;