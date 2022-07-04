import RandomColor from "./random-color";
import RandomCombination from "./random-animation";
// import MovementRecord from "./movement-tracker";

class RandomBall {
    constructor(){
        this.randomBallLoader = document.querySelector('.random-ball-loader');
        
        if(this.randomBallLoader){
            this.ballsArray = [];
            this.randomColor = RandomColor.prototype;
            this.randomCombination = RandomCombination.prototype;
            // this.movementRecord = MovementRecord.prototype;

            // this.movementTracker;

            this.ballPositions = {};

            this.root = document.documentElement;
            this.test = false;

            this.rgb = {
                r: 0,
                g: 0,
                b: 0
            }

            this.rgbPlaces = Object.keys(this.rgb);

            this.ball = document.querySelector('.balls');
            // this.balls = document.querySelectorAll('.balls');

            this.ballLimit = 40;
            this.ballCounter = 1;
            
            this.targetNumber = 2;
            this.places = 3;

            this.min = 0;
            this.maxV = this.randomBallLoader.clientHeight - this.ball.clientHeight;
            this.maxH = this.randomBallLoader.clientWidth - this.ball.clientWidth;
            // console.log(this.maxH, this.maxV)

            this.isInitialBall = true;

       
          this.events();  
        }      
    }
    events(){ 
        // this.generateNumbers(this.min, this.maxH, this.maxV);
        this.createRandomBall();

        this.randomBallLoader.addEventListener('click', ()=>{
            if(this.ballLimit>0){
                this.ballLimit--
                this.createRandomBall();
                let balls = document.querySelectorAll('.balls');
                let ballsArray = Array.from(balls);
                // let ballsArray = [];
                // ballsArray.push(newBall)

                ballsArray.forEach(b=>{
                    ballsArray.forEach(c=>{
                        //check 
                        c.innerHTML = `left:${b.offsetLeft - c.offsetLeft} top:${b.offsetTop - c.offsetTop} height:${c.clientHeight}`
                        let leftComp = b.offsetLeft - c.offsetLeft;
                        let topComp = b.offsetTop - c.offsetTop;
                        if(b !== c ){
                            console.log(`${b.id}: ${b.offsetLeft}`, c.offsetLeft)
                        }
                    })
                })
            }
        }) 
    }

