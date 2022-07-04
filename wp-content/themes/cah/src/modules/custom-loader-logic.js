//modify call on only when loader is called for eachC

class CustomLoaderLogic{
    constructor(){
        // this.events()
    }
    events(){

    }
    setSliderSpeed(){
        const root = document.documentElement;
        const speed = 95;
        const sliderLength = document.querySelector('.slider-track').clientWidth;

        const sliderSpeed = sliderLength/speed;
        console.log(sliderSpeed)

        root.style.setProperty("--slider-speed", `${sliderSpeed}s`);
    }
    randomizeWindowLight(){
        this.windows = document.querySelectorAll('.window');
        let limit = 7;

        const windows = Array.from(this.windows);
        const windowsSeen = windows.filter(e=> e.className.indexOf('unseen') < 0)

        setInterval(()=>{
            for(let i=0; i<limit; i++){
                let randomNumber = Math.floor(Math.random()*windowsSeen.length);
                windowsSeen[randomNumber].classList.add('lit-up');
                setTimeout(()=>{
                    windowsSeen[randomNumber].classList.remove('lit-up');
                }, 1300)
            }
        }, 1300)
    }
}

export default CustomLoaderLogic