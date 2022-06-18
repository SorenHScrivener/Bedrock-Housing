import axios from 'axios';
import ShadowBox from './shadowBox';
//The simplicity of this is a chance to try to make my pagination code and code in general cleaner and more efficient
class RelatedNews{
    constructor(){
        if(document.querySelector('#singleContainer')){
            this.newsInfoReciever = document.querySelector('#news-info-reciever');
            this.newsReciever = document.querySelector('#news-reciever');
            this.paginationHolder = document.querySelector('#pagination-holder');
            //interferes with SB. Figure out how to prevent on pages where invalid.
            //Also with all-news if only 1 page
            this.currentPostType = document.querySelector('#singleContainer').dataset.post;
            this.currentPostID = document.querySelector('#singleContainer').dataset.id;
            this.currentPage = 0;
            this.contentShown;
            this.contentPageOptions;
            this.contentLoaded = false;
            this.vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)

            this.thumbnailColumn = document.querySelector('#thumbnail-column');
            this.additionalCount = document.querySelector('#additional-count');
            // this.sections = document.querySelectorAll('.section');
            // console.log(this.sections)
            // this.sectionTabs = document.querySelectorAll('#section-tabs button');
            // console.log(this.sectionTabs)
            this.events();
        }
    }

    events(){
        // this.hideSections();

        // this.sectionTabs.forEach(t=>{
        //     t.addEventListener('click', ()=> {
        //         // this.hideSections();
        //         this.toggleSections(t)
        //     })
        // })
        this.fetchMedia();
        this.fetchRelatedNews();
    }

    async fetchMedia(){
        const posts = await axios.get(siteData.root_url + '/wp-json/cah/v1/media?related');
        const postResults = posts.data;

        const allPosts = postResults[this.currentPostType];
            
        let allMedia;
        const mediaCol = [];
        let mediaColLength = 2;
        let mediaColLimit = mediaColLength; 
        let mediaCount = 0

        allPosts.forEach(post=>{
            if(post.id === parseInt(this.currentPostID)){
                if(this.currentPostType === "property"){
                    allMedia = post.gallery.concat(post.interior, post.buildingPlans, post.floorPlans);
                }else{
                    allMedia = post.gallery;
                }
            }
        })

        allMedia.forEach(media=>{
            mediaCount+=1
            if(mediaColLimit >= 1){
                mediaColLimit-=1;
                mediaCol.push(media);
            }
        })

        let additionalCount = `${mediaCount - mediaColLength}`;
        let additionalCountText = `+${additionalCount}`

        this.populateThumbnailColumn(mediaCol);   

        if(additionalCount>'0'){
            console.log(additionalCount)
            this.additionalCount.innerHTML = `${additionalCountText}`;  
        }
    }

    async fetchRelatedNews(){
        try{
            const related = await axios.get(siteData.root_url + '/wp-json/cah/v1/media?related'); 
            const relatedResults = related.data;

            const allNews = relatedResults.updates.concat(relatedResults.news);
            
            const relatedNews = []; 
            let limit = 1;

            let dataCount = 0;
            let pageCount = 0;

            allNews.sort((a, b) => new Date(a.date) - new Date(b.date));
            allNews.reverse();

            if(!this.contentLoaded){

                allNews.forEach(news =>{
                    news.relationships.forEach(r=>{
                        if(r.ID === parseInt(this.currentPostID)){
                            if(limit <= 2){
                                limit+=1;
                                relatedNews.push(news);
                            }
                        }

                    })
                })

                if(relatedNews.length){      
                    this.contentShown = JSON.parse(JSON.stringify(relatedNews));
                }else{
                    this.contentShown = [];
                }

                this.populatePaginationHolder(dataCount, pageCount);
            }
                this.populateNewsReciever();

                this.newsReciever.scrollTo({
                    left: 0, 
                    top: 0
                })

        }catch(e){
            console.log(e);
        }
    }

    populateNewsReciever(){
        console.log(this.contentShown[this.currentPage])
        this.newsInfoReciever.innerHTML = `
            <h4>${this.contentShown[this.currentPage].title}</h4>
            <p>${this.contentShown[this.currentPage].caption ? `${this.contentShown[this.currentPage].caption} -` : ''} ${this.contentShown[this.currentPage].date}</p>
        `;
        this.newsReciever.innerHTML = `
            <div class="media-card"><img data-post="${this.contentShown[this.currentPage].postTypePlural}" data-id="${this.contentShown[this.currentPage].id}" src="${this.vw >= 1200 ? `${this.contentShown[this.currentPage].gallery[0].image}` : `${this.contentShown[this.currentPage].gallery[0].selectImage}`}"></div>
            <p>${this.contentShown[this.currentPage].fullDescription}</p>
        `;
  
        ShadowBox.prototype.events();
        // console.log(ShadowBox.prototype.mediaLink)
    }

    populatePaginationHolder(dataCount, pageCount){
        this.paginationHolder.innerHTML = `
            ${this.contentShown.length ? '<div class="content-pages">' : ''}
                ${this.contentShown.map((page)=>`
                    ${this.contentShown.length > 1 ? `<a class="content-page" data-page="${dataCount++}"> ${pageCount += 1}</a>` : ''}
                `).join('')} 
            ${this.contentShown.length ? '</div>' : ''} 
        `;

        this.firstPageButton = document.querySelector('.content-page[data-page="0"]');

        if(!this.contentLoaded){
            if(this.firstPageButton){
                this.firstPageButton.classList.add('selectedPage');
            }     
            this.contentPageOptions = document.querySelectorAll('.content-page');
            this.paginationFunctionality();
            this.contentLoaded = true;
        }

    }

    paginationFunctionality(){
        this.contentPageOptions.forEach(el => {
            el.onclick = (e) => {
                let selectedPage = e.currentTarget;

                this.currentPage = parseInt(selectedPage.dataset.page);

                this.fetchRelatedNews()

                this.contentPageOptions.forEach(i =>{ 
                    console.log(i)
                    i.classList.forEach((name)=>{
                        i.classList.remove('selectedPage');
                    })
                })  
                el.classList.add('selectedPage');

            }
        })
    }

    populateThumbnailColumn(imgs){
        console.log(imgs)
        this.thumbnailColumn.innerHTML = `
            ${imgs.map(img=>`
                    <img src="${img.selectImage}">
                `
            ).join('')}
        `
    }
    // hideSections(){
    //     this.sections.forEach(e=> e.style.display="none")
    //     this.sectionTabs.forEach(t=>{
    //         if(t.className.indexOf('active') > -1){
    //             console.log(t)
    //             let target = `#${t.id.replace('-tab', '')}`
    //             console.log(target)
    //             document.querySelector(target).style.display="grid";
    //         }
    //     });
    // }

    // toggleSections(t){
    //     this.sectionTabs.forEach(e=>e.classList.remove('active'));
    //     t.classList.add('active');
    //     this.hideSections();
    //     // let target = `#${t.id.replace('-tab', '')}`
    //     // document.querySelector(target).classList.replace('active', 'hidden');
    // }
}

export default RelatedNews 