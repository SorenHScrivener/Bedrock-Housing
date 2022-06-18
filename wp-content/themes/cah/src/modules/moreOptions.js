class MoreOptions {
    constructor(){
        this.moreOptionsButton = document.querySelectorAll('#more-options');
        this.isMoreOptionsMenuOpen = false;
        this.events();
    }
    events(){
        this.moreOptionsButton.forEach(b=>b.addEventListener('click', ()=>this.moreOptionsMenu()));
    }

    moreOptionsMenu(){
        if(!this.isMoreOptionsMenuOpen){
            this.isMoreOptionsMenuOpen = true;
            return console.log(this.isMoreOptionsMenuOpen);
        }
        this.isMoreOptionsMenuOpen = false;
        console.log(this.isMoreOptionsMenuOpen)
    }
}

export default MoreOptions;