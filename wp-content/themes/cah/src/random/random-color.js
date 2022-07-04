class RandomColor {
    constructor(){
        // this.root = document.documentElement;
        // console.log(this.root)

        this.ball = document.querySelector('.initial-ball');

        this.target = this.ball;
        // this.events(this.target);
    }
    events(target){

        this.rgb = {
            r: 0,
            g: 0,
            b: 0
        }

        this.rgbPlaces = Object.keys(this.rgb);
        
        this.targetNumber = 2;
        this.places = 3;
        this.min = 0;
        this.max = 256;

        // this.balls.forEach(b=> this.createRandomColor(this.root))
        // setInterval(()=>{
        //     this.balls.forEach(b=>{
        //         if(this.test){
        //             this.createRandomColor(this.min, this.max);
        //             b.classList.add('dynamic');
        //             b.classList.remove('default');
        //             this.test = false;
        //         }else{
        //             b.classList.remove('dynamic');
        //             b.classList.add('default');
        //             this.test = true;
        //         }
        //     })
        // }, 1250)
        this.createRandomColor(target);
    }

    createRandomColor(target){
        // console.log(target)
        // this.generateNumbers(this.min, this.max);
        const colorVars = ['--first-color', '--second-color'];
        colorVars.forEach(v=>{
            this.generateNumbers(this.max, this.min);
            let colorCode = `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`
            target.style.setProperty(v, colorCode);
            // console.log(colorCode)
        })
        // let firstColor = `rgb(${this.rgb.r}, ${this.rgb.g}, ${this.rgb.b})`
        // this.root.style.setProperty('--first-color', firstColor);

        // let firstColorProp = getComputedStyle(this.root).getPropertyValue('--first-color');

        // console.log(firstColor);
    }

    generateNumbers(max, min){
        //work out way to restrict from too light or dark, as well as colors being too close

        // min = Math.ceil(min);
        // max = Math.floor(max);
        const places = this.places;
        for(let i = 0; i < this.targetNumber; i++){     
            for(let i = 0; i < places; i++){
                let randomNumber = Math.floor(Math.random() * (max - min) + min);
                this.rgb[this.rgbPlaces[i]] = randomNumber;
            }
            // this.createRandomColor();
        }
    }
}

export default RandomColor;