    createRandomBall(){
        let newBall;
        let leftStart;
        let topStart;
        let leftEnd;
        let topEnd;

        if(this.isInitialBall){
            newBall = this.ball;
            this.isInitialBall = false;
        }else{

            newBall = document.createElement("div")
            this.ballCounter++
            newBall.classList.add('balls');
            newBall.id = `ball${this.ballCounter}`
        }
        // console.log(Math.floor(Math.random()*2))
        let randomNumber = Math.floor(Math.random()*2);

        const vList = [this.maxV, 0];
        const hList = [this.maxH, 0];

        if(randomNumber === 1){
            leftStart = Math.floor(Math.random() * (this.maxH - this.min) + this.min);
            topStart = vList[Math.floor(Math.random()*vList.length)];
            
            leftEnd = hList[Math.floor(Math.random()*hList.length)];
            topEnd = Math.floor(Math.random() * (this.maxV - this.min) + this.min);
        }else{
            leftStart = hList[Math.floor(Math.random()*hList.length)];
            topStart = Math.floor(Math.random() * (this.maxV - this.min) + this.min)

            leftEnd = Math.floor(Math.random() * (this.maxH - this.min) + this.min);
            topEnd = vList[Math.floor(Math.random()*vList.length)];
        }
        // newBall.style.left = leftStart + 'px';
        // newBall.style.top = topStart + 'px';
        // setTimeout(()=>{
            this.randomBallLoader.append(newBall)
  
            this.randomColor.events(newBall);
        
            this.randomCombination.events(newBall, `ball${this.ballCounter}`, leftStart, topStart, leftEnd, topEnd, this.maxH, this.maxV, this.min);
        // }, 300)
        
                    // let balls = document.querySelectorAll('.balls');
                // let ballsArray = Array.from(balls);
                
                this.ballsArray.unshift(newBall)

        // let movementTracker;
        this.ballPositions[newBall.id] = {
            'left': 0,
            'top': 0
        }

        let ballIds = Object.keys(this.ballPositions);
        // console.log(ballIds)

        let interval = 10;
        // console.log(this.movementTracker)
        clearInterval(this.movementTracker)
        
        this.movementTracker = 
        setInterval(()=> {
            this.ballsArray.forEach(b=>{
                
        // balls.forEach(i =>{
            // i.addEventListener('mouseenter', x=>{
            //     console.log(, )
            // })
            
        // })
          
            
                    // if(interval < 15000){
                        // console.log(newBall.id
                        // console.log(this.ballPositions)
                    // for(let id of ballIds){
                        // if(this.ballPositions[b.id] === undefined){
                        //     clearInterval(this.movementTracker)
                        //    return console.log(ballsArray) 
                        // }
                        
                        this.ballPositions[b.id].left = b.offsetLeft;
                        this.ballPositions[b.id].top = b.offsetTop;

                       
                        // if(b.id !== id){

                
                 
                                // if(b.offsetLeft === this.min || b.offsetLeft === this.maxH || b.offsetTop === this.min || b.offsetTop === this.maxV){
                                
                                    // b.remove();
                                    // delete this.ballPositions[b.id]
                                    // // delete this.ballPositions[c.id]
                                    // let index = ballsArray.indexOf(b);
                                    // ballsArray.splice(index, 1)
                                    // console.log(b)

                                    //I think rather than use the second forEach, it's better to do it via keys, excluding the matching one
                                    //Just don't forget to clear the 'collision elements' from the Object, checking after each 'collision'
                                // }
                        //     }
                        // }
                        
                        // ballsArray.forEach(c=>{
                        //     if(b.id !== c.id){
                        //         // console.log(`${b.offsetTop} and ${c.offsetTop}`, `${b.offsetLeft} and ${c.offsetLeft}`)
                        //         // if((b.offsetTop === maxH || b.offsetTop === min || b.offsetTop === maxV || b.offsetLeft === min) && (c.offsetTop === maxH || c.offsetTop === min || c.offsetTop === maxV || c.offsetLeft === min)){
                        //             if(b.offsetTop === c.offsetTop || b.offsetLeft === c.offsetLeft){
                        //                 let index = ballsArray.indexOf(b);
                        //                 let index2 = ballsArray.indexOf(c);
                        //                 // b.remove();
                        //                 // c.remove()
                        //                 ballsArray.splice(index, 1)
                        //                 ballsArray.splice(index2, 1)
            
                        //                 console.log(`${b.id} is ${b.offsetTop} and ${c.id} is ${c.offsetTop}`, `${b.id} is ${b.offsetLeft} and ${c.id} is ${c.offsetLeft}`)
                        //             }
                        //         // }
                        //     }
                        // })
                    // }else{
                    //     clearInterval(this.movementTracker)
                    // } 
            })
                  //grab the dim of the balls and +/-3px(?) to get the collision range
                //have them stop by removing animation, intead of being removed, as better for testing 
                ///so I can fine tune the point of 'convergence'

                        //Start with within 100px and work way down, poss stopping animations instead of removing
            this.ballsArray.forEach(b=>{
                this.ballsArray.forEach(c=>{
                    //check 
                    
                    let leftComp = b.offsetLeft - c.offsetLeft;
                    let topComp = b.offsetTop - c.offsetTop;

                    c.innerHTML = `left:${Math.abs(leftComp)} top:${Math.abs(topComp)} height:${c.clientHeight}`
                    if(b !== c ){
                   
                        // console.log(Math.abs(leftComp), Math.abs(topComp))
                        if(Math.abs(leftComp) < this.ball.clientWidth && Math.abs(topComp)  < this.ball.clientHeight){
                            console.log(b.id, b.offsetLeft, b.offsetTop , c.id, c.offsetLeft, c.offsetLeft)
                            b.remove();
                            c.remove();
                            // delete this.ballPositions[b.id]
                            // delete this.ballPositions[c.id]
                            let indexB = this.ballsArray.indexOf(b);
                            let indexC = this.ballsArray.indexOf(c);
                            this.ballsArray.splice(indexB, 1)
                            this.ballsArray.splice(indexC, 1)
                            // console.log(b.id, this.ballPositions[b.id], c.id, this.ballPositions[c.id])
                        }
                    }
                })
            })
            // interval+= 1000;
        }, interval)
    }

    // generateNumbers(min, maxH, maxV){
    //     let randomNumberLeft = Math.floor(Math.random() * (maxH - min) + min);
    //     let randomNumberTop = Math.floor(Math.random() * (maxV - min) + min);
    //     this.locationLeft = randomNumberLeft;
    //     this.locationTop = randomNumberTop;

    //     this.createRandomBall(randomNumberLeft, randomNumberTop);
    // }
}

export default RandomBall;