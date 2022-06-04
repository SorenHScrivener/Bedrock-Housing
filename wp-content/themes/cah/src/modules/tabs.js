class Tab{
    constructor(){
        this.width = screen.availWidth;

        this.tabs = document.querySelectorAll('.section-tabs button');
        this.sections = document.querySelectorAll('.section');
        
        // this.searchFilters = document.querySelector('#search-filters');
        // this.propNews = document.querySelector('#propNews');
        this.nonPrimary = document.querySelectorAll('.non-primary');
        console.log(this.nonPrimary)
        this.events();
    }
    events(){
        if(this.width < 1200){
            this.nonPrimary.forEach(n=>n.classList.add('hidden'));
        }

        this.tabs.forEach(t=>t.addEventListener('click', t=> this.toggleSections(t)));
    }

    toggleSections(t){
        const tab = document.querySelector(`#${t.target.id}`);
        const target = document.querySelector(`#${t.target.id.replace('-tab', '')}`);
        // const splitId = t.target.id.replace('-tab', '').split('-');
        // const initials = splitId[0][0] + splitId[1][0];
        // this.allOptions.classList.add(initials);
        this.tabs.forEach(i=>i.classList.remove('activated'));
        tab.classList.add('activated');
        this.sections.forEach(s=>{
            s.classList.add('hidden');
            target.classList.remove('hidden');
        })
    }
}

export default Tab;