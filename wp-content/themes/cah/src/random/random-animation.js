class RandomAnimation {
    constructor(){
        // this.events();
    }
    events(newBall, name, leftStart, topStart, leftEnd, topEnd, maxH, maxV, min){

        // this.ballPositions = {};
        this.newBall = newBall
        // this.test()
    

  
        // ballsArray.push(newBall)
        this.head = document.getElementsByTagName('head')[0];
        
        const speed = 20;
        let leftCalc  = leftStart - leftEnd;
        let topCalc = topStart - topEnd;

        let leftCalcSqr = leftCalc**2;
        let topCalcSqr = topCalc**2;
        let total = leftCalcSqr + topCalcSqr;
        let totalComp = Math.floor(Math.sqrt(total)/speed); 

        // console.log(leftStart, leftEnd, Math.abs(leftCalc))
        // console.log(topStart, topEnd, Math.abs(topCalc))
        // console.log(leftCalcSqr, topCalcSqr, total, Math.floor(Math.sqrt(total)), totalComp)

        // let interval = 500;
        
        // let movementTracker = 
        // setInterval(()=> {
        //     ballsArray.forEach(b=>{
        //         //grab the dim of the balls and +/-3px(?) to get the collision range
            
        //             if(interval < 18000){
        //                 // console.log('red')
        //                 interval+= 1000;
        //                 console.log(ballPositions)
        //                 ballPositions[b.id].left = b.offsetLeft;
        //                 ballPositions[b.id].top = b.offsetTop;

        //                 console.log(`${b.id}: ${ballPositions[b.id].left}`, balls, ballsArray)
        //             }
                
        //     })
        // }, interval)
        // if(leftStart > leftEnd){
        //     leftCalc = leftStart - leftEnd;
        // }this.eventslse{
        //     leftCalc = leftEnd - leftStart;
        // }
        //Make move,ent speed constant, no matter the distance
        //Whicever value is higher between start and end is what is subtracted from

        //I think speed should vary after first collision and so forth
        //After which, try basic collision detection by constsntly tracking location of two balls set on converging paths
        // and doing something when get within a certain distance
        //Should I account for zones of contact, along with both angle and speed of both on approach?

        // use ease-in-out for movement instead?
        newBall.style.animation=`${name}ColorShift 1.2s linear infinite alternate, ${name}Movement ${totalComp}s linear forwards`;

        let colorShift = 
        `@keyframes ${name}ColorShift {
            from {
                background-color: var(--first-color);
            }
            
            to {
                background-color: var(--second-color);
            }
        }`;
        let movement =
        `@keyframes ${name}Movement {
            from {
                left: ${leftStart}px;
                top: ${topStart}px;
            }
            
            to {
                left: ${leftEnd}px;
                top: ${topEnd}px;
            }
        }
        `;
        let style = document.querySelector('#random-animations');
        style.append(colorShift);
        style.append(movement)

        // console.log(newBall, name, leftStart, topStart, leftEnd, topEnd)
    }
 
}

export default RandomAnimation