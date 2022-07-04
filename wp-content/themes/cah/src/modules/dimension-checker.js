import ShadowBox from "./shadowBox";
class DimensionCheck{
    constructor(){
        this.height = screen.availHeight;
        this.width = screen.availWidth;
        // console.log(this.width)

        this.html = document.querySelector('html');
        this.header = document.querySelector('header');
        this.siteLogoText = document.querySelector('#logo-text img');
        // this.footer = document.querySelector('footer');

        // this.darkModeTogglerHeader = document.querySelector('#dark-mode-toggle_header');
        // console.log(this.darkModeTogglerHeader)
        // this.darkModeTogglerFooter = document.querySelector('#dark-mode-toggle_footer');
        this.events();
    }
    events(){
        // console.log(this.width, this.height);
        this.evaluateDimensions();
        screen.orientation.addEventListener("change", ()=>{
            this.height = screen.availHeight;
            this.width = screen.availWidth;
            this.evaluateDimensions()
        })
    }

    evaluateDimensions(){
        if(this.width < 1200){
            this.siteLogoText.src = `${siteData.root_url}/wp-content/themes/cah/images/Logo_cracked2_mobile.png`;
        }
        if(this.height > this.width && this.height > 767 && this.height < 1200){
            this.html.classList.add('tabletPortrait');
            this.html.classList.remove('tabletLandscape');
            this.html.classList.remove('phonePortrait');

            // this.footer.querySelector('#dark-mode-toggle_footer').style.display = "flex";
        }else if(this.height < this.width && this.width > 767 && this.width < 1200){
            this.html.classList.remove('tabletPortrait');
            this.html.classList.add('tabletLandscape');
            this.html.classList.remove('phonePortrait');

            // this.footer.querySelector('#dark-mode-toggle_footer').style.display = "none";
        }
        if(this.height > this.width && this.height < 1200 && this.width < 576){
            this.html.classList.remove('tabletPortrait');
            this.html.classList.remove('tabletLandscape');
            this.html.classList.add('phonePortrait');
            document.querySelector('#more-options').classList.add('togglable');
            
            console.log(ShadowBox.prototype.events)
        }
    }
}

export default DimensionCheck