class MobileInterfece {
    constructor(){
        this.nav = document.querySelector('nav');
        this.opened = false;
        this.mobileNavCaller = document.querySelector('#mobile-nav-caller');
        this.formField = document.querySelectorAll('.form-field');

        this.clonedFormFieldContainerOverall = document.querySelector('#mobile-typing-container');

        this.clonedformFieldContainer = this.clonedFormFieldContainerOverall.querySelectorAll('.form-field-container_front');
        console.log(this.clonedformFieldContainer)
        this.clonedFormField = this.clonedFormFieldContainerOverall.querySelectorAll('.form-field_front');

        this.closeFormFieldClone = document.querySelector('#close-front-form');

        if(this.mobileNavCaller){
            this.events();   
        }
    }
    events(){
        this.mobileNavCaller.addEventListener('click', ()=>this.openNav())
        this.formField.forEach((e)=> this.allOptionsPosition(e))

        window.addEventListener('resize', ()=>{
            this.formField.forEach((e)=> this.allOptionsPosition(e))
        })

        this.closeFormFieldClone.addEventListener('click', ()=> this.closeClone());

        this.clonedFormField.forEach(e=> e.addEventListener('keyup', this.simuTyping))
    }

    openNav(){
        if(!this.opened){
            this.nav.classList.add('opened');
            this.opened = true;
        }else{
            this.nav.classList.remove('opened');
            this.opened = false;
        }

    }

    allOptionsPosition(e){
        if(window.innerWidth < 1200){
            e.addEventListener('focusin', this.openClone);
            // this.newsSearchClone.value = e.value; 
            e.blur();
        }else{
            e.removeEventListener('focusin', this.openClone);
        }
    }

    openClone(){
        //necessary to remove the event listener
        console.log(this.id)
        const clonedFormFieldContainerOverall = document.querySelector('#mobile-typing-container');
        let clonedFormFieldContainer = document.querySelector(`#front-form-${this.id}-container`);
        let clonedFormField = clonedFormFieldContainer.querySelector('.form-field_front');
        // const newsSearchClone = newsSearchCloneContainer.querySelector('input');
        clonedFormFieldContainerOverall.classList.add('opened');
        clonedFormFieldContainer.classList.add('opened');
        clonedFormField.focus();
      }

      closeClone(){
        this.clonedformFieldContainer .forEach(e=>{e.classList.remove('opened')})
        this.clonedFormFieldContainerOverall.classList.remove('opened');
      }

      simuTyping(){
        console.log(this.id)
        let origin = document.querySelector(`#${this.id.split('-')[2]}`);
        origin.value = this.value;
      }
}

export default MobileInterfece;