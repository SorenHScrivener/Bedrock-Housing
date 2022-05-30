class MobileInterface {
    constructor(){
        this.html = document.querySelector('html');
        this.nav = document.querySelector('nav');
        this.opened = false;
        this.mobileNavCaller = document.querySelector('#mobile-nav-caller');
        this.formContainer = document.querySelector('#test');
        this.formField = document.querySelectorAll('.form-field');

        // this.clonedFormFieldContainerOverall = document.querySelector('#mobile-typing-container');

        // this.clonedformFieldContainer = this.clonedFormFieldContainerOverall.querySelectorAll('.form-field-container_front');
        // console.log(this.clonedformFieldContainer)
        // this.clonedFormField = this.clonedFormFieldContainerOverall.querySelectorAll('.form-field_front');

        // this.closeFormFieldClone = document.querySelector('#close-front-form');

        if(this.mobileNavCaller){
            this.events();   
        }
    }
    events(){
        this.mobileNavCaller.addEventListener('click', ()=>this.openNav())

        if(window.innerWidth < 500){
            this.formField.forEach(f =>{
                this.html.scrollTo({
                    left: 0, 
                    top: 0,
                    // behavior: 'smooth'
                })
                let target = f.offsetTop;
                let pageTop = this.html.scrollTop;
                let combined = target + pageTop;
                
                let elDistanceToTop = window.pageYOffset + f.getBoundingClientRect().top
                f.addEventListener('focus', ()=>{
                console.log(elDistanceToTop)
                //     console.log(target-(window.innerHeight/2)-100)
                //     console.log(target-(window.innerHeight/2)+(window.innerHeight*.1))
                // console.log(target+(window.innerHeight/2))
                    // if(navigator.userAgent.indexOf("Firefox") != -1 ){
                        this.html.scrollTo({
                            left: 0, 
                            top: elDistanceToTop + target,
                            // behavior: 'smooth'
                        })
                    // }else{
                    //     console.log('not FF')
                    //     this.html.scrollTo({
                    //         left: 0, 
                    //         top: target-(window.innerHeight/2 - (window.innerHeight*.1)),
                    //         behavior: 'smooth'
                    //     })
                    // }
                })
                
            })
            }
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

export default MobileInterface;