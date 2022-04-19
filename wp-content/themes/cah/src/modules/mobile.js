class MobileInterfece {
    constructor(){
        this.nav = document.querySelector('nav');
        this.opened = false;
        this.mobileNavCaller = document.querySelector('#mobile-nav-caller');
        this.events();
    }
    events(){
        // this.mobileNavCaller.addEventListener('click', ()=>this.openNav())
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
}

export default MobileInterfece;